// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CADEM Staking & Rewards Contract
 * @dev Handles token staking, NFT staking, and reward distribution with owner-controlled emissions
 */
contract CADEMStaking is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable cademToken;
    IERC721 public immutable cademNFT;
    
    // Staking pool structure
    struct StakingPool {
        uint256 poolId;
        string name;
        uint256 rewardRate; // Tokens per second per staked token
        uint256 lockPeriod; // Minimum lock period in seconds
        uint256 totalStaked;
        uint256 lastUpdateTime;
        uint256 rewardPerTokenStored;
        bool isActive;
        uint256 maxStakePerUser;
        uint256 poolCap; // Maximum total stake for this pool
    }
    
    // User staking info
    struct UserStake {
        uint256 amount;
        uint256 rewardPerTokenPaid;
        uint256 rewards;
        uint256 stakeTimestamp;
        uint256 lastClaimTime;
    }
    
    // NFT staking info
    struct NFTStake {
        uint256 tokenId;
        address owner;
        uint256 stakeTimestamp;
        uint256 rewardMultiplier; // Based on NFT rarity/type
        uint256 accumulatedRewards;
    }
    
    // Staking pools
    mapping(uint256 => StakingPool) public stakingPools;
    mapping(uint256 => mapping(address => UserStake)) public userStakes;
    
    // NFT staking
    mapping(uint256 => NFTStake) public nftStakes;
    mapping(address => uint256[]) public userStakedNFTs;
    
    // Pool management
    uint256 public nextPoolId = 1;
    uint256[] public activePoolIds;
    
    // Reward emission control (owner revenue model)
    uint256 public totalRewardsEmitted;
    uint256 public maxRewardsPerDay;
    uint256 public ownerRewardShare = 1000; // 10% of emissions go to owner
    uint256 public constant BASIS_POINTS = 10000;
    
    // Treasury staking (owner earns from treasury)
    uint256 public treasuryStakedAmount;
    uint256 public treasuryRewards;
    
    // NFT reward multipliers by rarity
    mapping(uint256 => uint256) public nftRewardMultipliers; // rarity => multiplier
    
    // Events
    event PoolCreated(uint256 indexed poolId, string name, uint256 rewardRate);
    event TokensStaked(address indexed user, uint256 indexed poolId, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 indexed poolId, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 indexed poolId, uint256 amount);
    event NFTStaked(address indexed user, uint256 indexed tokenId, uint256 multiplier);
    event NFTUnstaked(address indexed user, uint256 indexed tokenId, uint256 rewards);
    event EmissionRateUpdated(uint256 newRate);
    event OwnerRewardsWithdrawn(uint256 amount);
    
    constructor(
        address _cademToken,
        address _cademNFT,
        uint256 _maxRewardsPerDay
    ) {
        require(_cademToken != address(0), "Invalid token address");
        require(_cademNFT != address(0), "Invalid NFT address");
        
        cademToken = IERC20(_cademToken);
        cademNFT = IERC721(_cademNFT);
        maxRewardsPerDay = _maxRewardsPerDay;
        
        // Initialize NFT reward multipliers (basis points)
        nftRewardMultipliers[0] = 11000; // Common: 110% (10% bonus)
        nftRewardMultipliers[1] = 12500; // Uncommon: 125% (25% bonus)
        nftRewardMultipliers[2] = 15000; // Rare: 150% (50% bonus)
        nftRewardMultipliers[3] = 20000; // Epic: 200% (100% bonus)
        nftRewardMultipliers[4] = 30000; // Legendary: 300% (200% bonus)
        
        // Create default staking pools
        _createPool("Flexible Staking", 100, 0, 0, type(uint256).max); // 100 tokens/second, no lock
        _createPool("30-Day Lock", 200, 30 days, 0, type(uint256).max); // 200 tokens/second, 30 day lock
        _createPool("90-Day Lock", 400, 90 days, 0, type(uint256).max); // 400 tokens/second, 90 day lock
        _createPool("1-Year Lock", 1000, 365 days, 0, type(uint256).max); // 1000 tokens/second, 1 year lock
    }
    
    /**
     * @dev Create a new staking pool
     */
    function createPool(
        string memory name,
        uint256 rewardRate,
        uint256 lockPeriod,
        uint256 maxStakePerUser,
        uint256 poolCap
    ) external onlyOwner {
        _createPool(name, rewardRate, lockPeriod, maxStakePerUser, poolCap);
    }
    
    function _createPool(
        string memory name,
        uint256 rewardRate,
        uint256 lockPeriod,
        uint256 maxStakePerUser,
        uint256 poolCap
    ) internal {
        uint256 poolId = nextPoolId++;
        
        stakingPools[poolId] = StakingPool({
            poolId: poolId,
            name: name,
            rewardRate: rewardRate,
            lockPeriod: lockPeriod,
            totalStaked: 0,
            lastUpdateTime: block.timestamp,
            rewardPerTokenStored: 0,
            isActive: true,
            maxStakePerUser: maxStakePerUser,
            poolCap: poolCap
        });
        
        activePoolIds.push(poolId);
        emit PoolCreated(poolId, name, rewardRate);
    }
    
    /**
     * @dev Stake tokens in a specific pool
     */
    function stakeTokens(uint256 poolId, uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot stake 0 tokens");
        require(stakingPools[poolId].isActive, "Pool not active");
        
        StakingPool storage pool = stakingPools[poolId];
        UserStake storage userStake = userStakes[poolId][msg.sender];
        
        // Check pool limits
        require(pool.totalStaked + amount <= pool.poolCap, "Pool cap exceeded");
        if (pool.maxStakePerUser > 0) {
            require(userStake.amount + amount <= pool.maxStakePerUser, "User stake limit exceeded");
        }
        
        // Update pool rewards
        _updatePool(poolId);
        
        // Claim pending rewards
        if (userStake.amount > 0) {
            _claimRewards(poolId, msg.sender);
        }
        
        // Transfer tokens
        cademToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update user stake
        userStake.amount += amount;
        userStake.stakeTimestamp = block.timestamp;
        userStake.rewardPerTokenPaid = pool.rewardPerTokenStored;
        
        // Update pool totals
        pool.totalStaked += amount;
        
        emit TokensStaked(msg.sender, poolId, amount);
    }
    
    /**
     * @dev Unstake tokens from a specific pool
     */
    function unstakeTokens(uint256 poolId, uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot unstake 0 tokens");
        
        StakingPool storage pool = stakingPools[poolId];
        UserStake storage userStake = userStakes[poolId][msg.sender];
        
        require(userStake.amount >= amount, "Insufficient staked amount");
        require(
            block.timestamp >= userStake.stakeTimestamp + pool.lockPeriod,
            "Tokens still locked"
        );
        
        // Update pool rewards
        _updatePool(poolId);
        
        // Claim pending rewards
        _claimRewards(poolId, msg.sender);
        
        // Update user stake
        userStake.amount -= amount;
        userStake.rewardPerTokenPaid = pool.rewardPerTokenStored;
        
        // Update pool totals
        pool.totalStaked -= amount;
        
        // Transfer tokens back
        cademToken.safeTransfer(msg.sender, amount);
        
        emit TokensUnstaked(msg.sender, poolId, amount);
    }
    
    /**
     * @dev Claim rewards from a specific pool
     */
    function claimRewards(uint256 poolId) external nonReentrant {
        _updatePool(poolId);
        _claimRewards(poolId, msg.sender);
    }
    
    function _claimRewards(uint256 poolId, address user) internal {
        UserStake storage userStake = userStakes[poolId][user];
        uint256 reward = _calculateRewards(poolId, user);
        
        if (reward > 0) {
            userStake.rewards = 0;
            userStake.rewardPerTokenPaid = stakingPools[poolId].rewardPerTokenStored;
            userStake.lastClaimTime = block.timestamp;
            
            // Owner gets a share of emissions
            uint256 ownerShare = (reward * ownerRewardShare) / BASIS_POINTS;
            uint256 userReward = reward - ownerShare;
            
            totalRewardsEmitted += reward;
            treasuryRewards += ownerShare;
            
            cademToken.safeTransfer(user, userReward);
            emit RewardsClaimed(user, poolId, userReward);
        }
    }
    
    /**
     * @dev Stake NFT for additional rewards
     */
    function stakeNFT(uint256 tokenId) external nonReentrant whenNotPaused {
        require(cademNFT.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(nftStakes[tokenId].owner == address(0), "NFT already staked");
        
        // Get NFT rarity for multiplier (assuming rarity is stored in metadata)
        // This would need to interface with your NFT contract's metadata
        uint256 rarity = 0; // Default to common, implement getNFTRarity(tokenId) in NFT contract
        uint256 multiplier = nftRewardMultipliers[rarity];
        
        // Transfer NFT to contract
        cademNFT.transferFrom(msg.sender, address(this), tokenId);
        
        // Record stake
        nftStakes[tokenId] = NFTStake({
            tokenId: tokenId,
            owner: msg.sender,
            stakeTimestamp: block.timestamp,
            rewardMultiplier: multiplier,
            accumulatedRewards: 0
        });
        
        userStakedNFTs[msg.sender].push(tokenId);
        
        emit NFTStaked(msg.sender, tokenId, multiplier);
    }
    
    /**
     * @dev Unstake NFT and claim accumulated rewards
     */
    function unstakeNFT(uint256 tokenId) external nonReentrant {
        NFTStake storage nftStake = nftStakes[tokenId];
        require(nftStake.owner == msg.sender, "Not NFT owner");
        
        // Calculate NFT rewards
        uint256 rewards = _calculateNFTRewards(tokenId);
        
        // Remove from user's staked NFTs array
        _removeFromUserNFTs(msg.sender, tokenId);
        
        // Clear stake record
        delete nftStakes[tokenId];
        
        // Transfer NFT back
        cademNFT.transferFrom(address(this), msg.sender, tokenId);
        
        // Transfer rewards if any
        if (rewards > 0) {
            uint256 ownerShare = (rewards * ownerRewardShare) / BASIS_POINTS;
            uint256 userReward = rewards - ownerShare;
            
            treasuryRewards += ownerShare;
            cademToken.safeTransfer(msg.sender, userReward);
        }
        
        emit NFTUnstaked(msg.sender, tokenId, rewards);
    }
    
    /**
     * @dev Owner functions for managing emissions and treasury
     */
    function stakeTreasuryTokens(uint256 amount) external onlyOwner {
        require(amount > 0, "Cannot stake 0 tokens");
        
        cademToken.safeTransferFrom(msg.sender, address(this), amount);
        treasuryStakedAmount += amount;
        
        // Treasury earns from the highest reward pool
        emit TokensStaked(msg.sender, 4, amount); // Assuming pool 4 is highest reward
    }
    
    function withdrawTreasuryRewards() external onlyOwner nonReentrant {
        require(treasuryRewards > 0, "No treasury rewards");
        
        uint256 amount = treasuryRewards;
        treasuryRewards = 0;
        
        cademToken.safeTransfer(owner(), amount);
        emit OwnerRewardsWithdrawn(amount);
    }
    
    function updateEmissionRate(uint256 poolId, uint256 newRate) external onlyOwner {
        require(stakingPools[poolId].isActive, "Pool not active");
        
        _updatePool(poolId);
        stakingPools[poolId].rewardRate = newRate;
        
        emit EmissionRateUpdated(newRate);
    }
    
    function updateOwnerRewardShare(uint256 newShare) external onlyOwner {
        require(newShare <= 2000, "Owner share too high"); // Max 20%
        ownerRewardShare = newShare;
    }
    
    function setPoolStatus(uint256 poolId, bool isActive) external onlyOwner {
        stakingPools[poolId].isActive = isActive;
    }
    
    function updateNFTMultipliers(uint256[] memory rarities, uint256[] memory multipliers) external onlyOwner {
        require(rarities.length == multipliers.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < rarities.length; i++) {
            nftRewardMultipliers[rarities[i]] = multipliers[i];
        }
    }
    
    /**
     * @dev Internal helper functions
     */
    function _updatePool(uint256 poolId) internal {
        StakingPool storage pool = stakingPools[poolId];
        
        if (pool.totalStaked == 0) {
            pool.lastUpdateTime = block.timestamp;
            return;
        }
        
        uint256 timeElapsed = block.timestamp - pool.lastUpdateTime;
        uint256 reward = timeElapsed * pool.rewardRate;
        
        pool.rewardPerTokenStored += (reward * 1e18) / pool.totalStaked;
        pool.lastUpdateTime = block.timestamp;
    }
    
    function _calculateRewards(uint256 poolId, address user) internal view returns (uint256) {
        StakingPool storage pool = stakingPools[poolId];
        UserStake storage userStake = userStakes[poolId][user];
        
        uint256 rewardPerToken = pool.rewardPerTokenStored;
        
        if (pool.totalStaked > 0) {
            uint256 timeElapsed = block.timestamp - pool.lastUpdateTime;
            uint256 reward = timeElapsed * pool.rewardRate;
            rewardPerToken += (reward * 1e18) / pool.totalStaked;
        }
        
        return userStake.amount * (rewardPerToken - userStake.rewardPerTokenPaid) / 1e18 + userStake.rewards;
    }
    
    function _calculateNFTRewards(uint256 tokenId) internal view returns (uint256) {
        NFTStake storage nftStake = nftStakes[tokenId];
        
        uint256 timeStaked = block.timestamp - nftStake.stakeTimestamp;
        uint256 baseReward = timeStaked * 10; // Base 10 tokens per second
        
        return (baseReward * nftStake.rewardMultiplier) / BASIS_POINTS;
    }
    
    function _removeFromUserNFTs(address user, uint256 tokenId) internal {
        uint256[] storage userNFTs = userStakedNFTs[user];
        for (uint256 i = 0; i < userNFTs.length; i++) {
            if (userNFTs[i] == tokenId) {
                userNFTs[i] = userNFTs[userNFTs.length - 1];
                userNFTs.pop();
                break;
            }
        }
    }
    
    /**
     * @dev View functions
     */
    function getUserStakeInfo(uint256 poolId, address user) external view returns (
        uint256 stakedAmount,
        uint256 pendingRewards,
        uint256 lockTimeRemaining
    ) {
        UserStake storage userStake = userStakes[poolId][user];
        StakingPool storage pool = stakingPools[poolId];
        
        stakedAmount = userStake.amount;
        pendingRewards = _calculateRewards(poolId, user);
        
        uint256 unlockTime = userStake.stakeTimestamp + pool.lockPeriod;
        lockTimeRemaining = unlockTime > block.timestamp ? unlockTime - block.timestamp : 0;
    }
    
    function getPoolInfo(uint256 poolId) external view returns (StakingPool memory) {
        return stakingPools[poolId];
    }
    
    function getUserStakedNFTs(address user) external view returns (uint256[] memory) {
        return userStakedNFTs[user];
    }
    
    function getTreasuryInfo() external view returns (uint256 staked, uint256 rewards) {
        return (treasuryStakedAmount, treasuryRewards);
    }
    
    /**
     * @dev Emergency functions
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
