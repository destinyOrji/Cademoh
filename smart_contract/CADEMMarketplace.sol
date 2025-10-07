// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title CADEM NFT Marketplace
 * @dev Marketplace for trading NFTs with owner revenue model through fees
 */
contract CADEMMarketplace is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    IERC721 public immutable cademNFT;
    IERC20 public immutable cademToken;
    
    // Listing structure
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isActive;
        uint256 listingTime;
        uint256 expirationTime;
        bool isAuction;
        uint256 highestBid;
        address highestBidder;
        uint256 auctionEndTime;
    }
    
    // Offer structure
    struct Offer {
        uint256 tokenId;
        address buyer;
        uint256 amount;
        uint256 expiration;
        bool isActive;
    }
    
    // Fee structure
    struct FeeConfig {
        uint256 tradingFee; // Basis points (e.g., 250 = 2.5%)
        uint256 listingFee; // Fixed fee in CADEM tokens
        uint256 featuredListingFee; // Extra fee for featured listings
        uint256 auctionFee; // Additional fee for auctions
    }
    
    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer[]) public offers;
    mapping(uint256 => bool) public featuredListings;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256) public userTradingVolume;
    
    // State variables
    FeeConfig public feeConfig;
    uint256 public nextListingId = 1;
    uint256 public totalTradingVolume;
    uint256 public totalFeesCollected;
    uint256 public totalRoyaltiesPaid;
    
    // Featured listings management
    uint256 public maxFeaturedListings = 10;
    uint256[] public featuredListingIds;
    
    // Constants
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_TRADING_FEE = 1000; // 10% max
    uint256 public constant MIN_AUCTION_DURATION = 1 hours;
    uint256 public constant MAX_AUCTION_DURATION = 30 days;
    
    // Events
    event ItemListed(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        bool isAuction
    );
    event ItemSold(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller,
        address buyer,
        uint256 price,
        uint256 fee,
        uint256 royalty
    );
    event ListingCancelled(uint256 indexed listingId, uint256 indexed tokenId);
    event OfferMade(uint256 indexed tokenId, address indexed buyer, uint256 amount);
    event OfferAccepted(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 amount);
    event BidPlaced(uint256 indexed listingId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed listingId, address indexed winner, uint256 amount);
    event FeesUpdated(uint256 tradingFee, uint256 listingFee, uint256 featuredFee, uint256 auctionFee);
    event FeesWithdrawn(address indexed to, uint256 amount);
    event FeaturedListingAdded(uint256 indexed listingId);
    
    constructor(
        address _cademNFT,
        address _cademToken,
        uint256 _tradingFee,
        uint256 _listingFee,
        uint256 _featuredListingFee,
        uint256 _auctionFee
    ) {
        require(_cademNFT != address(0), "Invalid NFT address");
        require(_cademToken != address(0), "Invalid token address");
        require(_tradingFee <= MAX_TRADING_FEE, "Trading fee too high");
        
        cademNFT = IERC721(_cademNFT);
        cademToken = IERC20(_cademToken);
        
        feeConfig = FeeConfig({
            tradingFee: _tradingFee,
            listingFee: _listingFee,
            featuredListingFee: _featuredListingFee,
            auctionFee: _auctionFee
        });
    }
    
    /**
     * @dev List an NFT for sale
     */
    function listItem(
        uint256 tokenId,
        uint256 price,
        uint256 duration,
        bool makeFeatured
    ) external payable nonReentrant whenNotPaused {
        require(cademNFT.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(cademNFT.getApproved(tokenId) == address(this) || 
                cademNFT.isApprovedForAll(msg.sender, address(this)), "Not approved");
        require(price > 0, "Price must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        
        // Calculate required fees
        uint256 totalFee = feeConfig.listingFee;
        if (makeFeatured) {
            require(featuredListingIds.length < maxFeaturedListings, "Too many featured listings");
            totalFee += feeConfig.featuredListingFee;
        }
        
        // Collect listing fee
        if (totalFee > 0) {
            cademToken.safeTransferFrom(msg.sender, address(this), totalFee);
            totalFeesCollected += totalFee;
        }
        
        uint256 listingId = nextListingId++;
        uint256 expirationTime = block.timestamp + duration;
        
        listings[listingId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isActive: true,
            listingTime: block.timestamp,
            expirationTime: expirationTime,
            isAuction: false,
            highestBid: 0,
            highestBidder: address(0),
            auctionEndTime: 0
        });
        
        userListings[msg.sender].push(listingId);
        
        if (makeFeatured) {
            featuredListings[listingId] = true;
            featuredListingIds.push(listingId);
            emit FeaturedListingAdded(listingId);
        }
        
        emit ItemListed(listingId, tokenId, msg.sender, price, false);
    }
    
    /**
     * @dev Create an auction listing
     */
    function createAuction(
        uint256 tokenId,
        uint256 startingPrice,
        uint256 duration,
        bool makeFeatured
    ) external payable nonReentrant whenNotPaused {
        require(cademNFT.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(cademNFT.getApproved(tokenId) == address(this) || 
                cademNFT.isApprovedForAll(msg.sender, address(this)), "Not approved");
        require(startingPrice > 0, "Starting price must be greater than 0");
        require(duration >= MIN_AUCTION_DURATION && duration <= MAX_AUCTION_DURATION, "Invalid duration");
        
        // Calculate required fees
        uint256 totalFee = feeConfig.listingFee + feeConfig.auctionFee;
        if (makeFeatured) {
            require(featuredListingIds.length < maxFeaturedListings, "Too many featured listings");
            totalFee += feeConfig.featuredListingFee;
        }
        
        // Collect fees
        if (totalFee > 0) {
            cademToken.safeTransferFrom(msg.sender, address(this), totalFee);
            totalFeesCollected += totalFee;
        }
        
        uint256 listingId = nextListingId++;
        uint256 auctionEndTime = block.timestamp + duration;
        
        listings[listingId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: startingPrice,
            isActive: true,
            listingTime: block.timestamp,
            expirationTime: auctionEndTime,
            isAuction: true,
            highestBid: 0,
            highestBidder: address(0),
            auctionEndTime: auctionEndTime
        });
        
        userListings[msg.sender].push(listingId);
        
        if (makeFeatured) {
            featuredListings[listingId] = true;
            featuredListingIds.push(listingId);
            emit FeaturedListingAdded(listingId);
        }
        
        emit ItemListed(listingId, tokenId, msg.sender, startingPrice, true);
    }
    
    /**
     * @dev Buy an NFT directly
     */
    function buyItem(uint256 listingId) external nonReentrant whenNotPaused {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(!listing.isAuction, "Cannot buy auction item directly");
        require(block.timestamp <= listing.expirationTime, "Listing expired");
        require(msg.sender != listing.seller, "Cannot buy own item");
        
        uint256 totalPrice = listing.price;
        uint256 tradingFee = (totalPrice * feeConfig.tradingFee) / BASIS_POINTS;
        
        // Handle royalties
        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);
        
        if (IERC165(address(cademNFT)).supportsInterface(type(IERC2981).interfaceId)) {
            (royaltyReceiver, royaltyAmount) = IERC2981(address(cademNFT)).royaltyInfo(listing.tokenId, totalPrice);
        }
        
        uint256 sellerAmount = totalPrice - tradingFee - royaltyAmount;
        
        // Transfer payment
        cademToken.safeTransferFrom(msg.sender, listing.seller, sellerAmount);
        
        if (tradingFee > 0) {
            cademToken.safeTransferFrom(msg.sender, address(this), tradingFee);
            totalFeesCollected += tradingFee;
        }
        
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            cademToken.safeTransferFrom(msg.sender, royaltyReceiver, royaltyAmount);
            totalRoyaltiesPaid += royaltyAmount;
        }
        
        // Transfer NFT
        cademNFT.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);
        
        // Update statistics
        totalTradingVolume += totalPrice;
        userTradingVolume[msg.sender] += totalPrice;
        userTradingVolume[listing.seller] += totalPrice;
        
        // Deactivate listing
        listing.isActive = false;
        _removeFeaturedListing(listingId);
        
        emit ItemSold(listingId, listing.tokenId, listing.seller, msg.sender, totalPrice, tradingFee, royaltyAmount);
    }
    
    /**
     * @dev Place a bid on an auction
     */
    function placeBid(uint256 listingId, uint256 bidAmount) external nonReentrant whenNotPaused {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.isAuction, "Not an auction");
        require(block.timestamp <= listing.auctionEndTime, "Auction ended");
        require(msg.sender != listing.seller, "Cannot bid on own auction");
        require(bidAmount > listing.highestBid, "Bid too low");
        require(bidAmount >= listing.price, "Bid below starting price");
        
        // Refund previous highest bidder
        if (listing.highestBidder != address(0)) {
            cademToken.safeTransfer(listing.highestBidder, listing.highestBid);
        }
        
        // Transfer new bid amount
        cademToken.safeTransferFrom(msg.sender, address(this), bidAmount);
        
        // Update auction state
        listing.highestBid = bidAmount;
        listing.highestBidder = msg.sender;
        
        emit BidPlaced(listingId, msg.sender, bidAmount);
    }
    
    /**
     * @dev End an auction and transfer NFT to winner
     */
    function endAuction(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.isAuction, "Not an auction");
        require(block.timestamp > listing.auctionEndTime, "Auction still active");
        
        if (listing.highestBidder != address(0)) {
            uint256 totalPrice = listing.highestBid;
            uint256 tradingFee = (totalPrice * feeConfig.tradingFee) / BASIS_POINTS;
            
            // Handle royalties
            uint256 royaltyAmount = 0;
            address royaltyReceiver = address(0);
            
            if (IERC165(address(cademNFT)).supportsInterface(type(IERC2981).interfaceId)) {
                (royaltyReceiver, royaltyAmount) = IERC2981(address(cademNFT)).royaltyInfo(listing.tokenId, totalPrice);
            }
            
            uint256 sellerAmount = totalPrice - tradingFee - royaltyAmount;
            
            // Transfer payments
            cademToken.safeTransfer(listing.seller, sellerAmount);
            
            if (tradingFee > 0) {
                totalFeesCollected += tradingFee;
            }
            
            if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
                cademToken.safeTransfer(royaltyReceiver, royaltyAmount);
                totalRoyaltiesPaid += royaltyAmount;
            }
            
            // Transfer NFT
            cademNFT.safeTransferFrom(listing.seller, listing.highestBidder, listing.tokenId);
            
            // Update statistics
            totalTradingVolume += totalPrice;
            userTradingVolume[listing.highestBidder] += totalPrice;
            userTradingVolume[listing.seller] += totalPrice;
            
            emit ItemSold(listingId, listing.tokenId, listing.seller, listing.highestBidder, totalPrice, tradingFee, royaltyAmount);
            emit AuctionEnded(listingId, listing.highestBidder, totalPrice);
        }
        
        // Deactivate listing
        listing.isActive = false;
        _removeFeaturedListing(listingId);
    }
    
    /**
     * @dev Cancel a listing
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender || msg.sender == owner(), "Not authorized");
        
        // Refund highest bidder if it's an auction
        if (listing.isAuction && listing.highestBidder != address(0)) {
            cademToken.safeTransfer(listing.highestBidder, listing.highestBid);
        }
        
        listing.isActive = false;
        _removeFeaturedListing(listingId);
        
        emit ListingCancelled(listingId, listing.tokenId);
    }
    
    /**
     * @dev Make an offer on an NFT
     */
    function makeOffer(uint256 tokenId, uint256 amount, uint256 expiration) external nonReentrant whenNotPaused {
        require(amount > 0, "Offer amount must be greater than 0");
        require(expiration > block.timestamp, "Invalid expiration");
        require(cademNFT.ownerOf(tokenId) != msg.sender, "Cannot offer on own NFT");
        
        // Transfer offer amount to contract
        cademToken.safeTransferFrom(msg.sender, address(this), amount);
        
        offers[tokenId].push(Offer({
            tokenId: tokenId,
            buyer: msg.sender,
            amount: amount,
            expiration: expiration,
            isActive: true
        }));
        
        emit OfferMade(tokenId, msg.sender, amount);
    }
    
    /**
     * @dev Accept an offer
     */
    function acceptOffer(uint256 tokenId, uint256 offerIndex) external nonReentrant {
        require(cademNFT.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(offerIndex < offers[tokenId].length, "Invalid offer index");
        
        Offer storage offer = offers[tokenId][offerIndex];
        require(offer.isActive, "Offer not active");
        require(block.timestamp <= offer.expiration, "Offer expired");
        
        uint256 totalPrice = offer.amount;
        uint256 tradingFee = (totalPrice * feeConfig.tradingFee) / BASIS_POINTS;
        
        // Handle royalties
        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);
        
        if (IERC165(address(cademNFT)).supportsInterface(type(IERC2981).interfaceId)) {
            (royaltyReceiver, royaltyAmount) = IERC2981(address(cademNFT)).royaltyInfo(tokenId, totalPrice);
        }
        
        uint256 sellerAmount = totalPrice - tradingFee - royaltyAmount;
        
        // Transfer payments
        cademToken.safeTransfer(msg.sender, sellerAmount);
        
        if (tradingFee > 0) {
            totalFeesCollected += tradingFee;
        }
        
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            cademToken.safeTransfer(royaltyReceiver, royaltyAmount);
            totalRoyaltiesPaid += royaltyAmount;
        }
        
        // Transfer NFT
        cademNFT.safeTransferFrom(msg.sender, offer.buyer, tokenId);
        
        // Update statistics
        totalTradingVolume += totalPrice;
        userTradingVolume[offer.buyer] += totalPrice;
        userTradingVolume[msg.sender] += totalPrice;
        
        // Deactivate offer
        offer.isActive = false;
        
        emit OfferAccepted(tokenId, msg.sender, offer.buyer, totalPrice);
        emit ItemSold(0, tokenId, msg.sender, offer.buyer, totalPrice, tradingFee, royaltyAmount);
    }
    
    /**
     * @dev Owner functions for fee management and revenue
     */
    function updateFees(
        uint256 _tradingFee,
        uint256 _listingFee,
        uint256 _featuredListingFee,
        uint256 _auctionFee
    ) external onlyOwner {
        require(_tradingFee <= MAX_TRADING_FEE, "Trading fee too high");
        
        feeConfig.tradingFee = _tradingFee;
        feeConfig.listingFee = _listingFee;
        feeConfig.featuredListingFee = _featuredListingFee;
        feeConfig.auctionFee = _auctionFee;
        
        emit FeesUpdated(_tradingFee, _listingFee, _featuredListingFee, _auctionFee);
    }
    
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 balance = cademToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        
        cademToken.safeTransfer(owner(), balance);
        emit FeesWithdrawn(owner(), balance);
    }
    
    function setMaxFeaturedListings(uint256 _maxFeaturedListings) external onlyOwner {
        maxFeaturedListings = _maxFeaturedListings;
    }
    
    /**
     * @dev Internal helper functions
     */
    function _removeFeaturedListing(uint256 listingId) internal {
        if (featuredListings[listingId]) {
            featuredListings[listingId] = false;
            
            for (uint256 i = 0; i < featuredListingIds.length; i++) {
                if (featuredListingIds[i] == listingId) {
                    featuredListingIds[i] = featuredListingIds[featuredListingIds.length - 1];
                    featuredListingIds.pop();
                    break;
                }
            }
        }
    }
    
    /**
     * @dev View functions
     */
    function getActiveListings(uint256 offset, uint256 limit) external view returns (Listing[] memory) {
        uint256 count = 0;
        uint256 totalListings = nextListingId - 1;
        
        // Count active listings
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].isActive && block.timestamp <= listings[i].expirationTime) {
                count++;
            }
        }
        
        // Create array with proper size
        uint256 resultSize = count > limit ? limit : count;
        Listing[] memory result = new Listing[](resultSize);
        
        uint256 resultIndex = 0;
        uint256 currentOffset = 0;
        
        for (uint256 i = 1; i <= totalListings && resultIndex < resultSize; i++) {
            if (listings[i].isActive && block.timestamp <= listings[i].expirationTime) {
                if (currentOffset >= offset) {
                    result[resultIndex] = listings[i];
                    resultIndex++;
                }
                currentOffset++;
            }
        }
        
        return result;
    }
    
    function getFeaturedListings() external view returns (uint256[] memory) {
        return featuredListingIds;
    }
    
    function getUserListings(address user) external view returns (uint256[] memory) {
        return userListings[user];
    }
    
    function getOffers(uint256 tokenId) external view returns (Offer[] memory) {
        return offers[tokenId];
    }
    
    function getMarketplaceStats() external view returns (
        uint256 totalVolume,
        uint256 totalFees,
        uint256 totalRoyalties,
        uint256 activeListings
    ) {
        uint256 activeCount = 0;
        uint256 totalListings = nextListingId - 1;
        
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].isActive && block.timestamp <= listings[i].expirationTime) {
                activeCount++;
            }
        }
        
        return (totalTradingVolume, totalFeesCollected, totalRoyaltiesPaid, activeCount);
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
