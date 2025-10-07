import { Router } from 'express';
import { UserModel } from '../../models/User';

const router = Router();

// Game session model (in-memory for now, could be moved to database)
interface GameSession {
  sessionId: string;
  walletAddress: string;
  gameId: string;
  startTime: Date;
  status: 'active' | 'completed' | 'abandoned';
  score?: number;
  level?: number;
  timePlayed?: number;
}

const activeSessions = new Map<string, GameSession>();

// Start a game session
router.post('/start-session', async (req, res) => {
  try {
    const { walletAddress, gameId } = req.body;

    if (!walletAddress || !gameId) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress and gameId are required'
      });
    }

    // Ensure user exists in database
    let user = await UserModel.findOne({ walletAddress });
    if (!user) {
      user = await UserModel.create({ 
        walletAddress,
        username: `Player_${walletAddress.slice(0, 8)}`
      });
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: GameSession = {
      sessionId,
      walletAddress,
      gameId,
      startTime: new Date(),
      status: 'active'
    };

    activeSessions.set(sessionId, session);

    console.log(`🎮 Started game session: ${sessionId} for ${walletAddress}`);

    res.json({
      success: true,
      data: {
        sessionId,
        walletAddress,
        gameId,
        startTime: session.startTime,
        user: {
          level: user.level,
          currentBalance: user.currentCademBalance,
          totalEarned: user.totalCademEarned
        }
      }
    });
  } catch (error) {
    console.error('Error starting game session:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start game session' 
    });
  }
});

// End game session and calculate rewards
router.post('/end-session', async (req, res) => {
  try {
    const { sessionId, walletAddress, score, timePlayed, levelReached, gameId } = req.body;

    if (!sessionId || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'sessionId and walletAddress are required'
      });
    }

    // Validate session
    const session = activeSessions.get(sessionId);
    if (!session || session.walletAddress !== walletAddress) {
      return res.status(404).json({
        success: false,
        error: 'Invalid session or session not found'
      });
    }

    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Session already completed'
      });
    }

    // Calculate rewards based on performance
    const rewards = calculateGameRewards({
      score: score || 0,
      timePlayed: timePlayed || 0,
      levelReached: levelReached || 1,
      gameId: gameId || session.gameId
    });

    // Update user in database
    const user = await UserModel.findOneAndUpdate(
      { walletAddress },
      { 
        $inc: { 
          totalCademEarned: rewards.tokens,
          currentCademBalance: rewards.tokens,
          experiencePoints: rewards.experience
        }
      },
      { new: true, upsert: true }
    );

    // Check for level up
    const newLevel = Math.floor(user.experiencePoints / 1000) + 1;
    let leveledUp = false;
    if (newLevel > user.level) {
      user.level = newLevel;
      await user.save();
      leveledUp = true;
      console.log(`🎉 ${walletAddress} leveled up to ${newLevel}!`);
    }

    // Update session
    session.status = 'completed';
    session.score = score;
    session.level = levelReached;
    session.timePlayed = timePlayed;

    // Calculate session duration
    const sessionDuration = Date.now() - session.startTime.getTime();

    console.log(`🏆 Game completed: ${sessionId}, Rewards: ${rewards.tokens} CADEM, ${rewards.experience} XP`);

    res.json({
      success: true,
      data: {
        sessionId,
        rewards: {
          tokens: rewards.tokens,
          experience: rewards.experience,
          breakdown: rewards.breakdown
        },
        user: {
          newBalance: user.currentCademBalance,
          totalEarned: user.totalCademEarned,
          level: user.level,
          experiencePoints: user.experiencePoints,
          leveledUp
        },
        session: {
          duration: Math.round(sessionDuration / 1000), // seconds
          score,
          levelReached,
          timePlayed
        }
      }
    });

    // Clean up session after 1 hour
    setTimeout(() => {
      activeSessions.delete(sessionId);
    }, 60 * 60 * 1000);

  } catch (error) {
    console.error('Error ending game session:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to end game session' 
    });
  }
});

// Get active session info
router.get('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = activeSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    const sessionDuration = Date.now() - session.startTime.getTime();

    res.json({
      success: true,
      data: {
        ...session,
        duration: Math.round(sessionDuration / 1000) // seconds
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch session' 
    });
  }
});

// Get user's game statistics
router.get('/stats/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const user = await UserModel.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's rank
    const rank = await UserModel.countDocuments({
      totalCademEarned: { $gt: user.totalCademEarned }
    }) + 1;

    const totalUsers = await UserModel.countDocuments();

    res.json({
      success: true,
      data: {
        user: {
          walletAddress: user.walletAddress,
          username: user.username || `Player_${user.walletAddress.slice(0, 8)}`,
          level: user.level,
          experiencePoints: user.experiencePoints,
          totalCademEarned: user.totalCademEarned,
          currentCademBalance: user.currentCademBalance
        },
        ranking: {
          rank,
          totalUsers,
          percentile: Math.round((1 - (rank - 1) / totalUsers) * 100)
        },
        progress: {
          currentLevelXP: user.experiencePoints % 1000,
          nextLevelXP: 1000,
          progressPercent: Math.round((user.experiencePoints % 1000) / 10)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch game stats' 
    });
  }
});

// Reward calculation function
function calculateGameRewards(gameData: {
  score: number;
  timePlayed: number;
  levelReached: number;
  gameId: string;
}): {
  tokens: number;
  experience: number;
  breakdown: any;
} {
  const { score, timePlayed, levelReached, gameId } = gameData;

  // Base rewards
  let baseTokens = 10;
  let baseXP = 50;

  // Game-specific multipliers
  const gameMultipliers: { [key: string]: number } = {
    'puzzle_quest': 1.0,
    'tower_defense': 1.2,
    'racing_game': 0.8,
    'strategy_game': 1.5
  };

  const multiplier = gameMultipliers[gameId] || 1.0;

  // Score bonus (up to 100% bonus)
  const scoreBonus = Math.min(score * 0.01, baseTokens);
  
  // Time bonus (bonus for playing 2-5 minutes, penalty for too long)
  let timeBonus = 0;
  if (timePlayed >= 120 && timePlayed <= 300) { // 2-5 minutes
    timeBonus = baseTokens * 0.2; // 20% bonus
  } else if (timePlayed > 300) {
    timeBonus = Math.max(0, baseTokens * 0.1 - (timePlayed - 300) * 0.1); // Diminishing returns
  }

  // Level bonus
  const levelBonus = levelReached * 2;

  // Calculate final rewards
  const totalTokens = Math.floor((baseTokens + scoreBonus + timeBonus + levelBonus) * multiplier);
  const totalXP = Math.floor((baseXP + (score * 0.1) + (levelReached * 10)) * multiplier);

  return {
    tokens: totalTokens,
    experience: totalXP,
    breakdown: {
      base: baseTokens,
      scoreBonus: Math.floor(scoreBonus),
      timeBonus: Math.floor(timeBonus),
      levelBonus,
      multiplier,
      total: totalTokens
    }
  };
}

export default router;
