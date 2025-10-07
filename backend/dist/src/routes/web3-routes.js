"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blockchainService_1 = require("../services/web3/blockchainService");
const User_1 = require("../../models/User");
const router = (0, express_1.Router)();
// Get blockchain status and network info
router.get('/status', async (req, res) => {
    try {
        const networkInfo = await blockchainService_1.web3Service.getNetworkInfo();
        const isConnected = blockchainService_1.web3Service.isWeb3Connected();
        res.json({
            success: true,
            data: {
                connected: isConnected,
                network: networkInfo,
                contracts: {
                    token: process.env.CADEM_TOKEN_ADDRESS || 'Not configured',
                    nft: process.env.NFT_CONTRACT_ADDRESS || 'Not configured',
                    marketplace: process.env.MARKETPLACE_ADDRESS || 'Not configured'
                },
                mode: isConnected ? 'Live Blockchain' : 'Mock Mode'
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get blockchain status'
        });
    }
});
// Get user's blockchain data (tokens + NFTs)
router.get('/user/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        // Validate wallet address format
        if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid wallet address format'
            });
        }
        // Get blockchain data
        const [tokenBalance, userNFTs] = await Promise.all([
            blockchainService_1.web3Service.getTokenBalance(walletAddress),
            blockchainService_1.web3Service.getUserNFTs(walletAddress)
        ]);
        // Get database data
        let user = await User_1.UserModel.findOne({ walletAddress });
        if (!user) {
            user = await User_1.UserModel.create({
                walletAddress,
                username: `Player_${walletAddress.slice(0, 8)}`,
                currentCademBalance: parseFloat(tokenBalance)
            });
        }
        res.json({
            success: true,
            data: {
                walletAddress,
                blockchain: {
                    tokenBalance: parseFloat(tokenBalance),
                    nftCount: userNFTs.length,
                    nfts: userNFTs
                },
                database: {
                    username: user.username,
                    level: user.level,
                    experiencePoints: user.experiencePoints,
                    totalCademEarned: user.totalCademEarned,
                    currentCademBalance: user.currentCademBalance
                },
                combined: {
                    totalBalance: Math.max(parseFloat(tokenBalance), user.currentCademBalance),
                    hasNFTs: userNFTs.length > 0
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching user blockchain data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user blockchain data'
        });
    }
});
// Sync user's blockchain balance with database
router.post('/sync/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid wallet address format'
            });
        }
        // Get current blockchain balance
        const blockchainBalance = await blockchainService_1.web3Service.getTokenBalance(walletAddress);
        // Update database
        const user = await User_1.UserModel.findOneAndUpdate({ walletAddress }, {
            walletAddress,
            currentCademBalance: parseFloat(blockchainBalance)
        }, { upsert: true, new: true });
        console.log(`🔄 Synced balance for ${walletAddress}: ${blockchainBalance} CADEM`);
        res.json({
            success: true,
            data: {
                walletAddress,
                syncedBalance: parseFloat(blockchainBalance),
                user: {
                    username: user.username,
                    level: user.level,
                    totalEarned: user.totalCademEarned,
                    currentBalance: user.currentCademBalance
                }
            },
            message: 'Balance synced successfully'
        });
    }
    catch (error) {
        console.error('Error syncing balance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sync balance'
        });
    }
});
// Get NFT details
router.get('/nft/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid wallet address format'
            });
        }
        const userNFTs = await blockchainService_1.web3Service.getUserNFTs(walletAddress);
        res.json({
            success: true,
            data: {
                walletAddress,
                nftCount: userNFTs.length,
                nfts: userNFTs,
                summary: {
                    total: userNFTs.length,
                    byRarity: userNFTs.reduce((acc, nft) => {
                        acc[nft.rarity] = (acc[nft.rarity] || 0) + 1;
                        return acc;
                    }, {})
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching NFTs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch NFTs'
        });
    }
});
// Reward user with tokens (admin function - would need authentication in production)
router.post('/reward/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { amount, reason } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid reward amount'
            });
        }
        // In a real implementation, this would trigger a blockchain transaction
        // For now, we'll just update the database
        const user = await User_1.UserModel.findOneAndUpdate({ walletAddress }, {
            $inc: {
                totalCademEarned: amount,
                currentCademBalance: amount,
                experiencePoints: amount * 10
            }
        }, { new: true, upsert: true });
        // Check for level up
        const newLevel = Math.floor(user.experiencePoints / 1000) + 1;
        if (newLevel > user.level) {
            user.level = newLevel;
            await user.save();
        }
        console.log(`🎁 Rewarded ${walletAddress} with ${amount} CADEM (${reason})`);
        res.json({
            success: true,
            data: {
                walletAddress,
                rewardAmount: amount,
                reason,
                user: {
                    newBalance: user.currentCademBalance,
                    totalEarned: user.totalCademEarned,
                    level: user.level,
                    experiencePoints: user.experiencePoints
                }
            },
            message: `Successfully rewarded ${amount} CADEM tokens`
        });
    }
    catch (error) {
        console.error('Error rewarding user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reward user'
        });
    }
});
// Get aggregated blockchain statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const totalUsers = await User_1.UserModel.countDocuments();
        const totalTokensInDB = await User_1.UserModel.aggregate([
            { $group: { _id: null, total: { $sum: '$currentCademBalance' } } }
        ]);
        const networkInfo = await blockchainService_1.web3Service.getNetworkInfo();
        const isConnected = blockchainService_1.web3Service.isWeb3Connected();
        res.json({
            success: true,
            data: {
                blockchain: {
                    connected: isConnected,
                    network: networkInfo.name,
                    chainId: networkInfo.chainId
                },
                users: {
                    total: totalUsers,
                    totalTokensHeld: totalTokensInDB[0]?.total || 0
                },
                contracts: {
                    token: process.env.CADEM_TOKEN_ADDRESS ? 'Deployed' : 'Not configured',
                    nft: process.env.NFT_CONTRACT_ADDRESS ? 'Deployed' : 'Not configured',
                    marketplace: process.env.MARKETPLACE_ADDRESS ? 'Deployed' : 'Not configured'
                },
                mode: isConnected ? 'Live Blockchain Mode' : 'Mock Development Mode'
            }
        });
    }
    catch (error) {
        console.error('Error fetching blockchain stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch blockchain statistics'
        });
    }
});
exports.default = router;
