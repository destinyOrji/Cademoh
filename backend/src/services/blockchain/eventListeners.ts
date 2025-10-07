import { blockchainService } from './blockchainService';
import { UserModel } from '../../../models/User';

export class EventListenerService {
  private isRunning = false;

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('🎯 Starting simulated blockchain event listeners...');
    
    // Simulate periodic blockchain events
    this.simulateBlockchainEvents();
  }

  private simulateBlockchainEvents() {
    // Simulate random transfers every 30 seconds
    setInterval(async () => {
      try {
        const users = await UserModel.find().limit(5);
        if (users.length >= 2) {
          const [user1, user2] = users;
          const amount = (Math.random() * 10 + 1).toFixed(2);
          
          await blockchainService.transferTokens(
            user1.walletAddress,
            user2.walletAddress,
            amount
          );
          
          console.log(`🤖 Simulated transfer: ${user1.walletAddress} -> ${user2.walletAddress} ${amount} CADEM`);
        }
      } catch (error) {
        // Ignore simulation errors
      }
    }, 30000); // Every 30 seconds
  }

  // Simulate a game reward transaction
  async simulateGameReward(walletAddress: string, amount: number): Promise<boolean> {
    console.log(`🎮 Simulating game reward: ${walletAddress} + ${amount} CADEM`);
    
    const currentBalance = parseFloat(await blockchainService.getTokenBalance(walletAddress));
    const newBalance = (currentBalance + amount).toString();
    
    // Update simulated balance
    (blockchainService as any).simulatedBalances.set(walletAddress, newBalance);
    
    return true;
  }
}

export const eventListenerService = new EventListenerService();
