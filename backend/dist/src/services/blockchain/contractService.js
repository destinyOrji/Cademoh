"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockchainService = exports.BlockchainService = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("../../utils/constants");
class BlockchainService {
    constructor() {
        this.contracts = new Map();
        this.provider = new ethers_1.ethers.JsonRpcProvider(process.env.WEB3_PROVIDER_URL);
        this.initializeContracts();
    }
    initializeContracts() {
        // CADEM Token Contract
        const tokenContract = new ethers_1.ethers.Contract(constants_1.CONTRACT_ADDRESSES.CADEM_TOKEN, constants_1.CONTRACT_ABIS.ERC20, this.provider);
        this.contracts.set('token', tokenContract);
        // NFT Contract
        const nftContract = new ethers_1.ethers.Contract(constants_1.CONTRACT_ADDRESSES.NFT_CONTRACT, constants_1.CONTRACT_ABIS.ERC721, this.provider);
        this.contracts.set('nft', nftContract);
        // Marketplace Contract
        const marketplaceContract = new ethers_1.ethers.Contract(constants_1.CONTRACT_ADDRESSES.MARKETPLACE, constants_1.CONTRACT_ABIS.MARKETPLACE, this.provider);
        this.contracts.set('marketplace', marketplaceContract);
    }
    getContract(name) {
        const contract = this.contracts.get(name);
        if (!contract)
            throw new Error(`Contract ${name} not found`);
        return contract;
    }
    // Get user's CADEM token balance
    async getTokenBalance(walletAddress) {
        const tokenContract = this.getContract('token');
        const balance = await tokenContract.balanceOf(walletAddress);
        return ethers_1.ethers.formatEther(balance);
    }
    // Get user's NFTs
    async getUserNFTs(walletAddress) {
        const nftContract = this.getContract('nft');
        // This would need custom logic based on your NFT contract
        // Example: const balance = await nftContract.balanceOf(walletAddress);
        return [];
    }
}
exports.BlockchainService = BlockchainService;
exports.blockchainService = new BlockchainService();
