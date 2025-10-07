import { Router } from 'express';
import { UserModel } from '../../models/User';

const router = Router();

// Get leaderboard by different metrics
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params; // tokens, level, experience
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    let sortField = 'totalCademEarned';
    let title = 'Top Token Earners';

    switch (type) {
      case 'tokens':
        sortField = 'totalCademEarned';
        title = 'Top Token Earners';
        break;
      case 'level':
        sortField = 'level';
        title = 'Highest Level Players';
        break;
      case 'experience':
        sortField = 'experiencePoints';
        title = 'Most Experienced Players';
        break;
      case 'balance':
        sortField = 'currentCademBalance';
        title = 'Richest Players';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid leaderboard type. Use: tokens, level, experience, or balance'
        });
    }

    const users = await UserModel.find()
      .sort({ [sortField]: -1, createdAt: 1 }) // Secondary sort by creation date for ties
      .skip(offset)
      .limit(limit)
      .select('walletAddress username totalCademEarned currentCademBalance level experiencePoints createdAt');

    // Add ranks
    const rankedUsers = users.map((user, index) => ({
      rank: offset + index + 1,
      walletAddress: user.walletAddress,
      username: user.username || `Player_${user.walletAddress.slice(0, 8)}`,
      totalCademEarned: user.totalCademEarned,
      currentCademBalance: user.currentCademBalance,
      level: user.level,
      experiencePoints: user.experiencePoints,
      joinedAt: user.createdAt
    }));

    // Get total count for pagination
    const totalUsers = await UserModel.countDocuments();

    res.json({
      success: true,
      data: {
        title,
        type,
        users: rankedUsers,
        pagination: {
          total: totalUsers,
          limit,
          offset,
          hasMore: offset + limit < totalUsers
        }
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch leaderboard' 
    });
  }
});

// Get user's position in leaderboard
router.get('/:type/position/:walletAddress', async (req, res) => {
  try {
    const { type, walletAddress } = req.params;

    let sortField = 'totalCademEarned';
    switch (type) {
      case 'tokens':
        sortField = 'totalCademEarned';
        break;
      case 'level':
        sortField = 'level';
        break;
      case 'experience':
        sortField = 'experiencePoints';
        break;
      case 'balance':
        sortField = 'currentCademBalance';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid leaderboard type'
        });
    }

    const user = await UserModel.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Calculate rank
    const rank = await UserModel.countDocuments({
      [sortField]: { $gt: user[sortField as keyof typeof user] }
    }) + 1;

    const totalUsers = await UserModel.countDocuments();
    const percentile = Math.round((1 - (rank - 1) / totalUsers) * 100);

    // Get users around this user (5 above, 5 below)
    const usersAbove = await UserModel.find({
      [sortField]: { $gt: user[sortField as keyof typeof user] }
    })
      .sort({ [sortField]: 1 })
      .limit(5)
      .select('walletAddress username totalCademEarned currentCademBalance level experiencePoints');

    const usersBelow = await UserModel.find({
      [sortField]: { $lt: user[sortField as keyof typeof user] }
    })
      .sort({ [sortField]: -1 })
      .limit(5)
      .select('walletAddress username totalCademEarned currentCademBalance level experiencePoints');

    res.json({
      success: true,
      data: {
        user: {
          walletAddress: user.walletAddress,
          username: user.username || `Player_${user.walletAddress.slice(0, 8)}`,
          totalCademEarned: user.totalCademEarned,
          currentCademBalance: user.currentCademBalance,
          level: user.level,
          experiencePoints: user.experiencePoints
        },
        position: {
          rank,
          totalUsers,
          percentile
        },
        context: {
          usersAbove: usersAbove.reverse(),
          usersBelow
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user position:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user position' 
    });
  }
});

// Get leaderboard statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalTokensEarned = await UserModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalCademEarned' } } }
    ]);
    
    const averageLevel = await UserModel.aggregate([
      { $group: { _id: null, avg: { $avg: '$level' } } }
    ]);

    const topPlayer = await UserModel.findOne()
      .sort({ totalCademEarned: -1 })
      .select('walletAddress username totalCademEarned level');

    const recentPlayers = await UserModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('walletAddress username totalCademEarned level createdAt');

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTokensEarned: totalTokensEarned[0]?.total || 0,
        averageLevel: Math.round(averageLevel[0]?.avg || 1),
        topPlayer: topPlayer ? {
          walletAddress: topPlayer.walletAddress,
          username: topPlayer.username || `Player_${topPlayer.walletAddress.slice(0, 8)}`,
          totalCademEarned: topPlayer.totalCademEarned,
          level: topPlayer.level
        } : null,
        recentPlayers: recentPlayers.map(player => ({
          walletAddress: player.walletAddress,
          username: player.username || `Player_${player.walletAddress.slice(0, 8)}`,
          totalCademEarned: player.totalCademEarned,
          level: player.level,
          joinedAt: player.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch leaderboard stats' 
    });
  }
});

export default router;
