const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deployment configuration
  const config = {
    // Token configuration
    tokenName: "CADEM Token",
    tokenSymbol: "CADEM",
    totalSupply: ethers.utils.parseEther("1000000000"), // 1 billion tokens
    
    // NFT configuration
    nftName: "CADEM Game Assets",
    nftSymbol: "CGA",
    royaltyFee: 750, // 7.5%
    
    // Marketplace configuration
    tradingFee: 250, // 2.5%
    listingFee: ethers.utils.parseEther("10"), // 10 CADEM tokens
    featuredListingFee: ethers.utils.parseEther("50"), // 50 CADEM tokens
    auctionFee: ethers.utils.parseEther("20"), // 20 CADEM tokens
    
    // Staking configuration
    maxRewardsPerDay: ethers.utils.parseEther("100000"), // 100k tokens per day
    
    // Wallet addresses (replace with actual addresses)
    treasuryWallet: process.env.TREASURY_WALLET || deployer.address,
    teamWallet: process.env.TEAM_WALLET || deployer.address,
    ecosystemWallet: process.env.ECOSYSTEM_WALLET || deployer.address,
    royaltyReceiver: process.env.ROYALTY_RECEIVER || deployer.address,
  };

  console.log("Deployment configuration:", config);

  // Deploy CADEM Token
  console.log("\n1. Deploying CADEM Token...");
  const CADEMToken = await ethers.getContractFactory("CADEMToken");
  const cademToken = await CADEMToken.deploy(
    config.tokenName,
    config.tokenSymbol,
    config.totalSupply,
    config.treasuryWallet,
    config.teamWallet,
    config.ecosystemWallet
  );
  await cademToken.deployed();
  console.log("CADEM Token deployed to:", cademToken.address);

  // Deploy CADEM NFT Collection
  console.log("\n2. Deploying CADEM NFT Collection...");
  const CADEMNFTCollection = await ethers.getContractFactory("CADEMNFTCollection");
  const cademNFT = await CADEMNFTCollection.deploy(
    config.nftName,
    config.nftSymbol,
    config.royaltyReceiver,
    config.royaltyFee
  );
  await cademNFT.deployed();
  console.log("CADEM NFT Collection deployed to:", cademNFT.address);

  // Deploy CADEM Staking
  console.log("\n3. Deploying CADEM Staking...");
  const CADEMStaking = await ethers.getContractFactory("CADEMStaking");
  const cademStaking = await CADEMStaking.deploy(
    cademToken.address,
    cademNFT.address,
    config.maxRewardsPerDay
  );
  await cademStaking.deployed();
  console.log("CADEM Staking deployed to:", cademStaking.address);

  // Deploy CADEM Marketplace
  console.log("\n4. Deploying CADEM Marketplace...");
  const CADEMMarketplace = await ethers.getContractFactory("CADEMMarketplace");
  const cademMarketplace = await CADEMMarketplace.deploy(
    cademNFT.address,
    cademToken.address,
    config.tradingFee,
    config.listingFee,
    config.featuredListingFee,
    config.auctionFee
  );
  await cademMarketplace.deployed();
  console.log("CADEM Marketplace deployed to:", cademMarketplace.address);

  // Post-deployment setup
  console.log("\n5. Setting up contract permissions...");
  
  // Set marketplace as approved for NFT transfers (for royalties)
  console.log("Setting marketplace approval for NFT contract...");
  // Note: Users will need to approve individually, but we can set up the marketplace address
  
  // Transfer some tokens to staking contract for rewards
  console.log("Funding staking contract with reward tokens...");
  const rewardAmount = ethers.utils.parseEther("10000000"); // 10M tokens for rewards
  await cademToken.transfer(cademStaking.address, rewardAmount);
  
  // Set DEX pair for token (example - replace with actual DEX pair address when available)
  // await cademToken.setDEXPair("0x...", true);

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      CADEMToken: {
        address: cademToken.address,
        name: config.tokenName,
        symbol: config.tokenSymbol,
        totalSupply: config.totalSupply.toString()
      },
      CADEMNFTCollection: {
        address: cademNFT.address,
        name: config.nftName,
        symbol: config.nftSymbol,
        royaltyFee: config.royaltyFee
      },
      CADEMStaking: {
        address: cademStaking.address,
        maxRewardsPerDay: config.maxRewardsPerDay.toString()
      },
      CADEMMarketplace: {
        address: cademMarketplace.address,
        tradingFee: config.tradingFee,
        listingFee: config.listingFee.toString(),
        featuredListingFee: config.featuredListingFee.toString(),
        auctionFee: config.auctionFee.toString()
      }
    },
    configuration: config
  };

  // Write deployment info to file
  const deploymentFile = `deployments/deployment-${hre.network.name}-${Date.now()}.json`;
  fs.mkdirSync("deployments", { recursive: true });
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n✅ Deployment completed successfully!");
  console.log("📄 Deployment info saved to:", deploymentFile);
  
  console.log("\n📋 Contract Addresses:");
  console.log("CADEM Token:", cademToken.address);
  console.log("CADEM NFT Collection:", cademNFT.address);
  console.log("CADEM Staking:", cademStaking.address);
  console.log("CADEM Marketplace:", cademMarketplace.address);

  console.log("\n💰 Owner Revenue Streams Activated:");
  console.log("✓ Token transaction taxes (3-5%)");
  console.log("✓ NFT minting fees (0.01-0.25 ETH)");
  console.log("✓ NFT royalties (7.5% on all secondary sales)");
  console.log("✓ Marketplace trading fees (2.5%)");
  console.log("✓ Staking emission control (10% of rewards)");
  console.log("✓ Featured listing fees");

  console.log("\n🚀 Next Steps:");
  console.log("1. Verify contracts on Etherscan");
  console.log("2. Set up DEX liquidity pairs");
  console.log("3. Configure frontend to interact with contracts");
  console.log("4. Start minting initial NFT collection");
  console.log("5. Launch staking pools");

  // Verification instructions
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\n🔍 To verify contracts, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${cademToken.address} "${config.tokenName}" "${config.tokenSymbol}" "${config.totalSupply}" "${config.treasuryWallet}" "${config.teamWallet}" "${config.ecosystemWallet}"`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${cademNFT.address} "${config.nftName}" "${config.nftSymbol}" "${config.royaltyReceiver}" ${config.royaltyFee}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${cademStaking.address} "${cademToken.address}" "${cademNFT.address}" "${config.maxRewardsPerDay}"`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${cademMarketplace.address} "${cademNFT.address}" "${cademToken.address}" ${config.tradingFee} "${config.listingFee}" "${config.featuredListingFee}" "${config.auctionFee}"`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
