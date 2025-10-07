import { Router } from 'express';
import { UserModel } from '../../models/User';

const router = Router();

// Start a game session
router.post('/start-session', async (req, res) => {
  try {
    const { walletAddress, gameId } = req.body;
    
    // In a real implementation, you'd create a session in database
    const session = {
      sessionId: Math.random().toString(36).substr(2, 9),
      walletAddress,
      gameId,
      startTime: new Date(),
      status: 'active'
    };

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start game session' 
    });
  }
});

// End game session and calculate rewards
router.post('/end-session', async (req, res) => {
  try {
    const { sessionId, walletAddress, score, timePlayed, levelReached } = req.body;

    // Calculate rewards (this would be your game logic)
    const baseReward = 10;
    const scoreBonus = score * 0.01;
    const timeBonus = Math.max(0, (300 - timePlayed) / 10);
    const levelBonus = levelReached * 2;
    
    const totalReward = Math.floor(baseReward + scoreBonus + timeBonus + levelBonus);

    // Update user in database
    const user = await UserModel.findOneAndUpdate(
      { walletAddress },
      { 
        $inc: { 
          totalCademEarned: totalReward,
          experiencePoints: totalReward * 10 
        } 
      },
      { new: true }
    );

    res.json({
      success: true,
      data: {
        reward: totalReward,
        newBalance: user?.currentCademBalance,
        experienceGained: totalReward * 10
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to end game session' 
    });
  }
});

export default router;
