"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventListenerService = exports.EventListenerService = void 0;
const blockchainService_1 = require("./blockchainService");
const User_1 = require("../../../models/User");
class EventListenerService {
    constructor() {
        this.isRunning = false;
    }
    async start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        console.log('🎯 Starting simulated blockchain event listeners...');
        // Simulate periodic blockchain events
        this.simulateBlockchainEvents();
    }
    simulateBlockchainEvents() {
        // Simulate random transfers every 30 seconds
        setInterval(async () => {
            try {
                const users = await User_1.UserModel.find().limit(5);
                if (users.length >= 2) {
                    const [user1, user2] = users;
                    const amount = (Math.random() * 10 + 1).toFixed(2);
                    await blockchainService_1.blockchainService.transferTokens(user1.walletAddress, user2.walletAddress, amount);
                    console.log(`🤖 Simulated transfer: ${user1.walletAddress} -> ${user2.walletAddress} ${amount} CADEM`);
                }
            }
            catch (error) {
                // Ignore simulation errors
            }
        }, 30000); // Every 30 seconds
    }
    // Simulate a game reward transaction
    async simulateGameReward(walletAddress, amount) {
        console.log(`🎮 Simulating game reward: ${walletAddress} + ${amount} CADEM`);
        const currentBalance = parseFloat(await blockchainService_1.blockchainService.getTokenBalance(walletAddress));
        const newBalance = (currentBalance + amount).toString();
        // Update simulated balance
        blockchainService_1.blockchainService.simulatedBalances.set(walletAddress, newBalance);
        return true;
    }
}
exports.EventListenerService = EventListenerService;
exports.eventListenerService = new EventListenerService();
