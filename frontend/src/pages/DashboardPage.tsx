import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../providers/Web3Provider';
import '../styles/GlobalStyles.css';
import '../styles/LayoutFixes.css';

interface GameSession {
  sessionId: string;
  gameId: string;
  score: number;
  reward: number;
  date: string;
}

interface NFT {
  tokenId: number;
  name: string;
  rarity: string;
  image: string;
}

export const DashboardPage: React.FC = () => {
  const { isConnected, user, walletAddress, connectWallet, updateBalance } = useWeb3();
  const [recentSessions, setRecentSessions] = useState<GameSession[]>([]);
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!walletAddress) return;
      setLoading(true);

      try {
        const nftResponse = await fetch(`http://localhost:3000/api/web3/nft/${walletAddress}`);
        const nftData = await nftResponse.json();
        if (nftData.success) setUserNFTs(nftData.data.nfts || []);

        setRecentSessions([
          { sessionId: "s1", gameId: "Puzzle Quest", score: 1500, reward: 25, date: new Date(Date.now() - 1800000).toISOString() },
          { sessionId: "s2", gameId: "Tower Defense", score: 2800, reward: 45, date: new Date(Date.now() - 7200000).toISOString() },
          { sessionId: "s3", gameId: "Racing Championship", score: 3200, reward: 75, date: new Date(Date.now() - 86400000).toISOString() },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isConnected && walletAddress) loadDashboardData();
  }, [isConnected, walletAddress]);

  const handleSyncBalance = async () => {
    setLoading(true);
    await updateBalance();
    setTimeout(() => setLoading(false), 600);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common": return "text-gray-300 bg-gray-700/30";
      case "uncommon": return "text-green-400 bg-green-700/30";
      case "rare": return "text-blue-400 bg-blue-700/30";
      case "epic": return "text-purple-400 bg-purple-700/30";
      default: return "text-gray-400 bg-gray-700/30";
    }
  };

  // 🟣 Not Connected Screen
  if (!isConnected) {
    return (
      <div className="page-container bg-gaming-dark text-white flex items-center justify-center">
        <div className="content-wrapper">
          <div className="card-gaming max-w-md mx-auto text-center">
            <div className="text-4xl sm:text-6xl mb-6 animate-bounce">🔗</div>
            <h1 className="heading-lg mb-6">
              Connect Your Wallet
            </h1>
            <p className="text-gray-300 mb-8 text-sm sm:text-base">Access your gaming stats, NFTs, and CADEM earnings.</p>
            <button
              onClick={connectWallet}
              className="btn-primary w-full"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🟢 Connected Dashboard
  return (
    <div className="page-container bg-gaming-dark text-white overflow-fix">
      <div className="content-wrapper">
        {/* Floating background orbs */}
        <div className="absolute top-0 left-10 w-32 sm:w-72 h-32 sm:h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-10 w-48 sm:w-96 h-48 sm:h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        {/* Header */}
        <div className="text-center mb-responsive">
          <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-3xl sm:text-5xl animate-bounce mb-6 shadow-lg shadow-pink-500/20">
            🎮
          </div>
          <h1 className="heading-xl mb-6">
            My CADEM Dashboard
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            Track your gaming sessions, rewards, and NFT achievements.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid-responsive mb-responsive">
          {/* Balance */}
          <div className="card-gaming hover:scale-[1.03] transition-all">
            <h3 className="text-gray-400 text-xs sm:text-sm mb-2">CADEM Balance</h3>
            <p className="text-2xl sm:text-3xl font-bold text-pink-400 mb-4">
              {user?.currentCademBalance?.toFixed(2) || "0.00"}
            </p>
            <button
              onClick={handleSyncBalance}
              disabled={loading}
              className="btn-primary w-full text-sm"
            >
              {loading ? "🔄 Syncing..." : "Sync Balance"}
            </button>
          </div>

          {/* Total Earned */}
          <div className="card-gaming hover:scale-[1.03] transition-all">
            <h3 className="text-gray-400 text-xs sm:text-sm mb-2">Total Earned</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">
              {user?.totalCademEarned?.toFixed(2) || "0.00"}
            </p>
            <span className="text-xs text-green-400">+{((user?.totalCademEarned || 0) * 0.1).toFixed(1)}% this week</span>
          </div>

          {/* Level */}
          <div className="card-gaming hover:scale-[1.03] transition-all">
            <h3 className="text-gray-400 text-xs sm:text-sm mb-2">Player Level</h3>
            <p className="text-2xl sm:text-3xl font-bold text-purple-400 mb-4">{user?.level || 1}</p>
            <div className="w-full bg-gray-700/40 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full"
                style={{ width: `${((user?.experiencePoints || 0) % 1000) / 10}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400">{(user?.experiencePoints || 0) % 1000} / 1000 XP</p>
          </div>

          {/* NFTs */}
          <div className="card-gaming hover:scale-[1.03] transition-all">
            <h3 className="text-gray-400 text-xs sm:text-sm mb-2">NFTs Owned</h3>
            <p className="text-2xl sm:text-3xl font-bold text-pink-400">{userNFTs.length}</p>
          </div>
        </div>

        {/* Recent Game Sessions */}
        <div className="card-gaming mb-responsive">
          <h2 className="heading-md mb-6 text-pink-400">🎮 Recent Game Sessions</h2>
          {recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.sessionId} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:border-pink-500/30 transition">
                  <div>
                    <h3 className="font-semibold">{session.gameId}</h3>
                    <p className="text-gray-400 text-sm">
                      Score: {session.score.toLocaleString()} • {formatDate(session.date)}
                    </p>
                  </div>
                  <p className="text-green-400 font-semibold">+{session.reward} CADEM</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No recent sessions yet.</p>
          )}
        </div>

        {/* NFT Collection */}
        <div className="card-gaming">
          <h2 className="heading-md mb-6 text-purple-400">🎨 My NFT Collection</h2>
          {userNFTs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {userNFTs.slice(0, 4).map((nft) => (
                <div
                  key={nft.tokenId}
                  className="card hover:border-pink-500/30 transition-all"
                >
                  <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg text-2xl sm:text-4xl mb-3">
                    {nft.image || "🎨"}
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm mb-2">{nft.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(nft.rarity)}`}>
                    {nft.rarity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">You don't own any NFTs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
