import React from "react";
import { useWeb3 } from "../providers/Web3Provider";
import "../styles/GlobalStyles.css";
import "../styles/LayoutFixes.css";

export const GamePage = () => {
  const { user } = useWeb3();

  return (
    <div className="page-container bg-gaming-dark text-white overflow-fix">
      <div className="content-wrapper">
        {/* Floating background orbs - matching Dashboard/Marketplace pattern */}
        <div className="absolute top-0 left-10 w-32 sm:w-72 h-32 sm:h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-10 w-48 sm:w-96 h-48 sm:h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Header - matching Dashboard pattern */}
        <div className="text-center mb-responsive">
          <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-3xl sm:text-5xl animate-bounce mb-6 shadow-lg shadow-pink-500/20">
            🎮
          </div>
          <h1 className="heading-xl mb-6">
            Gaming Arena
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            Choose your game and start earning CADEM tokens while having fun!
          </p>
        </div>

        {/* Player Stats Overview - matching Marketplace pattern */}
        <div className="grid-responsive mb-responsive">
          <div className="card-gaming hover:scale-[1.03] transition-all text-center">
            <h3 className="text-gray-400 text-xs sm:text-sm mb-2">CADEM Balance</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">
              {user?.currentCademBalance?.toFixed(2) ?? "0.00"}
            </p>
            <span className="text-xs text-green-400">💰 Ready to spend</span>
          </div>
          
          <div className="card-gaming hover:scale-[1.03] transition-all text-center">
            <h3 className="text-gray-400 text-xs sm:text-sm mb-2">Player Level</h3>
            <p className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">
              {user?.level ?? 1}
            </p>
            <span className="text-xs text-purple-400">⭐ Keep leveling</span>
          </div>
          
          <div className="card-gaming hover:scale-[1.03] transition-all text-center">
            <h3 className="text-gray-400 text-xs sm:text-sm mb-2">Total Earned</h3>
            <p className="text-2xl sm:text-3xl font-bold text-pink-400 mb-2">
              {user?.totalCademEarned?.toFixed(2) ?? "0.00"}
            </p>
            <span className="text-xs text-pink-400">🏆 Lifetime rewards</span>
          </div>
          
          <div className="card-gaming hover:scale-[1.03] transition-all text-center">
            <h3 className="text-gray-400 text-xs sm:text-sm mb-2">Games Played</h3>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">
              {Math.floor((user?.experiencePoints ?? 0) / 100)}
            </p>
            <span className="text-xs text-yellow-400">🎯 Sessions completed</span>
          </div>
        </div>

        {/* Games Section - matching Dashboard pattern */}
        <div className="card-gaming mb-responsive">
          <h2 className="heading-md mb-6 text-pink-400">🎮 Available Games</h2>
          <p className="text-gray-300 text-base sm:text-lg mb-8">
            Choose your favorite game and start earning CADEM tokens!
          </p>
          
          <div className="grid-responsive">
            {/* Game 1 */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-pink-500/30 transition-all duration-300 group">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl mb-4 group-hover:animate-bounce">🎯</div>
                <h3 className="font-semibold text-white mb-3 text-lg">Precision Clicker</h3>
                <p className="text-gray-300 mb-6 text-sm">
                  Test your reaction time and accuracy. Earn CADEM for every target hit.
                </p>
                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-green-400 font-semibold">💰 5-25 CADEM</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    Easy
                  </span>
                </div>
                <button className="btn-primary w-full">
                  🎮 Play Now
                </button>
              </div>
            </div>

            {/* Game 2 */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl mb-4 group-hover:animate-bounce">💎</div>
                <h3 className="font-semibold text-white mb-3 text-lg">Memory Match</h3>
                <p className="text-gray-300 mb-6 text-sm">
                  Match the tiles and level up your CADEM earnings as you progress.
                </p>
                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-green-400 font-semibold">💰 10-50 CADEM</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    Medium
                  </span>
                </div>
                <button className="btn-primary w-full">
                  🧠 Play Now
                </button>
              </div>
            </div>

            {/* Game 3 */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl mb-4 group-hover:animate-bounce">🚀</div>
                <h3 className="font-semibold text-white mb-3 text-lg">Speed Runner</h3>
                <p className="text-gray-300 mb-6 text-sm">
                  Avoid obstacles and complete the level before time runs out.
                </p>
                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-green-400 font-semibold">💰 20-100 CADEM</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                    Hard
                  </span>
                </div>
                <button className="btn-primary w-full">
                  ⚡ Play Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity - matching Marketplace pattern */}
        <div className="card-gaming mb-responsive">
          <h2 className="heading-md mb-6 text-purple-400">🔥 Recent Gaming Activity</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:border-purple-500/30 transition">
              <div>
                <h3 className="font-semibold">🎯 High score achieved in Precision Clicker!</h3>
                <p className="text-gray-400 text-sm">
                  New personal best with 95% accuracy • 5m ago
                </p>
              </div>
              <p className="text-green-400 font-semibold">+25 CADEM</p>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:border-purple-500/30 transition">
              <div>
                <h3 className="font-semibold">💎 Memory Match streak continues!</h3>
                <p className="text-gray-400 text-sm">
                  7-day winning streak active • 1h ago
                </p>
              </div>
              <p className="text-yellow-400 font-semibold">🔥 Streak</p>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:border-purple-500/30 transition">
              <div>
                <h3 className="font-semibold">🚀 Speed Runner challenge completed!</h3>
                <p className="text-gray-400 text-sm">
                  Finished level 10 under time limit • 2h ago
                </p>
              </div>
              <p className="text-pink-400 font-semibold">+50 CADEM</p>
            </div>
          </div>
        </div>

        {/* Game Rules - enhanced */}
        <div className="card-gaming">
          <h2 className="heading-md mb-6 text-pink-400">
            🎮 Game Rules & Rewards
          </h2>
          <div className="grid-responsive">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-start gap-3">
                <span className="text-xl">🎯</span>
                <div>
                  <h3 className="font-semibold text-white mb-2">Daily Challenges</h3>
                  <p className="text-gray-300 text-sm">Earn bonus CADEM tokens by completing daily challenges and maintaining streaks.</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-start gap-3">
                <span className="text-xl">🏆</span>
                <div>
                  <h3 className="font-semibold text-white mb-2">Level Rewards</h3>
                  <p className="text-gray-300 text-sm">Unlock bonus rewards and multipliers as you level up your gaming profile.</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-start gap-3">
                <span className="text-xl">💰</span>
                <div>
                  <h3 className="font-semibold text-white mb-2">Instant Withdrawal</h3>
                  <p className="text-gray-300 text-sm">Withdraw your earned CADEM to your wallet anytime with no minimum limits.</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-white mb-2">Streak Multipliers</h3>
                  <p className="text-gray-300 text-sm">Stay active daily for multipliers that boost your earning potential significantly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
