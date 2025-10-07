import { Router } from 'express';
import { UserModel } from '../../models/User';
import { blockchainService } from '../services/blockchain/contractService';

const router = Router();

// Get user profile by wallet address
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Find user in database or create new one
    let user = await UserModel.findOne({ walletAddress });
    
    if (!user) {
      user = await UserModel.create({ walletAddress });
    }

    // Get real-time blockchain data
    const blockchainBalance = await blockchainService.getTokenBalance(walletAddress);
    const userNFTs = await blockchainService.getUserNFTs(walletAddress);

    res.json({
      success: true,
      data: {
        user,
        blockchainBalance,
        nfts: userNFTs
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user data' 
    });
  }
});

// Create or update user profile
router.post('/', async (req, res) => {
  try {
    const { walletAddress, username } = req.body;

    const user = await UserModel.findOneAndUpdate(
      { walletAddress },
      { username, walletAddress },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create user' 
    });
  }
});

export default router;
