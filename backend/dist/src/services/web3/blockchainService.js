"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.web3Service = exports.Web3BlockchainService = void 0;
const ethers_1 = require("ethers");
const User_1 = require("../../../models/User");
// Simple ABI for basic token operations
const TOKEN_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];
const NFT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];
class Web3BlockchainService {
    constructor() {
        this.tokenContract = null;
        this.nftContract = null;
        this.isConnected = false;
        this.initializeProvider();
    }
    initializeProvider() {
        try {
            const rpcUrl = process.env.WEB3_PROVIDER_URL;
            if (!rpcUrl || rpcUrl.includes('YOUR_PROJECT_ID')) {
                console.log('⚠️  Web3 provider not configured, running in mock mode');
                return;
            }
            this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
            this.initializeContracts();
            this.isConnected = true;
            console.log('✅ Web3 provider initialized');
        }
        catch (error) {
            console.log('⚠️  Web3 initialization failed, running in mock mode:', error);
        }
    }
    initializeContracts() {
        const tokenAddress = process.env.CADEM_TOKEN_ADDRESS;
        const nftAddress = process.env.NFT_CONTRACT_ADDRESS;
        if (tokenAddress && tokenAddress !== '0x...') {
            this.tokenContract = new ethers_1.ethers.Contract(tokenAddress, TOKEN_ABI, this.provider);
            console.log('✅ Token contract initialized:', tokenAddress);
        }
        if (nftAddress && nftAddress !== '0x...') {
            this.nftContract = new ethers_1.ethers.Contract(nftAddress, NFT_ABI, this.provider);
            console.log('✅ NFT contract initialized:', nftAddress);
        }
    }
    // Get user's CADEM token balance from blockchain
    async getTokenBalance(walletAddress) {
        try {
            if (!this.isConnected || !this.tokenContract) {
                // Return mock balance if not connected
                return this.getMockBalance(walletAddress);
            }
            const balance = await this.tokenContract.balanceOf(walletAddress);
            return ethers_1.ethers.formatEther(balance);
        }
        catch (error) {
            console.error('Error fetching token balance:', error);
            return this.getMockBalance(walletAddress);
        }
    }
    // Get user's NFTs from blockchain
    async getUserNFTs(walletAddress) {
        try {
            if (!this.isConnected || !this.nftContract) {
                return this.getMockNFTs(walletAddress);
            }
            const balance = await this.nftContract.balanceOf(walletAddress);
            const nfts = [];
            // This is a simplified approach - in reality you'd need to track token IDs
            for (let i = 0; i < Math.min(balance, 10); i++) {
                nfts.push({
                    tokenId: i + 1,
                    name: `CADEM NFT #${i + 1}`,
                    image: `https://api.cadem.io/nft/${i + 1}/image`,
                    rarity: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][i % 5]
                });
            }
            return nfts;
        }
        catch (error) {
            console.error('Error fetching NFTs:', error);
            return this.getMockNFTs(walletAddress);
        }
    }
    // Start listening to blockchain events
    async startEventListeners() {
        if (!this.isConnected) {
            console.log('⚠️  Blockchain not connected, skipping event listeners');
            return;
        }
        try {
            // Listen for token transfers
            if (this.tokenContract) {
                this.tokenContract.on('Transfer', async (from, to, value, event) => {
                    console.log(`💰 Token Transfer: ${from} -> ${to}: ${ethers_1.ethers.formatEther(value)} CADEM`);
                    // Update user balances in database
                    if (from !== ethers_1.ethers.ZeroAddress) {
                        await this.updateUserBalance(from);
                    }
                    if (to !== ethers_1.ethers.ZeroAddress) {
                        await this.updateUserBalance(to);
                    }
                });
            }
            // Listen for NFT transfers
            if (this.nftContract) {
                this.nftContract.on('Transfer', async (from, to, tokenId, event) => {
                    if (from === ethers_1.ethers.ZeroAddress) {
                        console.log(`🎨 NFT Minted: #${tokenId} to ${to}`);
                    }
                    else {
                        console.log(`🔄 NFT Transfer: #${tokenId} from ${from} to ${to}`);
                    }
                });
            }
            console.log('✅ Blockchain event listeners started');
        }
        catch (error) {
            console.error('Error starting event listeners:', error);
        }
    }
    // Update user balance in database from blockchain
    async updateUserBalance(walletAddress) {
        try {
            const balance = await this.getTokenBalance(walletAddress);
            await User_1.UserModel.findOneAndUpdate({ walletAddress }, {
                walletAddress,
                currentCademBalance: parseFloat(balance)
            }, { upsert: true, new: true });
            console.log(`📊 Updated balance for ${walletAddress}: ${balance} CADEM`);
        }
        catch (error) {
            console.error(`Error updating balance for ${walletAddress}:`, error);
        }
    }
    // Mock functions for when blockchain is not connected
    getMockBalance(walletAddress) {
        // Generate consistent mock balance based on wallet address
        const hash = walletAddress.slice(2, 10);
        const mockBalance = parseInt(hash, 16) % 10000;
        return mockBalance.toString();
    }
    getMockNFTs(walletAddress) {
        // Generate mock NFTs based on wallet address
        const hash = walletAddress.slice(2, 6);
        const nftCount = parseInt(hash, 16) % 5;
        const mockNFTs = [];
        for (let i = 0; i < nftCount; i++) {
            mockNFTs.push({
                tokenId: i + 1,
                name: `Mock CADEM NFT #${i + 1}`,
                image: `https://via.placeholder.com/300x300?text=NFT+${i + 1}`,
                rarity: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][i % 5],
                attributes: [
                    { trait_type: 'Level', value: Math.floor(Math.random() * 10) + 1 },
                    { trait_type: 'Power', value: Math.floor(Math.random() * 1000) + 100 }
                ]
            });
        }
        return mockNFTs;
    }
    // Check if Web3 is properly connected
    isWeb3Connected() {
        return this.isConnected;
    }
    // Get blockchain network info
    async getNetworkInfo() {
        try {
            if (!this.isConnected) {
                return { name: 'Mock Network', chainId: 0, connected: false };
            }
            const network = await this.provider.getNetwork();
            return {
                name: network.name,
                chainId: Number(network.chainId),
                connected: true
            };
        }
        catch (error) {
            return { name: 'Unknown', chainId: 0, connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
}
exports.Web3BlockchainService = Web3BlockchainService;
exports.web3Service = new Web3BlockchainService();
