import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../providers/Web3Provider';
import { AdminSignIn } from '../../components/AdminSignIn';
import { AdminSignUp } from '../../components/AdminSignUp';
import '../../styles/GlobalStyles.css';
import '../../styles/LayoutFixes.css';

interface AdminStats {
  totalUsers: number;
  totalCADEMDistributed: number;
  totalNFTsMinted: number;
  totalGamesPlayed: number;
  activeUsers24h: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalTransactionFees: number;
  stakingRewards: number;
  nftRoyalties: number;
  platformGrowth: number;
}

interface User {
  id: string;
  walletAddress: string;
  username: string;
  level: number;
  totalEarned: number;
  currentBalance: number;
  joinedAt: string;
  isActive: boolean;
  isBanned: boolean;
}

interface Game {
  id: string;
  name: string;
  description: string;
  minReward: number;
  maxReward: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isActive: boolean;
  totalPlayers: number;
  totalSessions: number;
}

interface NFTCollection {
  id: string;
  name: string;
  category: string;
  rarity: string;
  basePrice: number;
  totalMinted: number;
  isActive: boolean;
}

export const AdminDashboard: React.FC = () => {
  const { isConnected, user, walletAddress } = useWeb3();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'games' | 'users' | 'marketplace' | 'leaderboard' | 'settings' | 'analytics' | 'contracts'>('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [adminAccounts, setAdminAccounts] = useState<Array<{username: string; email: string; password: string}>>([
    { username: 'admin', email: 'admin@cadem.com', password: 'cadem2024' }
  ]);

  // State for different sections
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 10247,
    totalCADEMDistributed: 1250000,
    totalNFTsMinted: 5432,
    totalGamesPlayed: 45678,
    activeUsers24h: 1234,
    totalRevenue: 89500,
    monthlyRevenue: 25800,
    totalTransactionFees: 12450,
    stakingRewards: 8900,
    nftRoyalties: 15600,
    platformGrowth: 23.5
  });

  const [users, setUsers] = useState<User[]>([
    { id: '1', walletAddress: '0x1234...5678', username: 'Player_abc123', level: 15, totalEarned: 1250.50, currentBalance: 450.25, joinedAt: '2024-01-15', isActive: true, isBanned: false },
    { id: '2', walletAddress: '0x2345...6789', username: 'Player_def456', level: 8, totalEarned: 890.75, currentBalance: 320.10, joinedAt: '2024-02-20', isActive: true, isBanned: false },
    { id: '3', walletAddress: '0x3456...7890', username: 'Player_ghi789', level: 22, totalEarned: 2150.00, currentBalance: 750.80, joinedAt: '2024-01-05', isActive: false, isBanned: true }
  ]);

  const [games, setGames] = useState<Game[]>([
    { id: '1', name: 'Precision Clicker', description: 'Test reaction time and accuracy', minReward: 5, maxReward: 25, difficulty: 'Easy', isActive: true, totalPlayers: 5432, totalSessions: 12345 },
    { id: '2', name: 'Memory Match', description: 'Match tiles and earn rewards', minReward: 10, maxReward: 50, difficulty: 'Medium', isActive: true, totalPlayers: 3210, totalSessions: 8765 },
    { id: '3', name: 'Speed Runner', description: 'Avoid obstacles and complete levels', minReward: 20, maxReward: 100, difficulty: 'Hard', isActive: false, totalPlayers: 1876, totalSessions: 4321 }
  ]);

  const [nftCollections, setNftCollections] = useState<NFTCollection[]>([
    { id: '1', name: 'Legendary Sword', category: 'Weapons', rarity: 'Legendary', basePrice: 250, totalMinted: 50, isActive: true },
    { id: '2', name: 'Epic Shield', category: 'Items', rarity: 'Epic', basePrice: 100, totalMinted: 150, isActive: true },
    { id: '3', name: 'Rare Helmet', category: 'Accessories', rarity: 'Rare', basePrice: 50, totalMinted: 300, isActive: false }
  ]);

  // Admin sign-up handler
  const handleAdminSignUp = async (credentials: { username: string; email: string; password: string }) => {
    setAuthLoading(true);
    setAuthError('');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if username already exists
      const existingAccount = adminAccounts.find(account => account.username === credentials.username);
      if (existingAccount) {
        setAuthError('Username already exists. Please choose a different username.');
        return;
      }
      
      // Add new admin account
      setAdminAccounts([...adminAccounts, credentials]);
      setIsAdminAuthenticated(true);
      setAuthError('');
      setShowSignUp(false);
    } catch {
      setAuthError('Account creation failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Admin sign-in handler
  const handleAdminSignIn = async (credentials: { username: string; password: string }) => {
    setAuthLoading(true);
    setAuthError('');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check credentials against stored accounts
      const validAccount = adminAccounts.find(
        account => account.username === credentials.username && account.password === credentials.password
      );
      
      if (validAccount) {
        setIsAdminAuthenticated(true);
        setAuthError('');
      } else {
        setAuthError('Invalid admin credentials. Please check your username and password.');
      }
    } catch {
      setAuthError('Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Check if user should have access to admin dashboard
  const hasAdminAccess = isAdminAuthenticated || walletAddress === '0x1234567890123456789012345678901234567890' || user?.level >= 100;

  // Show sign-up or sign-in form if not authenticated
  if (!hasAdminAccess) {
    if (showSignUp) {
      return (
        <AdminSignUp 
          onSignUp={handleAdminSignUp}
          onSwitchToLogin={() => setShowSignUp(false)}
          error={authError}
          loading={authLoading}
        />
      );
    } else {
      return (
        <AdminSignIn 
          onSignIn={handleAdminSignIn}
          onSwitchToSignUp={() => setShowSignUp(true)}
          error={authError}
          loading={authLoading}
        />
      );
    }
  }

  const toggleUserStatus = (userId: string, field: 'isActive' | 'isBanned') => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, [field]: !user[field] } : user
    ));
  };

  const toggleGameStatus = (gameId: string) => {
    setGames(games.map(game => 
      game.id === gameId ? { ...game, isActive: !game.isActive } : game
    ));
  };

  const toggleNFTStatus = (nftId: string) => {
    setNftCollections(nftCollections.map(nft => 
      nft.id === nftId ? { ...nft, isActive: !nft.isActive } : nft
    ));
  };

  // Games Management Section
  const renderGamesManagement = () => (
    <div className="space-y-6">
      <div className="card-gaming">
        <h2 className="heading-md mb-6 text-green-400">🎮 Games Management</h2>
        <div className="space-y-4">
          {games.map(game => (
            <div key={game.id} className="bg-white/5 p-6 rounded-xl border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                  <p className="text-gray-400 mb-3">{game.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-400">Reward: {game.minReward}-{game.maxReward} CADEM</span>
                    <span className={`px-2 py-1 rounded ${
                      game.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                      game.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {game.difficulty}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => toggleGameStatus(game.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      game.isActive 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                    }`}
                  >
                    {game.isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-500/10 p-3 rounded-lg">
                  <span className="text-blue-400">Total Players: </span>
                  <span className="text-white font-bold">{game.totalPlayers.toLocaleString()}</span>
                </div>
                <div className="bg-purple-500/10 p-3 rounded-lg">
                  <span className="text-purple-400">Total Sessions: </span>
                  <span className="text-white font-bold">{game.totalSessions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Marketplace Management Section
  const renderMarketplaceManagement = () => (
    <div className="space-y-6">
      <div className="card-gaming">
        <h2 className="heading-md mb-6 text-yellow-400">🛒 Marketplace Management</h2>
        <div className="grid-responsive mb-6">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="text-green-400 text-sm mb-1">Trading Volume</h3>
            <p className="text-2xl font-bold text-green-300">$45,230</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30 text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-blue-400 text-sm mb-1">Active Listings</h3>
            <p className="text-2xl font-bold text-blue-300">1,234</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-4 rounded-xl border border-purple-500/30 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="text-purple-400 text-sm mb-1">Trading Fees</h3>
            <p className="text-2xl font-bold text-purple-300">$1,130</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 p-4 rounded-xl border border-pink-500/30 text-center">
            <div className="text-3xl mb-2">🎨</div>
            <h3 className="text-pink-400 text-sm mb-1">NFT Collections</h3>
            <p className="text-2xl font-bold text-pink-300">{nftCollections.length}</p>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-white mb-4">NFT Collections</h3>
        <div className="space-y-4">
          {nftCollections.map(nft => (
            <div key={nft.id} className="bg-white/5 p-6 rounded-xl border border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">{nft.name}</h4>
                  <div className="flex gap-4 text-sm mb-3">
                    <span className="text-blue-400">Category: {nft.category}</span>
                    <span className={`px-2 py-1 rounded ${
                      nft.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                      nft.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {nft.rarity}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-400">Base Price: {nft.basePrice} CADEM</span>
                    <span className="text-gray-400">Minted: {nft.totalMinted}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleNFTStatus(nft.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    nft.isActive 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                      : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                  }`}
                >
                  {nft.isActive ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Leaderboard Management Section
  const renderLeaderboardManagement = () => (
    <div className="space-y-6">
      <div className="card-gaming">
        <h2 className="heading-md mb-6 text-orange-400">🏆 Leaderboard Management</h2>
        <div className="grid-responsive mb-6">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-500/30 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="text-yellow-400 text-sm mb-1">Active Competitions</h3>
            <p className="text-2xl font-bold text-yellow-300">5</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-4 rounded-xl border border-purple-500/30 text-center">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="text-purple-400 text-sm mb-1">Participants</h3>
            <p className="text-2xl font-bold text-purple-300">2,847</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="text-green-400 text-sm mb-1">Prize Pool</h3>
            <p className="text-2xl font-bold text-green-300">50,000 CADEM</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30 text-center">
            <div className="text-3xl mb-2">⏰</div>
            <h3 className="text-blue-400 text-sm mb-1">Time Remaining</h3>
            <p className="text-2xl font-bold text-blue-300">5d 12h</p>
          </div>
        </div>
        
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Competition Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="btn-primary">Start New Competition</button>
            <button className="btn-secondary">End Current Season</button>
            <button className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-2 rounded-lg hover:bg-yellow-500/30 transition-all">
              Reset Rankings
            </button>
            <button className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-all">
              Distribute Rewards
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Analytics Section
  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="card-gaming">
        <h2 className="heading-md mb-6 text-green-400">📈 Advanced Analytics</h2>
        
        {/* Revenue Breakdown */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Revenue Breakdown</h3>
          <div className="grid-responsive">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30 text-center">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="text-blue-400 text-sm mb-1">NFT Sales</h4>
              <p className="text-xl font-bold text-white">40%</p>
              <p className="text-sm text-blue-300">$35,800</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30 text-center">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="text-green-400 text-sm mb-1">Token Taxes</h4>
              <p className="text-xl font-bold text-white">21%</p>
              <p className="text-sm text-green-300">$18,795</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-4 rounded-xl border border-purple-500/30 text-center">
              <div className="text-2xl mb-2">👑</div>
              <h4 className="text-purple-400 text-sm mb-1">Royalties</h4>
              <p className="text-xl font-bold text-white">17%</p>
              <p className="text-sm text-purple-300">$15,215</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-500/30 text-center">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="text-yellow-400 text-sm mb-1">Trading Fees</h4>
              <p className="text-xl font-bold text-white">14%</p>
              <p className="text-sm text-yellow-300">$12,530</p>
            </div>
          </div>
        </div>

        {/* User Analytics */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4">User Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h4 className="text-blue-400 font-medium mb-3">Daily Active Users</h4>
              <p className="text-3xl font-bold text-white mb-2">2,847</p>
              <span className="text-green-400 text-sm">+12.5% from yesterday</span>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h4 className="text-purple-400 font-medium mb-3">User Retention</h4>
              <p className="text-3xl font-bold text-white mb-2">78%</p>
              <span className="text-green-400 text-sm">+3.2% this month</span>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h4 className="text-yellow-400 font-medium mb-3">ARPU</h4>
              <p className="text-3xl font-bold text-white mb-2">$8.74</p>
              <span className="text-green-400 text-sm">+5.8% this month</span>
            </div>
          </div>
        </div>

        {/* Growth Projections */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Growth Projections</h3>
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-green-400 font-medium mb-3">Monthly Revenue Forecast</h4>
                <p className="text-2xl font-bold text-white mb-2">$110K - $250K</p>
                <p className="text-sm text-gray-400">Based on current growth trends</p>
              </div>
              <div>
                <h4 className="text-blue-400 font-medium mb-3">Annual Revenue Projection</h4>
                <p className="text-2xl font-bold text-white mb-2">$1.3M - $3M</p>
                <p className="text-sm text-gray-400">Conservative estimate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Smart Contracts Section
  const renderSmartContracts = () => (
    <div className="space-y-6">
      <div className="card-gaming">
        <h2 className="heading-md mb-6 text-cyan-400">📋 Smart Contract Management</h2>
        
        {/* Contract Overview */}
        <div className="grid-responsive mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="text-green-400 text-sm mb-1">CADEM Token</h3>
            <p className="text-lg font-bold text-white">200M Balance</p>
            <p className="text-xs text-green-300">Treasury</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30 text-center">
            <div className="text-3xl mb-2">🎨</div>
            <h3 className="text-blue-400 text-sm mb-1">NFT Collection</h3>
            <p className="text-lg font-bold text-white">5,432 Minted</p>
            <p className="text-xs text-blue-300">Active</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-4 rounded-xl border border-purple-500/30 text-center">
            <div className="text-3xl mb-2">🏪</div>
            <h3 className="text-purple-400 text-sm mb-1">Marketplace</h3>
            <p className="text-lg font-bold text-white">99.7%</p>
            <p className="text-xs text-purple-300">Success Rate</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-500/30 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="text-yellow-400 text-sm mb-1">Staking</h3>
            <p className="text-lg font-bold text-white">1.2M Staked</p>
            <p className="text-xs text-yellow-300">Active</p>
          </div>
        </div>

        {/* Contract Controls */}
        <div className="space-y-6">
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">CADEM Token Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-green-400 text-sm">Buy Tax</p>
                <p className="text-2xl font-bold text-white">3%</p>
              </div>
              <div className="text-center">
                <p className="text-red-400 text-sm">Sell Tax</p>
                <p className="text-2xl font-bold text-white">5%</p>
              </div>
              <div className="text-center">
                <p className="text-blue-400 text-sm">Transfer Tax</p>
                <p className="text-2xl font-bold text-white">2%</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="btn-primary">Update Tax Rates</button>
              <button className="btn-secondary">Emergency Pause</button>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">NFT Collection Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-purple-400 text-sm">Royalty Rate</p>
                <p className="text-2xl font-bold text-white">7.5%</p>
              </div>
              <div className="text-center">
                <p className="text-yellow-400 text-sm">Minting Status</p>
                <p className="text-2xl font-bold text-green-400">Active</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="btn-primary">Update Royalties</button>
              <button className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all">
                Pause Minting
              </button>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Emergency Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all">
                Emergency Withdraw
              </button>
              <button className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-2 rounded-lg hover:bg-yellow-500/30 transition-all">
                Safe Mode
              </button>
              <button className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-all">
                Contract Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // User Management Section
  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="card-gaming">
        <h2 className="heading-md mb-6 text-blue-400">👥 User Management</h2>
        <div className="space-y-4">
          {users.map(user => (
            <div key={user.id} className="bg-white/5 p-6 rounded-xl border border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{user.username}</h3>
                  <p className="text-gray-400 text-sm mb-3">{user.walletAddress}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-400">Level: </span>
                      <span className="text-white font-bold">{user.level}</span>
                    </div>
                    <div>
                      <span className="text-green-400">Earned: </span>
                      <span className="text-white font-bold">${user.totalEarned}</span>
                    </div>
                    <div>
                      <span className="text-yellow-400">Balance: </span>
                      <span className="text-white font-bold">${user.currentBalance}</span>
                    </div>
                    <div>
                      <span className="text-purple-400">Joined: </span>
                      <span className="text-white font-bold">{user.joinedAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleUserStatus(user.id, 'isActive')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      user.isActive 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => toggleUserStatus(user.id, 'isBanned')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      user.isBanned 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {user.isBanned ? 'Unban' : 'Ban'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="card-gaming">
        <h2 className="heading-md mb-6 text-green-400">💰 Revenue Dashboard</h2>
        <div className="grid-responsive mb-6">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-500/30 text-center">
            <div className="text-4xl mb-3">💵</div>
            <h3 className="text-green-400 text-sm mb-2 font-medium">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-300 mb-2">${adminStats.totalRevenue.toLocaleString()}</p>
            <span className="text-xs text-green-400/80">All-time earnings</span>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-6 rounded-xl border border-blue-500/30 text-center">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="text-blue-400 text-sm mb-2 font-medium">Monthly Revenue</h3>
            <p className="text-3xl font-bold text-blue-300 mb-2">${adminStats.monthlyRevenue.toLocaleString()}</p>
            <span className="text-xs text-blue-400/80">This month</span>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-6 rounded-xl border border-purple-500/30 text-center">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-purple-400 text-sm mb-2 font-medium">NFT Royalties</h3>
            <p className="text-3xl font-bold text-purple-300 mb-2">${adminStats.nftRoyalties.toLocaleString()}</p>
            <span className="text-xs text-purple-400/80">7.5% royalties</span>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6 rounded-xl border border-yellow-500/30 text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-yellow-400 text-sm mb-2 font-medium">Transaction Fees</h3>
            <p className="text-3xl font-bold text-yellow-300 mb-2">${adminStats.totalTransactionFees.toLocaleString()}</p>
            <span className="text-xs text-yellow-400/80">Platform fees</span>
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="card-gaming">
        <h3 className="heading-md mb-6 text-blue-400">📊 Platform Overview</h3>
        <div className="grid-responsive">
          <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 p-4 rounded-xl border border-purple-500/20 text-center">
            <div className="text-3xl mb-2">👥</div>
            <h4 className="text-purple-400 text-xs mb-1">Total Users</h4>
            <p className="text-xl font-bold text-white">{adminStats.totalUsers.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 rounded-xl border border-green-500/20 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h4 className="text-green-400 text-xs mb-1">CADEM Distributed</h4>
            <p className="text-xl font-bold text-white">{adminStats.totalCADEMDistributed.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 p-4 rounded-xl border border-pink-500/20 text-center">
            <div className="text-3xl mb-2">🎨</div>
            <h4 className="text-pink-400 text-xs mb-1">NFTs Minted</h4>
            <p className="text-xl font-bold text-white">{adminStats.totalNFTsMinted.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-4 rounded-xl border border-yellow-500/20 text-center">
            <div className="text-3xl mb-2">📈</div>
            <h4 className="text-yellow-400 text-xs mb-1">Growth Rate</h4>
            <p className="text-xl font-bold text-white">+{adminStats.platformGrowth}%</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Header */}
        <header className="mb-responsive">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="heading-lg capitalize">{activeTab}</h1>
              <p className="text-gray-400 text-sm">
                {activeTab === 'dashboard' && 'Platform overview and revenue tracking'}
                {activeTab === 'analytics' && 'Advanced analytics and revenue insights'}
                {activeTab === 'contracts' && 'Smart contract management and controls'}
                {activeTab === 'users' && 'User management and administration'}
                {activeTab === 'marketplace' && 'NFT marketplace oversight'}
                {activeTab === 'leaderboard' && 'Competition and ranking management'}
                {activeTab === 'games' && 'Manage platform games and controls'}
                {activeTab === 'settings' && 'System configuration and preferences'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                System Online
              </div>
              {isAdminAuthenticated && (
                <button
                  onClick={() => setIsAdminAuthenticated(false)}
                  className="btn-secondary text-sm"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: '📊' },
              { key: 'analytics', label: 'Analytics', icon: '📈' },
              { key: 'contracts', label: 'Contracts', icon: '📋' },
              { key: 'users', label: 'Users', icon: '👥' },
              { key: 'marketplace', label: 'Marketplace', icon: '🛒' },
              { key: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
              { key: 'games', label: 'Games', icon: '🎮' },
              { key: 'settings', label: 'Settings', icon: '⚙️' }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.key
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </header>

        {/* Content Area */}
        <main>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'contracts' && renderSmartContracts()}
          {activeTab === 'users' && renderUserManagement()}
          {activeTab === 'marketplace' && renderMarketplaceManagement()}
          {activeTab === 'leaderboard' && renderLeaderboardManagement()}
          {activeTab === 'games' && renderGamesManagement()}
          {activeTab === 'settings' && <div className="card-gaming"><h2 className="heading-md text-green-400">⚙️ Settings Coming Soon</h2></div>}
        </main>
      </div>
    </div>
  );
};
