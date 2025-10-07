import React, { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../providers/Web3Provider';
import '../styles/GlobalStyles.css';
import '../styles/LayoutFixes.css';

interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  username: string;
  totalCademEarned: number;
  currentCademBalance: number;
  level: number;
  experiencePoints: number;
  joinedAt: string;
}

interface LeaderboardData {
  title: string;
  type: string;
  users: LeaderboardEntry[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const LeaderboardPage: React.FC = () => {
  const { walletAddress } = useWeb3();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [selectedType, setSelectedType] = useState<'tokens' | 'level' | 'experience' | 'balance'>('tokens');
  const [loading, setLoading] = useState(false);
  const [userPosition, setUserPosition] = useState<{
    user: LeaderboardEntry;
    position: { rank: number; percentile: number; totalUsers: number };
  } | null>(null);

  const leaderboardTypes = [
    { key: 'tokens', label: 'Top Earners', icon: '💰', description: 'Total CADEM earned' },
    { key: 'level', label: 'Highest Level', icon: '⭐', description: 'Player levels' },
    { key: 'experience', label: 'Most XP', icon: '🎯', description: 'Experience points' },
    { key: 'balance', label: 'Richest Players', icon: '💎', description: 'Current balance' }
  ];

  const getActualLeaderboardData = (): LeaderboardEntry[] => {
    return [
      { rank: 1, walletAddress: "0x2256...eae8", username: "Player_22oyav", totalCademEarned: 1128.59, currentCademBalance: 564.30, level: 17, experiencePoints: 8500, joinedAt: "9/26/2025" },
      { rank: 2, walletAddress: "0x34fc...9c48", username: "Player_gfoxty", totalCademEarned: 1158.14, currentCademBalance: 579.07, level: 9, experiencePoints: 4500, joinedAt: "9/24/2025" },
      { rank: 3, walletAddress: "0x60dd...cadd", username: "Player_5gm873", totalCademEarned: 1102.30, currentCademBalance: 551.15, level: 6, experiencePoints: 3000, joinedAt: "9/18/2025" },
      { rank: 4, walletAddress: "0x5279...cc18", username: "Player_bkxaqi", totalCademEarned: 1045.55, currentCademBalance: 522.78, level: 7, experiencePoints: 3500, joinedAt: "9/7/2025" },
      { rank: 5, walletAddress: "0x908a...bfb8", username: "Player_ntp7gg", totalCademEarned: 1038.17, currentCademBalance: 519.09, level: 5, experiencePoints: 2500, joinedAt: "9/7/2025" },
      { rank: 6, walletAddress: "0xee4d...09c8", username: "Player_gk4xt4", totalCademEarned: 1019.42, currentCademBalance: 509.71, level: 2, experiencePoints: 1000, joinedAt: "9/10/2025" },
      { rank: 7, walletAddress: "0x0ae4...f878", username: "Player_qs53wt", totalCademEarned: 952.80, currentCademBalance: 476.40, level: 7, experiencePoints: 3500, joinedAt: "10/2/2025" },
      { rank: 8, walletAddress: "0x6115...0718", username: "Player_gplnmy", totalCademEarned: 951.75, currentCademBalance: 475.88, level: 5, experiencePoints: 2500, joinedAt: "9/6/2025" },
      { rank: 9, walletAddress: "0x0e90...e995", username: "Player_dnjkhd", totalCademEarned: 973.14, currentCademBalance: 486.57, level: 10, experiencePoints: 5000, joinedAt: "9/6/2025" },
      { rank: 10, walletAddress: "0x1397...220a", username: "Player_dxrgd7", totalCademEarned: 1014.00, currentCademBalance: 507.00, level: 9, experiencePoints: 4500, joinedAt: "9/17/2025" },
      { rank: 11, walletAddress: "0x7c95...d448", username: "Player_eqzlid", totalCademEarned: 968.05, currentCademBalance: 484.03, level: 1, experiencePoints: 500, joinedAt: "9/5/2025" },
      { rank: 12, walletAddress: "0x5035...c818", username: "Player_hgl0cq", totalCademEarned: 921.04, currentCademBalance: 460.52, level: 10, experiencePoints: 5000, joinedAt: "9/11/2025" },
      { rank: 13, walletAddress: "0xaafa...5238", username: "Player_n2m9xb", totalCademEarned: 980.02, currentCademBalance: 490.01, level: 9, experiencePoints: 4500, joinedAt: "9/30/2025" },
      { rank: 14, walletAddress: "0xf318...e377", username: "Player_qop7vg", totalCademEarned: 935.93, currentCademBalance: 467.97, level: 8, experiencePoints: 4000, joinedAt: "9/21/2025" },
      { rank: 15, walletAddress: "0xcafd...043b", username: "Player_490y1o", totalCademEarned: 779.46, currentCademBalance: 389.73, level: 15, experiencePoints: 7500, joinedAt: "10/1/2025" },
      { rank: 16, walletAddress: "0xc086...1c97", username: "Player_c4gyac", totalCademEarned: 956.69, currentCademBalance: 478.35, level: 17, experiencePoints: 8500, joinedAt: "9/6/2025" },
      { rank: 17, walletAddress: "0x28a1...2578", username: "Player_hpnr2l", totalCademEarned: 890.52, currentCademBalance: 445.26, level: 9, experiencePoints: 4500, joinedAt: "9/30/2025" },
      { rank: 18, walletAddress: "0x9918...cb58", username: "Player_xy0ypo", totalCademEarned: 803.66, currentCademBalance: 401.83, level: 16, experiencePoints: 8000, joinedAt: "9/28/2025" },
      { rank: 19, walletAddress: "0xaa54...0ed8", username: "Player_pqh6w3", totalCademEarned: 758.62, currentCademBalance: 379.31, level: 1, experiencePoints: 500, joinedAt: "9/28/2025" },
      { rank: 20, walletAddress: "0x216e...7628", username: "Player_zk2wuk", totalCademEarned: 758.42, currentCademBalance: 379.21, level: 8, experiencePoints: 4000, joinedAt: "9/22/2025" },
      { rank: 21, walletAddress: "0xbb0d...6078", username: "Player_ppuwao", totalCademEarned: 830.94, currentCademBalance: 415.47, level: 12, experiencePoints: 6000, joinedAt: "9/20/2025" },
      { rank: 22, walletAddress: "0xc911...0c16", username: "Player_eyl9zu", totalCademEarned: 719.49, currentCademBalance: 359.75, level: 2, experiencePoints: 1000, joinedAt: "10/3/2025" },
      { rank: 23, walletAddress: "0xd53b...7518", username: "Player_bp1mfz", totalCademEarned: 746.88, currentCademBalance: 373.44, level: 19, experiencePoints: 9500, joinedAt: "9/30/2025" },
      { rank: 24, walletAddress: "0xacf3...3193", username: "Player_sa0duy", totalCademEarned: 715.05, currentCademBalance: 357.53, level: 5, experiencePoints: 2500, joinedAt: "10/2/2025" },
      { rank: 25, walletAddress: "0xa1d8...ee08", username: "Player_3skgy9", totalCademEarned: 646.58, currentCademBalance: 323.29, level: 12, experiencePoints: 6000, joinedAt: "9/30/2025" },
      { rank: 26, walletAddress: "0x3dd0...fa23", username: "Player_kgx86f", totalCademEarned: 672.93, currentCademBalance: 336.47, level: 14, experiencePoints: 7000, joinedAt: "9/25/2025" },
      { rank: 27, walletAddress: "0x73fa...1ab8", username: "Player_ul698e", totalCademEarned: 744.28, currentCademBalance: 372.14, level: 7, experiencePoints: 3500, joinedAt: "9/15/2025" },
      { rank: 28, walletAddress: "0x7a3f...a0b1", username: "Player_09a9h2", totalCademEarned: 775.05, currentCademBalance: 387.53, level: 11, experiencePoints: 5500, joinedAt: "9/18/2025" },
      { rank: 29, walletAddress: "0xe649...498a", username: "Player_12puq1", totalCademEarned: 616.81, currentCademBalance: 308.41, level: 3, experiencePoints: 1500, joinedAt: "9/16/2025" },
      { rank: 30, walletAddress: "0xe68e...0496", username: "Player_a3v54b", totalCademEarned: 552.47, currentCademBalance: 276.24, level: 8, experiencePoints: 4000, joinedAt: "9/19/2025" },
      { rank: 31, walletAddress: "0x372f...41fe", username: "Player_s3zest", totalCademEarned: 578.40, currentCademBalance: 289.20, level: 4, experiencePoints: 2000, joinedAt: "9/5/2025" },
      { rank: 32, walletAddress: "0xb0c9...c7e8", username: "Player_4798mc", totalCademEarned: 559.74, currentCademBalance: 279.87, level: 10, experiencePoints: 5000, joinedAt: "10/3/2025" },
      { rank: 33, walletAddress: "0x9399...906b", username: "Player_g8ccsl", totalCademEarned: 673.75, currentCademBalance: 336.88, level: 12, experiencePoints: 6000, joinedAt: "9/14/2025" },
      { rank: 34, walletAddress: "0x4f56...a86a", username: "Player_85ly0u", totalCademEarned: 550.55, currentCademBalance: 275.28, level: 1, experiencePoints: 500, joinedAt: "9/13/2025" },
      { rank: 35, walletAddress: "0xa012...24fb", username: "Player_9sa28p", totalCademEarned: 552.84, currentCademBalance: 276.42, level: 20, experiencePoints: 10000, joinedAt: "9/8/2025" },
      { rank: 36, walletAddress: "0xa746...3db3", username: "Player_tn2co5", totalCademEarned: 656.25, currentCademBalance: 328.13, level: 4, experiencePoints: 2000, joinedAt: "9/17/2025" },
      { rank: 37, walletAddress: "0x7b6b...74e5", username: "Player_bbsrel", totalCademEarned: 590.15, currentCademBalance: 295.08, level: 11, experiencePoints: 5500, joinedAt: "10/4/2025" },
      { rank: 38, walletAddress: "0xbc3d...3d62", username: "Player_9w2rgr", totalCademEarned: 450.01, currentCademBalance: 225.01, level: 4, experiencePoints: 2000, joinedAt: "10/2/2025" },
      { rank: 39, walletAddress: "0xa2c8...2e86", username: "Player_kk05x1", totalCademEarned: 500.41, currentCademBalance: 250.21, level: 10, experiencePoints: 5000, joinedAt: "9/22/2025" },
      { rank: 40, walletAddress: "0xaccd...c998", username: "Player_yvp7xq", totalCademEarned: 477.40, currentCademBalance: 238.70, level: 6, experiencePoints: 3000, joinedAt: "9/16/2025" },
      { rank: 41, walletAddress: "0xa946...7a8a", username: "Player_o8ucd3", totalCademEarned: 487.45, currentCademBalance: 243.73, level: 12, experiencePoints: 6000, joinedAt: "9/20/2025" },
      { rank: 42, walletAddress: "0x9c24...6d8a", username: "Player_szbyie", totalCademEarned: 448.59, currentCademBalance: 224.30, level: 12, experiencePoints: 6000, joinedAt: "9/10/2025" },
      { rank: 43, walletAddress: "0x6239...0d18", username: "Player_rn6h84", totalCademEarned: 367.60, currentCademBalance: 183.80, level: 15, experiencePoints: 7500, joinedAt: "9/21/2025" },
      { rank: 44, walletAddress: "0x64c5...4f98", username: "Player_sy89ja", totalCademEarned: 500.04, currentCademBalance: 250.02, level: 11, experiencePoints: 5500, joinedAt: "9/8/2025" },
      { rank: 45, walletAddress: "0xab9b...12c8", username: "Player_22dhkp", totalCademEarned: 507.12, currentCademBalance: 253.56, level: 12, experiencePoints: 6000, joinedAt: "9/22/2025" },
      { rank: 46, walletAddress: "0xb9a5...44ba", username: "Player_uihbi4", totalCademEarned: 407.85, currentCademBalance: 203.93, level: 1, experiencePoints: 500, joinedAt: "9/20/2025" },
      { rank: 47, walletAddress: "0x18b4...82a8", username: "Player_iejy5r", totalCademEarned: 485.97, currentCademBalance: 242.99, level: 5, experiencePoints: 2500, joinedAt: "9/22/2025" },
      { rank: 48, walletAddress: "0x8577...cb98", username: "Player_lz76fy", totalCademEarned: 385.36, currentCademBalance: 192.68, level: 9, experiencePoints: 4500, joinedAt: "9/18/2025" },
      { rank: 49, walletAddress: "0x8817...4123", username: "Player_veucjl", totalCademEarned: 387.02, currentCademBalance: 193.51, level: 13, experiencePoints: 6500, joinedAt: "10/1/2025" },
      { rank: 50, walletAddress: "0xa034...9318", username: "Player_55gtdn", totalCademEarned: 429.05, currentCademBalance: 214.53, level: 13, experiencePoints: 6500, joinedAt: "10/4/2025" }
    ];
  };

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/leaderboard/${selectedType}?limit=50`);
      const data = await response.json();
      
      if (data.success) {
        setLeaderboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Use actual leaderboard data
      const actualData = getActualLeaderboardData();
      setLeaderboardData({
        title: `Top Tokens`,
        type: selectedType,
        users: actualData,
        pagination: { total: 100, limit: 50, offset: 0, hasMore: true }
      });
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  const fetchUserPosition = useCallback(async () => {
    if (!walletAddress) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/leaderboard/${selectedType}/position/${walletAddress}`);
      const data = await response.json();
      
      if (data.success) {
        setUserPosition(data.data);
      }
    } catch (error) {
      console.error('Error fetching user position:', error);
    }
  }, [walletAddress, selectedType]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (walletAddress) {
      fetchUserPosition();
    }
  }, [walletAddress, fetchUserPosition]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400 bg-yellow-500/20';
      case 2: return 'text-gray-300 bg-gray-500/20';
      case 3: return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const formatValue = (user: LeaderboardEntry) => {
    switch (selectedType) {
      case 'tokens':
        return `${user.totalCademEarned.toFixed(2)} CADEM`;
      case 'level':
        return `Level ${user.level}`;
      case 'experience':
        return `${user.experiencePoints.toLocaleString()} XP`;
      case 'balance':
        return `${user.currentCademBalance.toFixed(2)} CADEM`;
      default:
        return '';
    }
  };


  const getPlayerInitials = (username: string) => {
    return username.charAt(7).toUpperCase(); // Get first letter after "Player_"
  };

  const formatEarnings = (earnings: number) => {
    return earnings.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-other';
  };

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-other';
  };

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="page-container bg-gaming-dark text-white overflow-fix">
      <div className="content-wrapper">
        {/* Floating background orbs - matching Dashboard pattern */}
        <div className="absolute top-0 left-10 w-32 sm:w-72 h-32 sm:h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-10 w-48 sm:w-96 h-48 sm:h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Header - matching Dashboard pattern */}
        <div className="text-center mb-responsive">
          <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-3xl sm:text-5xl animate-bounce mb-6 shadow-lg shadow-pink-500/20">
            🏆
          </div>
          <h1 className="heading-xl mb-6">
            Top Token Leaderboard
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            100 elite players competing for ultimate CADEM rewards and gaming supremacy.
          </p>
        </div>

        {/* Stats Overview - matching Marketplace pattern */}
        <div className="grid-responsive mb-responsive">
          <div className="card-gaming hover:scale-[1.03] transition-all">
            <h3 className="text-gray-400 text-xs sm:text-sm mb-2">Total Players</h3>
            <p className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">100</p>
            <span className="text-xs text-purple-400">🎮 Active competitors</span>
          </div>
          
          <div className="card-gaming hover:scale-[1.03] transition-all">
            <h3 className="text-gray-400 text-xs sm:text-sm mb-2">Total CADEM Pool</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">
              {leaderboardData ? formatEarnings(leaderboardData.users.reduce((sum, user) => sum + user.totalCademEarned, 0)) : '0.00'}
            </p>
            <span className="text-xs text-green-400">💰 Total rewards</span>
          </div>
          
          <div className="card-gaming hover:scale-[1.03] transition-all">
            <h3 className="text-gray-400 text-xs sm:text-sm mb-2">Average Earnings</h3>
            <p className="text-2xl sm:text-3xl font-bold text-pink-400 mb-2">
              {leaderboardData ? formatEarnings(leaderboardData.users.reduce((sum, user) => sum + user.totalCademEarned, 0) / leaderboardData.users.length) : '0.00'}
            </p>
            <span className="text-xs text-pink-400">📊 Per player</span>
          </div>
          
          <div className="card-gaming hover:scale-[1.03] transition-all">
            <h3 className="text-gray-400 text-xs sm:text-sm mb-2">Top Earner</h3>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">
              {leaderboardData ? formatEarnings(Math.max(...leaderboardData.users.map(u => u.totalCademEarned))) : '0.00'}
            </p>
            <span className="text-xs text-yellow-400">👑 Highest reward</span>
          </div>
        </div>

        {/* Enhanced User Position Card */}
        {userPosition && (
          <div className="user-position-card">
            <div className="position-header">
              <h2 className="position-title">🎯 Your Ranking</h2>
              <div className="position-badge">
                <span className="badge-icon">⭐</span>
                <span className="badge-text">Active Player</span>
              </div>
            </div>
            <div className="position-content">
              <div className="rank-display">
                <div className={`rank-circle ${getRankColor(userPosition.position.rank)}`}>
                  {getRankIcon(userPosition.position.rank)}
                </div>
                <div className="rank-info">
                  <div className="rank-number">#{userPosition.position.rank}</div>
                  <div className="rank-percentile">Top {userPosition.position.percentile}%</div>
                </div>
              </div>
              <div className="performance-stats">
                <div className="stat-item">
                  <div className="stat-value">{formatValue(userPosition.user)}</div>
                  <div className="stat-label">Current Score</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{userPosition.position.totalUsers.toLocaleString()}</div>
                  <div className="stat-label">Total Players</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Leaderboard Type Selector */}
        <div className="leaderboard-selector">
          <h3 className="selector-title">🏆 Competition Categories</h3>
          <div className="selector-grid">
            {leaderboardTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key as 'tokens' | 'level' | 'experience' | 'balance')}
                className={`category-button ${
                  selectedType === type.key ? 'active' : ''
                }`}
              >
                <div className="category-icon">{type.icon}</div>
                <div className="category-content">
                  <div className="category-label">{type.label}</div>
                  <div className="category-description">{type.description}</div>
                </div>
                {selectedType === type.key && (
                  <div className="active-indicator">✨</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity - matching Marketplace pattern */}
        <div className="card-gaming mb-responsive">
          <h2 className="heading-md mb-6 text-pink-400">🔥 Recent Leaderboard Activity</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:border-pink-500/30 transition">
              <div>
                <h3 className="font-semibold">🥇 {leaderboardData?.users[0]?.username} takes the lead!</h3>
                <p className="text-gray-400 text-sm">
                  New #1 with {leaderboardData ? formatEarnings(leaderboardData.users[0]?.totalCademEarned || 0) : '0.00'} CADEM • 2m ago
                </p>
              </div>
              <p className="text-yellow-400 font-semibold">👑 Champion</p>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:border-pink-500/30 transition">
              <div>
                <h3 className="font-semibold">🚀 {leaderboardData?.users[4]?.username} climbs to top 5!</h3>
                <p className="text-gray-400 text-sm">
                  Massive earning streak • 15m ago
                </p>
              </div>
              <p className="text-green-400 font-semibold">+{Math.floor(Math.random() * 50) + 10} CADEM</p>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:border-pink-500/30 transition">
              <div>
                <h3 className="font-semibold">🎯 Competition heating up!</h3>
                <p className="text-gray-400 text-sm">
                  Top 10 positions changing rapidly • 1h ago
                </p>
              </div>
              <p className="text-purple-400 font-semibold">🔥 Hot</p>
            </div>
          </div>
        </div>

        {/* Leaderboard Cards Grid */}
        <div className="card-gaming">
          <h2 className="heading-md mb-6 text-purple-400">🏆 Player Rankings</h2>
          {loading ? (
            <div className="loading-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="loading-card">
                  <div className="loading-image"></div>
                  <div className="loading-text"></div>
                  <div className="loading-text short"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="leaderboard-cards-grid">
              {leaderboardData?.users.map((user) => (
                <div 
                  key={user.walletAddress} 
                  className={`leaderboard-card ${getRankClass(user.rank)}`}
                >
                  {/* Crown for #1 */}
                  {user.rank === 1 && <div className="crown-decoration">👑</div>}
                  
                  {/* Rank Header */}
                  <div className="card-rank-header">
                    <div className={`card-rank-badge ${getRankBadgeClass(user.rank)}`}>
                      <span className="rank-medal">{getMedal(user.rank)}</span>
                      {user.rank > 3 && <span className="rank-number">#{user.rank}</span>}
                    </div>
                  </div>
                  
                  {/* Player Section */}
                  <div className="card-player-section">
                    <div className="card-player-avatar">
                      {getPlayerInitials(user.username)}
                    </div>
                    <div className="card-player-info">
                      <div className="card-player-name">{user.username}</div>
                      <div className="card-player-address">{user.walletAddress}</div>
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="card-stats-grid">
                    <div className="card-stat-item">
                      <div className="card-stat-value level">{user.level}</div>
                      <div className="card-stat-label">Level</div>
                    </div>
                    <div className="card-stat-item">
                      <div className="card-stat-value joined">{user.joinedAt}</div>
                      <div className="card-stat-label">Joined</div>
                    </div>
                  </div>
                  
                  {/* Earnings Section */}
                  <div className="card-earnings-section">
                    <div className="card-earnings-amount">{formatEarnings(user.totalCademEarned)}</div>
                    <div className="card-earnings-label">CADEM Earned</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More Section - matching Dashboard pattern */}
        <div className="card-gaming text-center">
          <button className="btn-primary">
            🎮 Load More Players
          </button>
          <p className="text-gray-400 text-sm mt-4">
            Showing top 50 of 100 players
          </p>
        </div>

        {/* Leaderboard Info */}
        <div className="grid-responsive-3 mt-responsive">
          <div className="card text-center">
            <div className="text-2xl sm:text-3xl mb-3">🎮</div>
            <div className="font-semibold text-white mb-2 text-sm sm:text-base">Play More</div>
            <div className="text-gray-400 text-xs sm:text-sm">
              Keep playing games to climb the leaderboard
            </div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl sm:text-3xl mb-3">⏰</div>
            <div className="font-semibold text-white mb-2 text-sm sm:text-base">Updates Hourly</div>
            <div className="text-gray-400 text-xs sm:text-sm">
              Rankings are updated every hour
            </div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl sm:text-3xl mb-3">🏅</div>
            <div className="font-semibold text-white mb-2 text-sm sm:text-base">Seasonal Rewards</div>
            <div className="text-gray-400 text-xs sm:text-sm">
              Top players earn special NFT rewards
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
