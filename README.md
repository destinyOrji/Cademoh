# CADEM Smart Contracts

A comprehensive smart contract ecosystem for the CADEM gaming platform with built-in revenue streams for the app owner.

## 🎯 Revenue Model Overview

The CADEM smart contract system generates revenue for the app owner through multiple streams:

### 1. **CADEM Token (ERC-20)** - `CADEMToken.sol`
- **Initial Allocation**: Owner gets 20% of total token supply
- **Transaction Taxes**: 
  - Buy: 3% fee
  - Sell: 5% fee  
  - Transfer: 2% fee
- **Revenue Split**: 70% to owner, 30% redistributed to holders
- **Treasury Staking**: Owner can stake treasury tokens to earn more rewards

### 2. **NFT Collection (ERC-721)** - `CADEMNFTCollection.sol`
- **Minting Fees**: 0.01-0.25 ETH per NFT based on rarity
- **Royalties**: 7.5% on every secondary market sale (forever)
- **Primary Sales**: 100% of initial NFT sales revenue
- **Categories**: Weapons, Characters, Items, Skins, Accessories

### 3. **Staking Contract** - `CADEMStaking.sol`
- **Emission Control**: Owner controls daily token rewards (up to 100k/day)
- **Owner Share**: 10% of all staking rewards go to treasury
- **Multiple Pools**: Flexible, 30-day, 90-day, 1-year lock periods
- **NFT Staking**: Additional rewards with rarity multipliers

### 4. **Marketplace Contract** - `CADEMMarketplace.sol`
- **Trading Fees**: 2.5% on every NFT sale
- **Listing Fees**: 10 CADEM tokens to list an item
- **Featured Listings**: 50 CADEM tokens for premium placement
- **Auction Fees**: 20 CADEM tokens for auction listings

## 💰 Revenue Projections

**Conservative Estimates (Monthly)**:
- Token taxes: $5,000-15,000
- NFT minting: $10,000-50,000  
- NFT royalties: $2,000-20,000
- Marketplace fees: $3,000-25,000
- **Total**: $20,000-110,000/month

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm or yarn
- MetaMask or similar wallet

### Installation

```bash
# Clone and install dependencies
cd smart_contract
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your configuration
```

### Local Development

```bash
# Start local Hardhat node
npm run node

# Deploy to local network
npm run deploy:local

# Run tests
npm test
```

### Testnet Deployment

```bash
# Deploy to Goerli testnet
npm run deploy:testnet

# Verify contracts
npm run verify
```

### Mainnet Deployment

```bash
# Deploy to mainnet (use with caution!)
npm run deploy:mainnet
```

## 📋 Contract Addresses

After deployment, contract addresses will be saved in `deployments/` folder.

## 🔧 Configuration

### Environment Variables

```env
# Deployment wallets
TREASURY_WALLET=0x...     # Receives owner revenue
TEAM_WALLET=0x...         # Team token allocation  
ECOSYSTEM_WALLET=0x...    # Ecosystem fund
ROYALTY_RECEIVER=0x...    # NFT royalty receiver

# Fee configuration
ROYALTY_FEE=750          # 7.5% NFT royalties
TRADING_FEE=250          # 2.5% marketplace fee
LISTING_FEE=10000000000000000    # 0.01 ETH listing fee
```

### Token Economics

- **Total Supply**: 1,000,000,000 CADEM
- **Initial Distribution**:
  - Owner: 20% (200M tokens)
  - Treasury: 15% (150M tokens)
  - Team: 10% (100M tokens)
  - Ecosystem: 15% (150M tokens)
  - Public/Rewards: 40% (400M tokens)

## 🎮 Game Integration

### For Game Developers

```javascript
// Example: Reward player with tokens
await cademToken.transfer(playerAddress, rewardAmount);

// Example: Mint NFT reward
await cademNFT.mintNFT(
  playerAddress,
  tokenURI,
  AssetType.WEAPON,
  Rarity.RARE,
  level,
  power,
  "Epic Sword"
);
```

### For Frontend Integration

```javascript
// Connect to contracts
const cademToken = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
const cademNFT = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);

// Example: List NFT for sale
await marketplace.listItem(tokenId, price, duration, false);
```

## 🛡️ Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Ownable**: Secure ownership management
- **SafeERC20**: Safe token transfers
- **Access Control**: Role-based permissions

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/CADEMToken.test.js

# Generate coverage report
npm run coverage
```

## 📊 Analytics & Monitoring

Track your revenue streams:

```javascript
// Get token tax revenue
const revenue = await cademToken.totalRewardsDistributed();

// Get NFT sales volume
const nftRevenue = await cademNFT.totalRevenue();

// Get marketplace stats
const [volume, fees] = await marketplace.getMarketplaceStats();

// Get staking metrics
const stakingRevenue = await staking.treasuryRewards();
```

## 🔍 Contract Verification

After deployment, verify contracts on Etherscan:

```bash
npx hardhat verify --network mainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 📈 Scaling & Optimization

### Gas Optimization
- Batch operations where possible
- Use events for off-chain indexing
- Optimize storage layout
- Consider Layer 2 deployment

### Revenue Optimization
- Adjust fees based on market conditions
- Create limited edition NFT drops
- Implement seasonal staking bonuses
- Add governance token features

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For technical support:
- Create GitHub issue
- Join Discord community
- Email: support@cadem.io

## 🔮 Roadmap

- [ ] Cross-chain bridge integration
- [ ] DAO governance implementation  
- [ ] Advanced NFT crafting system
- [ ] Mobile wallet integration
- [ ] Layer 2 scaling solution

---

**⚠️ Important**: Always test thoroughly on testnets before mainnet deployment. Smart contracts are immutable once deployed.
