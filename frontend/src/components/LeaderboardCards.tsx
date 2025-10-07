import React from 'react';
import '../styles/GlobalStyles.css';
import '../styles/LayoutFixes.css';

interface Player {
  rank: number;
  name: string;
  address: string;
  level: number;
  joined: string;
  earnings: number;
}

const leaderboardData: Player[] = [
  { rank: 1, name: "Player_w3k0vw", address: "0xf4c4...571a", level: 13, joined: "9/25/2025", earnings: 1174.65 },
  { rank: 2, name: "Player_waq9fv", address: "0x4426...d439", level: 19, joined: "9/18/2025", earnings: 1090.99 },
  { rank: 3, name: "Player_61abb8", address: "0xdadf...968c", level: 15, joined: "9/18/2025", earnings: 1065.95 },
  { rank: 4, name: "Player_g6j2ck", address: "0x469d...a048", level: 1, joined: "9/6/2025", earnings: 949.24 },
  { rank: 5, name: "Player_7t8agc", address: "0x29e5...b265", level: 5, joined: "9/26/2025", earnings: 1076.84 },
  { rank: 6, name: "Player_j4x0c3", address: "0x3adc...6c6f", level: 20, joined: "9/10/2025", earnings: 925.19 },
  { rank: 7, name: "Player_hift18", address: "0xa759...6dfa", level: 4, joined: "9/28/2025", earnings: 969.24 },
  { rank: 8, name: "Player_i8593b", address: "0x48b1...bb93", level: 2, joined: "9/27/2025", earnings: 908.17 },
  { rank: 9, name: "Player_1cat9o", address: "0x48b3...8173", level: 7, joined: "9/26/2025", earnings: 883.16 },
  { rank: 10, name: "Player_9kbu7d", address: "0x4a17...ee68", level: 5, joined: "9/18/2025", earnings: 947.66 },
  { rank: 11, name: "Player_2q6o1m", address: "0xa176...0e58", level: 11, joined: "9/30/2025", earnings: 849.36 },
  { rank: 12, name: "Player_c768fi", address: "0x1965...a998", level: 7, joined: "9/30/2025", earnings: 853.56 },
  { rank: 13, name: "Player_n09e01", address: "0x623f...0608", level: 15, joined: "10/2/2025", earnings: 862.83 },
  { rank: 14, name: "Player_yq3cuq", address: "0xe71d...7698", level: 1, joined: "9/24/2025", earnings: 959.75 },
  { rank: 15, name: "Player_1z1pwj", address: "0xb92d...83d8", level: 14, joined: "9/12/2025", earnings: 967.93 },
  { rank: 16, name: "Player_1mf1eh", address: "0x60be...0409", level: 18, joined: "9/10/2025", earnings: 839.19 },
  { rank: 17, name: "Player_9gxz38", address: "0x600c...41c8", level: 8, joined: "9/26/2025", earnings: 894.04 },
  { rank: 18, name: "Player_hmruia", address: "0x4f6e...3d88", level: 15, joined: "9/24/2025", earnings: 735.93 },
  { rank: 19, name: "Player_zcncwt", address: "0x1a88...bf88", level: 16, joined: "10/2/2025", earnings: 884.31 },
  { rank: 20, name: "Player_3zty6f", address: "0x5069...88f2", level: 14, joined: "9/22/2025", earnings: 875.66 },
  { rank: 21, name: "Player_4z4z21", address: "0x98a5...7598", level: 11, joined: "9/30/2025", earnings: 832.78 },
  { rank: 22, name: "Player_x6erx1", address: "0xfd3c...81b8", level: 17, joined: "9/9/2025", earnings: 673.34 },
  { rank: 23, name: "Player_bpgihy", address: "0x5fe8...35f3", level: 2, joined: "9/29/2025", earnings: 704.47 },
  { rank: 24, name: "Player_3m2f1n", address: "0x8a8b...2aee", level: 5, joined: "10/2/2025", earnings: 651.20 },
  { rank: 25, name: "Player_h1l4as", address: "0x103c...3148", level: 6, joined: "9/21/2025", earnings: 708.32 },
  { rank: 26, name: "Player_7h13hm", address: "0x9a16...8814", level: 3, joined: "9/8/2025", earnings: 733.27 },
  { rank: 27, name: "Player_mr36qx", address: "0xe475...375c", level: 11, joined: "9/18/2025", earnings: 611.72 },
  { rank: 28, name: "Player_16k96r", address: "0x358b...ab61", level: 8, joined: "9/7/2025", earnings: 755.55 },
  { rank: 29, name: "Player_q83w1e", address: "0xbced...88a8", level: 1, joined: "9/10/2025", earnings: 573.59 },
  { rank: 30, name: "Player_v78kym", address: "0x20d6...26f8", level: 13, joined: "9/11/2025", earnings: 657.02 },
  { rank: 31, name: "Player_linhvk", address: "0x9222...68f8", level: 6, joined: "10/2/2025", earnings: 674.60 },
  { rank: 32, name: "Player_0mwlnw", address: "0xf426...d2ec", level: 20, joined: "9/5/2025", earnings: 521.30 },
  { rank: 33, name: "Player_pycxgm", address: "0x8f5f...4c98", level: 12, joined: "9/17/2025", earnings: 578.33 },
  { rank: 34, name: "Player_e3ur4x", address: "0xbd76...aaa8", level: 13, joined: "9/22/2025", earnings: 526.72 },
  { rank: 35, name: "Player_7cveqv", address: "0xb653...3272", level: 11, joined: "9/7/2025", earnings: 548.06 },
  { rank: 36, name: "Player_vfhaze", address: "0x2d58...8308", level: 17, joined: "9/17/2025", earnings: 590.37 },
  { rank: 37, name: "Player_uqx8he", address: "0x286c...28e8", level: 5, joined: "9/16/2025", earnings: 592.90 },
  { rank: 38, name: "Player_q0yoop", address: "0x92b2...fbee", level: 6, joined: "10/1/2025", earnings: 563.62 },
  { rank: 39, name: "Player_2gmkea", address: "0x5869...590f", level: 20, joined: "9/16/2025", earnings: 508.44 },
  { rank: 40, name: "Player_i85h2n", address: "0xa0e4...e2b4", level: 17, joined: "9/18/2025", earnings: 581.35 },
  { rank: 41, name: "Player_xxpcos", address: "0xc422...e66e", level: 19, joined: "9/13/2025", earnings: 476.58 },
  { rank: 42, name: "Player_nmekz8", address: "0xf459...2b85", level: 7, joined: "9/28/2025", earnings: 524.36 },
  { rank: 43, name: "Player_r8my9w", address: "0xaa68...7e4c", level: 9, joined: "9/20/2025", earnings: 421.51 },
  { rank: 44, name: "Player_9k1w5u", address: "0x5b87...690d", level: 8, joined: "9/8/2025", earnings: 409.79 },
  { rank: 45, name: "Player_e9pr22", address: "0x5661...f9cd", level: 20, joined: "9/24/2025", earnings: 433.29 },
  { rank: 46, name: "Player_c2cemj", address: "0xacd2...efa8", level: 9, joined: "10/3/2025", earnings: 372.71 },
  { rank: 47, name: "Player_od69ff", address: "0xb094...d767", level: 5, joined: "9/12/2025", earnings: 329.83 },
  { rank: 48, name: "Player_5druep", address: "0x88c0...2468", level: 10, joined: "9/27/2025", earnings: 377.45 },
  { rank: 49, name: "Player_p6pqld", address: "0x461b...4698", level: 1, joined: "9/7/2025", earnings: 447.63 },
  { rank: 50, name: "Player_3fszwa", address: "0x3e34...2b68", level: 13, joined: "9/23/2025", earnings: 354.13 }
];

const LeaderboardCards: React.FC = () => {
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

  const getPlayerInitials = (name: string) => {
    return name.charAt(7).toUpperCase(); // Get first letter after "Player_"
  };

  const formatEarnings = (earnings: number) => {
    return earnings.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const totalEarnings = leaderboardData.reduce((sum, player) => sum + player.earnings, 0);

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
              {formatEarnings(totalEarnings)}
            </p>
            <span className="text-xs text-green-400">💰 Total rewards</span>
          </div>
          
          <div className="card-gaming hover:scale-[1.03] transition-all">
            <h3 className="text-gray-400 text-xs sm:text-sm mb-2">Average Earnings</h3>
            <p className="text-2xl sm:text-3xl font-bold text-pink-400 mb-2">
              {formatEarnings(totalEarnings / leaderboardData.length)}
            </p>
            <span className="text-xs text-pink-400">📊 Per player</span>
          </div>
          
          <div className="card-gaming hover:scale-[1.03] transition-all">
            <h3 className="text-gray-400 text-xs sm:text-sm mb-2">Top Earner</h3>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">
              {formatEarnings(Math.max(...leaderboardData.map(p => p.earnings)))}
            </p>
            <span className="text-xs text-yellow-400">👑 Highest reward</span>
          </div>
        </div>

        {/* Recent Activity - matching Marketplace pattern */}
        <div className="card-gaming mb-responsive">
          <h2 className="heading-md mb-6 text-pink-400">🔥 Recent Leaderboard Activity</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:border-pink-500/30 transition">
              <div>
                <h3 className="font-semibold">🥇 {leaderboardData[0]?.name} takes the lead!</h3>
                <p className="text-gray-400 text-sm">
                  New #1 with {formatEarnings(leaderboardData[0]?.earnings || 0)} CADEM • 2m ago
                </p>
              </div>
              <p className="text-yellow-400 font-semibold">👑 Champion</p>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:border-pink-500/30 transition">
              <div>
                <h3 className="font-semibold">🚀 {leaderboardData[4]?.name} climbs to top 5!</h3>
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
          <div className="leaderboard-cards-grid">
            {leaderboardData.map((player) => (
              <div 
                key={player.rank} 
                className={`leaderboard-card ${getRankClass(player.rank)}`}
              >
                {/* Crown for #1 */}
                {player.rank === 1 && <div className="crown-decoration">👑</div>}
                
                {/* Rank Header */}
                <div className="card-rank-header">
                  <div className={`card-rank-badge ${getRankBadgeClass(player.rank)}`}>
                    <span className="rank-medal">{getMedal(player.rank)}</span>
                    {player.rank > 3 && <span className="rank-number">#{player.rank}</span>}
                  </div>
                </div>
                
                {/* Player Section */}
                <div className="card-player-section">
                  <div className="card-player-avatar">
                    {getPlayerInitials(player.name)}
                  </div>
                  <div className="card-player-info">
                    <div className="card-player-name">{player.name}</div>
                    <div className="card-player-address">{player.address}</div>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="card-stats-grid">
                  <div className="card-stat-item">
                    <div className="card-stat-value level">{player.level}</div>
                    <div className="card-stat-label">Level</div>
                  </div>
                  <div className="card-stat-item">
                    <div className="card-stat-value joined">{player.joined}</div>
                    <div className="card-stat-label">Joined</div>
                  </div>
                </div>
                
                {/* Earnings Section */}
                <div className="card-earnings-section">
                  <div className="card-earnings-amount">{formatEarnings(player.earnings)}</div>
                  <div className="card-earnings-label">CADEM Earned</div>
                </div>
              </div>
            ))}
          </div>
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
      </div>
    </div>
  );
};

export default LeaderboardCards;
