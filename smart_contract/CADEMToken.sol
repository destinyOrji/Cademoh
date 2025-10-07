// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CADEM Token
 * @dev ERC-20 token with transaction taxes and owner revenue model
 */
contract CADEMToken is ERC20, Ownable, ReentrancyGuard {
    // Tax configuration
    uint256 public buyTax = 300; // 3% (300 basis points)
    uint256 public sellTax = 500; // 5% (500 basis points)
    uint256 public transferTax = 200; // 2% (200 basis points)
    uint256 public constant MAX_TAX = 1000; // 10% maximum tax
    uint256 public constant BASIS_POINTS = 10000; // 100% = 10000 basis points
    
    // Revenue distribution
    uint256 public ownerShare = 7000; // 70% to owner
    uint256 public holderShare = 3000; // 30% redistributed to holders
    
    // Wallets
    address public treasuryWallet;
    address public teamWallet;
    address public ecosystemWallet;
    
    // Tax exemptions
    mapping(address => bool) public isExemptFromTax;
    
    // DEX pairs for buy/sell detection
    mapping(address => bool) public isDEXPair;
    
    // Holder rewards tracking
    mapping(address => uint256) public lastRewardClaim;
    uint256 public totalRewardsDistributed;
    uint256 public rewardPool;
    
    // Events
    event TaxUpdated(uint256 buyTax, uint256 sellTax, uint256 transferTax);
    event RevenueDistributed(uint256 ownerAmount, uint256 holderAmount);
    event RewardsClaimed(address indexed holder, uint256 amount);
    event DEXPairUpdated(address indexed pair, bool status);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address _treasuryWallet,
        address _teamWallet,
        address _ecosystemWallet
    ) ERC20(name, symbol) {
        require(_treasuryWallet != address(0), "Invalid treasury wallet");
        require(_teamWallet != address(0), "Invalid team wallet");
        require(_ecosystemWallet != address(0), "Invalid ecosystem wallet");
        
        treasuryWallet = _treasuryWallet;
        teamWallet = _teamWallet;
        ecosystemWallet = _ecosystemWallet;
        
        // Initial token distribution
        uint256 ownerAllocation = (totalSupply * 2000) / BASIS_POINTS; // 20% to owner
        uint256 treasuryAllocation = (totalSupply * 1500) / BASIS_POINTS; // 15% to treasury
        uint256 teamAllocation = (totalSupply * 1000) / BASIS_POINTS; // 10% to team
        uint256 ecosystemAllocation = (totalSupply * 1500) / BASIS_POINTS; // 15% to ecosystem
        uint256 publicAllocation = totalSupply - ownerAllocation - treasuryAllocation - teamAllocation - ecosystemAllocation; // 40% for public
        
        _mint(owner(), ownerAllocation);
        _mint(treasuryWallet, treasuryAllocation);
        _mint(teamWallet, teamAllocation);
        _mint(ecosystemWallet, ecosystemAllocation);
        _mint(owner(), publicAllocation); // Owner controls public distribution
        
        // Exempt system wallets from tax
        isExemptFromTax[owner()] = true;
        isExemptFromTax[treasuryWallet] = true;
        isExemptFromTax[teamWallet] = true;
        isExemptFromTax[ecosystemWallet] = true;
        isExemptFromTax[address(this)] = true;
    }
    
    /**
     * @dev Override transfer to implement tax system
     */
    function _transfer(address from, address to, uint256 amount) internal override {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        
        // Check if tax should be applied
        bool takeTax = !isExemptFromTax[from] && !isExemptFromTax[to];
        
        if (takeTax && amount > 0) {
            uint256 taxAmount = _calculateTax(from, to, amount);
            
            if (taxAmount > 0) {
                // Distribute tax revenue
                uint256 ownerAmount = (taxAmount * ownerShare) / BASIS_POINTS;
                uint256 holderAmount = taxAmount - ownerAmount;
                
                // Transfer tax to contract for distribution
                super._transfer(from, address(this), taxAmount);
                
                // Send owner share to treasury
                if (ownerAmount > 0) {
                    super._transfer(address(this), treasuryWallet, ownerAmount);
                }
                
                // Add to reward pool for holders
                if (holderAmount > 0) {
                    rewardPool += holderAmount;
                }
                
                emit RevenueDistributed(ownerAmount, holderAmount);
                
                // Transfer remaining amount
                amount -= taxAmount;
            }
        }
        
        super._transfer(from, to, amount);
    }
    
    /**
     * @dev Calculate tax based on transaction type
     */
    function _calculateTax(address from, address to, uint256 amount) internal view returns (uint256) {
        uint256 taxRate;
        
        if (isDEXPair[from]) {
            // Buy transaction
            taxRate = buyTax;
        } else if (isDEXPair[to]) {
            // Sell transaction
            taxRate = sellTax;
        } else {
            // Regular transfer
            taxRate = transferTax;
        }
        
        return (amount * taxRate) / BASIS_POINTS;
    }
    
    /**
     * @dev Claim holder rewards based on token balance
     */
    function claimRewards() external nonReentrant {
        require(balanceOf(msg.sender) > 0, "No tokens held");
        require(rewardPool > 0, "No rewards available");
        
        uint256 holderBalance = balanceOf(msg.sender);
        uint256 totalSupplyExcludingContract = totalSupply() - balanceOf(address(this));
        
        // Calculate proportional reward
        uint256 reward = (rewardPool * holderBalance) / totalSupplyExcludingContract;
        
        if (reward > 0 && reward <= rewardPool) {
            rewardPool -= reward;
            totalRewardsDistributed += reward;
            lastRewardClaim[msg.sender] = block.timestamp;
            
            super._transfer(address(this), msg.sender, reward);
            emit RewardsClaimed(msg.sender, reward);
        }
    }
    
    /**
     * @dev Owner functions for tax management
     */
    function updateTaxRates(uint256 _buyTax, uint256 _sellTax, uint256 _transferTax) external onlyOwner {
        require(_buyTax <= MAX_TAX && _sellTax <= MAX_TAX && _transferTax <= MAX_TAX, "Tax too high");
        
        buyTax = _buyTax;
        sellTax = _sellTax;
        transferTax = _transferTax;
        
        emit TaxUpdated(_buyTax, _sellTax, _transferTax);
    }
    
    function updateRevenueDistribution(uint256 _ownerShare, uint256 _holderShare) external onlyOwner {
        require(_ownerShare + _holderShare == BASIS_POINTS, "Shares must equal 100%");
        
        ownerShare = _ownerShare;
        holderShare = _holderShare;
    }
    
    function setTaxExemption(address account, bool exempt) external onlyOwner {
        isExemptFromTax[account] = exempt;
    }
    
    function setDEXPair(address pair, bool status) external onlyOwner {
        isDEXPair[pair] = status;
        emit DEXPairUpdated(pair, status);
    }
    
    function updateWallets(address _treasury, address _team, address _ecosystem) external onlyOwner {
        require(_treasury != address(0) && _team != address(0) && _ecosystem != address(0), "Invalid addresses");
        
        treasuryWallet = _treasury;
        teamWallet = _team;
        ecosystemWallet = _ecosystem;
    }
    
    /**
     * @dev Emergency functions
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = balanceOf(address(this));
        if (balance > 0) {
            super._transfer(address(this), owner(), balance);
        }
    }
    
    /**
     * @dev View functions
     */
    function getRewardInfo(address holder) external view returns (uint256 pendingReward, uint256 lastClaim) {
        if (balanceOf(holder) == 0 || rewardPool == 0) {
            return (0, lastRewardClaim[holder]);
        }
        
        uint256 holderBalance = balanceOf(holder);
        uint256 totalSupplyExcludingContract = totalSupply() - balanceOf(address(this));
        uint256 reward = (rewardPool * holderBalance) / totalSupplyExcludingContract;
        
        return (reward, lastRewardClaim[holder]);
    }
    
    function getTaxInfo() external view returns (uint256, uint256, uint256, uint256, uint256) {
        return (buyTax, sellTax, transferTax, ownerShare, holderShare);
    }
}
