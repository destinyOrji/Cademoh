"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../../models/User");
const contractService_1 = require("../services/blockchain/contractService");
const router = (0, express_1.Router)();
// Get user profile by wallet address
router.get('/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        // Find user in database or create new one
        let user = await User_1.UserModel.findOne({ walletAddress });
        if (!user) {
            user = await User_1.UserModel.create({ walletAddress });
        }
        // Get real-time blockchain data
        const blockchainBalance = await contractService_1.blockchainService.getTokenBalance(walletAddress);
        const userNFTs = await contractService_1.blockchainService.getUserNFTs(walletAddress);
        res.json({
            success: true,
            data: {
                user,
                blockchainBalance,
                nfts: userNFTs
            }
        });
    }
    catch (error) {
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
        const user = await User_1.UserModel.findOneAndUpdate({ walletAddress }, { username, walletAddress }, { upsert: true, new: true });
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create user'
        });
    }
});
exports.default = router;
