import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../utils/constants';

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contracts: Map<string, ethers.Contract> = new Map();

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.WEB3_PROVIDER_URL);
    this.initializeContracts();
  }

  private initializeContracts() {
    // CADEM Token Contract
    const tokenContract = new ethers.Contract(
      CONTRACT_ADDRESSES.CADEM_TOKEN,
      CONTRACT_ABIS.ERC20,
      this.provider
    );
    this.contracts.set('token', tokenContract);

    // NFT Contract
    const nftContract = new ethers.Contract(
      CONTRACT_ADDRESSES.NFT_CONTRACT,
      CONTRACT_ABIS.ERC721,
      this.provider
    );
    this.contracts.set('nft', nftContract);

    // Marketplace Contract
    const marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESSES.MARKETPLACE,
      CONTRACT_ABIS.MARKETPLACE,
      this.provider
    );
    this.contracts.set('marketplace', marketplaceContract);
  }

  getContract(name: string): ethers.Contract {
    const contract = this.contracts.get(name);
    if (!contract) throw new Error(`Contract ${name} not found`);
    return contract;
  }

  // Get user's CADEM token balance
  async getTokenBalance(walletAddress: string): Promise<string> {
    const tokenContract = this.getContract('token');
    const balance = await tokenContract.balanceOf(walletAddress);
    return ethers.formatEther(balance);
  }

  // Get user's NFTs
  async getUserNFTs(walletAddress: string): Promise<any[]> {
    const nftContract = this.getContract('nft');
    // This would need custom logic based on your NFT contract
    // Example: const balance = await nftContract.balanceOf(walletAddress);
    return [];
  }
}

export const blockchainService = new BlockchainService();
