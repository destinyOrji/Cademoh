import { Router } from 'express';
import { UserModel } from '../models/User';

const router = Router();

// Get leaderboard
router.get('/:period', async (req, res) => {
  try {
    const { period } = req.params; // daily, weekly, all-time
    
    const users = await UserModel.find()
      .sort({ totalCademEarned: -1 })
      .limit(100)
      .select('walletAddress username totalCademEarned level');

    // Add ranks
    const rankedUsers = users.map((user, index) => ({
      rank: index + 1,
      ...user.toObject()
    }));

    res.json({
      success: true,
      data: rankedUsers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch leaderboard' 
    });
  }
});

export default router;