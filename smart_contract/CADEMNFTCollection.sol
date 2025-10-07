// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CADEM NFT Collection
 * @dev ERC-721 NFT contract with royalties, minting fees, and game asset categories
 */
contract CADEMNFTCollection is ERC721, ERC721URIStorage, ERC721Royalty, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // NFT Categories
    enum AssetType { WEAPON, CHARACTER, ITEM, SKIN, ACCESSORY }
    
    // Rarity levels
    enum Rarity { COMMON, UNCOMMON, RARE, EPIC, LEGENDARY }
    
    // NFT metadata structure
    struct NFTMetadata {
        AssetType assetType;
        Rarity rarity;
        uint256 level;
        uint256 power;
        string name;
        address creator;
        uint256 mintTimestamp;
    }
    
    // Mapping from token ID to metadata
    mapping(uint256 => NFTMetadata) public nftMetadata;
    
    // Minting fees by rarity (in wei)
    mapping(Rarity => uint256) public mintingFees;
    
    // Collection statistics
    mapping(AssetType => uint256) public totalMintedByType;
    mapping(Rarity => uint256) public totalMintedByRarity;
    
    // Revenue tracking
    uint256 public totalRevenue;
    uint256 public totalRoyaltiesEarned;
    
    // Minting controls
    bool public publicMintingEnabled = false;
    uint256 public maxSupply = 10000;
    uint256 public maxMintsPerAddress = 10;
    mapping(address => uint256) public mintedByAddress;
    
    // Whitelist for early access
    mapping(address => bool) public whitelist;
    bool public whitelistOnly = true;
    
    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed to,
        AssetType assetType,
        Rarity rarity,
        uint256 mintingFee
    );
    event MintingFeeUpdated(Rarity rarity, uint256 newFee);
    event RoyaltyUpdated(uint256 newRoyalty);
    event RevenueWithdrawn(address indexed to, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        address royaltyReceiver,
        uint96 royaltyFeeNumerator // e.g., 750 for 7.5%
    ) ERC721(name, symbol) {
        // Set default royalty (applies to all tokens)
        _setDefaultRoyalty(royaltyReceiver, royaltyFeeNumerator);
        
        // Initialize minting fees (in wei)
        mintingFees[Rarity.COMMON] = 0.01 ether;
        mintingFees[Rarity.UNCOMMON] = 0.025 ether;
        mintingFees[Rarity.RARE] = 0.05 ether;
        mintingFees[Rarity.EPIC] = 0.1 ether;
        mintingFees[Rarity.LEGENDARY] = 0.25 ether;
    }
    
    /**
     * @dev Mint NFT with specified attributes
     */
    function mintNFT(
        address to,
        string memory uri,
        AssetType assetType,
        Rarity rarity,
        uint256 level,
        uint256 power,
        string memory nftName
    ) external payable nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(_tokenIdCounter.current() < maxSupply, "Max supply reached");
        require(mintedByAddress[to] < maxMintsPerAddress, "Max mints per address reached");
        
        // Check minting permissions
        if (whitelistOnly) {
            require(whitelist[msg.sender] || msg.sender == owner(), "Not whitelisted");
        } else {
            require(publicMintingEnabled || msg.sender == owner(), "Public minting disabled");
        }
        
        // Check minting fee
        uint256 requiredFee = mintingFees[rarity];
        if (msg.sender != owner()) {
            require(msg.value >= requiredFee, "Insufficient minting fee");
        }
        
        // Mint the NFT
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Store metadata
        nftMetadata[tokenId] = NFTMetadata({
            assetType: assetType,
            rarity: rarity,
            level: level,
            power: power,
            name: nftName,
            creator: msg.sender,
            mintTimestamp: block.timestamp
        });
        
        // Update statistics
        totalMintedByType[assetType]++;
        totalMintedByRarity[rarity]++;
        mintedByAddress[to]++;
        
        // Track revenue
        if (msg.value > 0) {
            totalRevenue += msg.value;
        }
        
        emit NFTMinted(tokenId, to, assetType, rarity, msg.value);
        
        // Refund excess payment
        if (msg.value > requiredFee) {
            payable(msg.sender).transfer(msg.value - requiredFee);
        }
    }
    
    /**
     * @dev Batch mint multiple NFTs (owner only)
     */
    function batchMint(
        address[] memory recipients,
        string[] memory uris,
        AssetType[] memory assetTypes,
        Rarity[] memory rarities,
        uint256[] memory levels,
        uint256[] memory powers,
        string[] memory names
    ) external onlyOwner {
        require(recipients.length == uris.length, "Arrays length mismatch");
        require(recipients.length == assetTypes.length, "Arrays length mismatch");
        require(recipients.length == rarities.length, "Arrays length mismatch");
        require(recipients.length == levels.length, "Arrays length mismatch");
        require(recipients.length == powers.length, "Arrays length mismatch");
        require(recipients.length == names.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(_tokenIdCounter.current() < maxSupply, "Max supply reached");
            
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, uris[i]);
            
            nftMetadata[tokenId] = NFTMetadata({
                assetType: assetTypes[i],
                rarity: rarities[i],
                level: levels[i],
                power: powers[i],
                name: names[i],
                creator: msg.sender,
                mintTimestamp: block.timestamp
            });
            
            totalMintedByType[assetTypes[i]]++;
            totalMintedByRarity[rarities[i]]++;
            mintedByAddress[recipients[i]]++;
            
            emit NFTMinted(tokenId, recipients[i], assetTypes[i], rarities[i], 0);
        }
    }
    
    /**
     * @dev Level up an NFT (game mechanics)
     */
    function levelUpNFT(uint256 tokenId, uint256 newLevel, uint256 newPower) external {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender || msg.sender == owner(), "Not authorized");
        require(newLevel > nftMetadata[tokenId].level, "Level must increase");
        
        nftMetadata[tokenId].level = newLevel;
        nftMetadata[tokenId].power = newPower;
    }
    
    /**
     * @dev Owner management functions
     */
    function setMintingFee(Rarity rarity, uint256 fee) external onlyOwner {
        mintingFees[rarity] = fee;
        emit MintingFeeUpdated(rarity, fee);
    }
    
    function setRoyaltyInfo(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
        emit RoyaltyUpdated(feeNumerator);
    }
    
    function setMaxSupply(uint256 newMaxSupply) external onlyOwner {
        require(newMaxSupply >= _tokenIdCounter.current(), "Cannot reduce below current supply");
        maxSupply = newMaxSupply;
    }
    
    function setMaxMintsPerAddress(uint256 newMax) external onlyOwner {
        maxMintsPerAddress = newMax;
    }
    
    function togglePublicMinting() external onlyOwner {
        publicMintingEnabled = !publicMintingEnabled;
    }
    
    function toggleWhitelistOnly() external onlyOwner {
        whitelistOnly = !whitelistOnly;
    }
    
    function addToWhitelist(address[] memory addresses) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            whitelist[addresses[i]] = true;
        }
    }
    
    function removeFromWhitelist(address[] memory addresses) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            whitelist[addresses[i]] = false;
        }
    }
    
    /**
     * @dev Revenue management
     */
    function withdrawRevenue() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No revenue to withdraw");
        
        payable(owner()).transfer(balance);
        emit RevenueWithdrawn(owner(), balance);
    }
    
    function withdrawPartialRevenue(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= address(this).balance, "Insufficient balance");
        
        payable(owner()).transfer(amount);
        emit RevenueWithdrawn(owner(), amount);
    }
    
    /**
     * @dev View functions
     */
    function getNFTMetadata(uint256 tokenId) external view returns (NFTMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return nftMetadata[tokenId];
    }
    
    function getCollectionStats() external view returns (
        uint256 totalSupply,
        uint256 currentSupply,
        uint256 revenue,
        uint256 royalties
    ) {
        return (maxSupply, _tokenIdCounter.current(), totalRevenue, totalRoyaltiesEarned);
    }
    
    function getMintingFees() external view returns (uint256[5] memory fees) {
        fees[0] = mintingFees[Rarity.COMMON];
        fees[1] = mintingFees[Rarity.UNCOMMON];
        fees[2] = mintingFees[Rarity.RARE];
        fees[3] = mintingFees[Rarity.EPIC];
        fees[4] = mintingFees[Rarity.LEGENDARY];
    }
    
    function getTypeStats() external view returns (uint256[5] memory stats) {
        stats[0] = totalMintedByType[AssetType.WEAPON];
        stats[1] = totalMintedByType[AssetType.CHARACTER];
        stats[2] = totalMintedByType[AssetType.ITEM];
        stats[3] = totalMintedByType[AssetType.SKIN];
        stats[4] = totalMintedByType[AssetType.ACCESSORY];
    }
    
    function getRarityStats() external view returns (uint256[5] memory stats) {
        stats[0] = totalMintedByRarity[Rarity.COMMON];
        stats[1] = totalMintedByRarity[Rarity.UNCOMMON];
        stats[2] = totalMintedByRarity[Rarity.RARE];
        stats[3] = totalMintedByRarity[Rarity.EPIC];
        stats[4] = totalMintedByRarity[Rarity.LEGENDARY];
    }
    
    /**
     * @dev Required overrides
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage, ERC721Royalty) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Royalty) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Track royalty payments
     */
    function _feeDenominator() internal pure override returns (uint96) {
        return 10000; // 1% = 100, 10% = 1000
    }
}
