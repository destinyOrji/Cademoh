import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/database';

// Import database routes
import databaseUserRoutes from './src/routes/database-users';
import databaseGameRoutes from './src/routes/database-game';
import databaseLeaderboardRoutes from './src/routes/database-leaderboard';

// Import Web3 routes
import web3Routes from './src/routes/web3-routes';
import { web3Service } from './src/services/web3/blockchainService';

// Import blockchain simulation services
import { blockchainService } from './src/services/blockchain/blockchainService';
import { eventListenerService } from './src/services/blockchain/eventListeners';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database routes
app.use('/api/users', databaseUserRoutes);
app.use('/api/game', databaseGameRoutes);
app.use('/api/leaderboard', databaseLeaderboardRoutes);

// Web3 blockchain routes
app.use('/api/web3', web3Routes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Cademoh Backend with MongoDB is running!',
    timestamp: new Date().toISOString(),
    features: ['MongoDB Database', 'User Management', 'Real-time Leaderboard', 'Game Sessions', 'Blockchain Simulation']
  });
});

// Get blockchain info
app.get('/api/blockchain/info', (req, res) => {
  res.json({
    success: true,
    data: {
      mode: 'simulation',
      contracts: blockchainService.getContractAddresses(),
      network: 'Ethereum Sepolia (Simulated)',
      status: 'connected'
    }
  });
});

// Transfer tokens between users
app.post('/api/blockchain/transfer', async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    
    await blockchainService.transferTokens(from, to, amount);
    
    res.json({
      success: true,
      data: {
        from,
        to,
        amount,
        message: 'Transfer completed successfully'
      }
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Transfer failed'
    });
  }
});

// Mint a new NFT
app.post('/api/blockchain/mint-nft', async (req, res) => {
  try {
    const { to, name, rarity, image } = req.body;
    
    await blockchainService.mintNFT(to, { name, rarity, image });
    
    res.json({
      success: true,
      data: {
        to,
        nft: { name, rarity, image },
        message: 'NFT minted successfully'
      }
    });
  } catch (error) {
    console.error('Mint NFT error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'NFT minting failed'
    });
  }
});

// Initialize server with database and Web3
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    
    // Initialize Web3 blockchain listeners
    await web3Service.startEventListeners();
    
    // Start blockchain simulation services
    await eventListenerService.start();
    
    app.listen(PORT, () => {
      console.log(`🚀 Cademoh Backend running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`👤 User API: http://localhost:${PORT}/api/users/:walletAddress`);
      console.log(`🎮 Game API: http://localhost:${PORT}/api/game/start-session`);
      console.log(`🏆 Leaderboard: http://localhost:${PORT}/api/leaderboard/tokens`);
      console.log(`🔗 Web3 API: http://localhost:${PORT}/api/web3/status`);
      console.log(`⛓️  Blockchain Info: http://localhost:${PORT}/api/blockchain/info`);
      console.log(`💸 Token Transfer: http://localhost:${PORT}/api/blockchain/transfer`);
      console.log(`🎨 Mint NFT: http://localhost:${PORT}/api/blockchain/mint-nft`);
      console.log(`📊 Database: MongoDB with real-time updates`);
      console.log(`🎯 Blockchain: Simulation Mode with Event Listeners`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();