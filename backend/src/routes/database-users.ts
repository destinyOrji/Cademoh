import { Router } from 'express';
import { UserModel } from '../../models/User';

const router = Router();

// Get user profile by wallet address (with database)
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Find user in database or create new one
    let user = await UserModel.findOne({ walletAddress });
    
    if (!user) {
      user = await UserModel.create({ 
        walletAddress,
        username: `Player_${walletAddress.slice(0, 8)}`,
        totalCademEarned: 0,
        currentCademBalance: 0,
        level: 1,
        experiencePoints: 0
      });
      console.log(`✅ Created new user: ${walletAddress}`);
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user data' 
    });
  }
});

// Update user profile
router.put('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { username } = req.body;

    const user = await UserModel.findOneAndUpdate(
      { walletAddress },
      { username },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user' 
    });
  }
});

// Add CADEM tokens to user balance
router.post('/:walletAddress/add-tokens', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token amount'
      });
    }

    const user = await UserModel.findOneAndUpdate(
      { walletAddress },
      { 
        $inc: { 
          totalCademEarned: amount,
          currentCademBalance: amount,
          experiencePoints: amount * 10 // 10 XP per token
        }
      },
      { new: true, upsert: true }
    );

    // Level up logic
    const newLevel = Math.floor(user.experiencePoints / 1000) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
      await user.save();
      console.log(`🎉 ${walletAddress} leveled up to ${newLevel}!`);
    }

    console.log(`💰 Added ${amount} CADEM to ${walletAddress} (${reason})`);

    res.json({
      success: true,
      data: {
        user,
        tokensAdded: amount,
        newBalance: user.currentCademBalance,
        leveledUp: newLevel > (newLevel - 1),
        reason
      }
    });
  } catch (error) {
    console.error('Error adding tokens:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add tokens' 
    });
  }
});

// Get user statistics
router.get('/:walletAddress/stats', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const user = await UserModel.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Calculate user rank
    const rank = await UserModel.countDocuments({
      totalCademEarned: { $gt: user.totalCademEarned }
    }) + 1;

    // Get total users for percentile
    const totalUsers = await UserModel.countDocuments();
    const percentile = Math.round((1 - (rank - 1) / totalUsers) * 100);

    res.json({
      success: true,
      data: {
        user,
        rank,
        totalUsers,
        percentile,
        nextLevelXP: (user.level * 1000) - user.experiencePoints
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user stats' 
    });
  }
});

export default router;
