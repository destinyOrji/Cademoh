const { ethers } = require("hardhat");

/**
 * Post-deployment setup script
 * Run this after deploying contracts to configure them properly
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Setting up contracts with account:", deployer.address);

  // Contract addresses (replace with your deployed addresses)
  const TOKEN_ADDRESS = "0x..."; // Replace with deployed token address
  const NFT_ADDRESS = "0x...";   // Replace with deployed NFT address
  const STAKING_ADDRESS = "0x..."; // Replace with deployed staking address
  const MARKETPLACE_ADDRESS = "0x..."; // Replace with deployed marketplace address

  // Get contract instances
  const cademToken = await ethers.getContractAt("CADEMToken", TOKEN_ADDRESS);
  const cademNFT = await ethers.getContractAt("CADEMNFTCollection", NFT_ADDRESS);
  const cademStaking = await ethers.getContractAt("CADEMStaking", STAKING_ADDRESS);
  const cademMarketplace = await ethers.getContractAt("CADEMMarketplace", MARKETPLACE_ADDRESS);

  console.log("\n1. Setting up token configurations...");
  
  // Set tax exemptions for contracts
  await cademToken.setTaxExemption(STAKING_ADDRESS, true);
  await cademToken.setTaxExemption(MARKETPLACE_ADDRESS, true);
  console.log("✓ Set tax exemptions for contracts");

  // Example: Set a DEX pair (replace with actual Uniswap pair address)
  // await cademToken.setDEXPair("0x...", true);
  // console.log("✓ Set DEX pair for buy/sell tax detection");

  console.log("\n2. Setting up NFT configurations...");
  
  // Enable public minting
  await cademNFT.togglePublicMinting();
  console.log("✓ Enabled public NFT minting");

  // Add some addresses to whitelist (optional)
  const whitelistAddresses = [
    deployer.address,
    // Add more addresses as needed
  ];
  await cademNFT.addToWhitelist(whitelistAddresses);
  console.log("✓ Added addresses to NFT whitelist");

  console.log("\n3. Setting up staking configurations...");
  
  // Fund staking contract with reward tokens
  const rewardAmount = ethers.utils.parseEther("5000000"); // 5M tokens
  await cademToken.transfer(STAKING_ADDRESS, rewardAmount);
  console.log("✓ Funded staking contract with reward tokens");

  // Set staking contract as tax exempt
  await cademToken.setTaxExemption(STAKING_ADDRESS, true);
  console.log("✓ Set staking contract tax exemption");

  console.log("\n4. Setting up marketplace configurations...");
  
  // The marketplace is ready to use after deployment
  console.log("✓ Marketplace is ready for trading");

  console.log("\n5. Creating initial NFT collection...");
  
  // Mint some initial NFTs for the collection
  const initialNFTs = [
    {
      recipient: deployer.address,
      uri: "https://api.cadem.io/nft/1",
      assetType: 0, // WEAPON
      rarity: 4,    // LEGENDARY
      level: 1,
      power: 1000,
      name: "Genesis Sword"
    },
    {
      recipient: deployer.address,
      uri: "https://api.cadem.io/nft/2",
      assetType: 1, // CHARACTER
      rarity: 3,    // EPIC
      level: 1,
      power: 800,
      name: "Hero Character"
    }
  ];

  for (let i = 0; i < initialNFTs.length; i++) {
    const nft = initialNFTs[i];
    await cademNFT.mintNFT(
      nft.recipient,
      nft.uri,
      nft.assetType,
      nft.rarity,
      nft.level,
      nft.power,
      nft.name
    );
    console.log(`✓ Minted NFT: ${nft.name}`);
  }

  console.log("\n6. Setting up revenue tracking...");
  
  // Display initial revenue setup
  const tokenInfo = await cademToken.getTaxInfo();
  const nftFees = await cademNFT.getMintingFees();
  const marketplaceFees = await cademMarketplace.feeConfig();

  console.log("📊 Revenue Configuration:");
  console.log(`Token Buy Tax: ${tokenInfo[0] / 100}%`);
  console.log(`Token Sell Tax: ${tokenInfo[1] / 100}%`);
  console.log(`Token Transfer Tax: ${tokenInfo[2] / 100}%`);
  console.log(`NFT Common Minting Fee: ${ethers.utils.formatEther(nftFees[0])} ETH`);
  console.log(`NFT Legendary Minting Fee: ${ethers.utils.formatEther(nftFees[4])} ETH`);
  console.log(`Marketplace Trading Fee: ${marketplaceFees.tradingFee / 100}%`);

  console.log("\n✅ Setup completed successfully!");
  
  console.log("\n🎯 Revenue Streams Active:");
  console.log("• Token transaction taxes");
  console.log("• NFT minting fees");
  console.log("• NFT royalties (automatic)");
  console.log("• Marketplace trading fees");
  console.log("• Staking emission control");

  console.log("\n📋 Next Steps:");
  console.log("1. Create game integration");
  console.log("2. Set up frontend interface");
  console.log("3. Launch marketing campaign");
  console.log("4. Monitor revenue streams");
  console.log("5. Scale based on user adoption");

  // Save setup info
  const setupInfo = {
    timestamp: new Date().toISOString(),
    network: hre.network.name,
    contracts: {
      token: TOKEN_ADDRESS,
      nft: NFT_ADDRESS,
      staking: STAKING_ADDRESS,
      marketplace: MARKETPLACE_ADDRESS
    },
    revenueConfig: {
      tokenTaxes: {
        buy: tokenInfo[0].toString(),
        sell: tokenInfo[1].toString(),
        transfer: tokenInfo[2].toString()
      },
      nftFees: nftFees.map(fee => ethers.utils.formatEther(fee)),
      marketplaceFee: marketplaceFees.tradingFee.toString()
    }
  };

  const fs = require("fs");
  fs.mkdirSync("deployments", { recursive: true });
  fs.writeFileSync(
    `deployments/setup-${hre.network.name}-${Date.now()}.json`,
    JSON.stringify(setupInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
