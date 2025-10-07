import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../providers/Web3Provider';
import '../styles/GlobalStyles.css';
import '../styles/LayoutFixes.css';

export const HomePage: React.FC = () => {
  const { isConnected, connectWallet } = useWeb3();

  const features = [
    {
      icon: '🎮',
      title: 'Play & Earn',
      description: 'Play exciting games and earn CADEM tokens as rewards',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🏆',
      title: 'Compete',
      description: 'Climb the leaderboards and prove your gaming skills',
      color: 'from-cadem-500 to-blue-500'
    },
    {
      icon: '🎨',
      title: 'Collect NFTs',
      description: 'Own unique gaming assets and trade them in the marketplace',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: '💰',
      title: 'Stake & Earn',
      description: 'Stake your tokens and NFTs to earn passive rewards',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const stats = [
    { label: 'Active Players', value: '10,000+', icon: '👥' },
    { label: 'CADEM Distributed', value: '1M+', icon: '💎' },
    { label: 'NFTs Minted', value: '5,000+', icon: '🎨' },
    { label: 'Games Available', value: '12', icon: '🎮' }
  ];

  return (
    <div className="page-container bg-gaming-dark text-white overflow-fix">
      <div className="content-wrapper">
        {/* Floating background orbs - matching Dashboard/Marketplace pattern */}
        <div className="absolute top-0 left-10 w-32 sm:w-72 h-32 sm:h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-10 w-48 sm:w-96 h-48 sm:h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Enhanced Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="relative z-10 text-center px-4">
            {/* Animated icon circle - matching Dashboard pattern */}
            <div className="mx-auto w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-4xl sm:text-6xl animate-bounce mb-8 shadow-lg shadow-pink-500/20">
              🎮
            </div>
            
            <div className="mb-8 slide-up">
              <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-tight">
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent animate-pulse">
                  CADEM
                </span>
                <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Gaming Platform
                </span>
              </h1>
            </div>
            
            <p className="text-gray-300 text-base sm:text-lg max-w-3xl mx-auto mb-8 slide-up animation-delay-200">
              🎮 The ultimate blockchain gaming experience. Play games, earn tokens, collect NFTs, and compete with players worldwide in the metaverse.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 slide-up animation-delay-400">
              {isConnected ? (
                <Link to="/dashboard" className="btn-primary">
                  🚀 Enter Dashboard
                </Link>
              ) : (
                <button onClick={connectWallet} className="btn-primary">
                  🔗 Connect Wallet to Start
                </button>
              )}
              
              <Link to="/game" className="btn-secondary">
                🎮 Explore Games
              </Link>
            </div>

            {/* Status Indicator - enhanced */}
            <div className="flex justify-center items-center gap-6 slide-up animation-delay-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Platform Online</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400 text-sm font-medium">⛓️ Blockchain Ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Overview - matching Marketplace pattern */}
        <div className="grid-responsive mb-responsive">
          {stats.map((stat, index) => (
            <div key={index} className="card-gaming hover:scale-[1.03] transition-all text-center">
              <div className="text-3xl sm:text-4xl mb-4">{stat.icon}</div>
              <h3 className="text-gray-400 text-xs sm:text-sm mb-2">{stat.label}</h3>
              <p className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">{stat.value}</p>
              <span className="text-xs text-purple-400">🚀 Growing daily</span>
            </div>
          ))}
        </div>

        {/* Features Section - matching Dashboard pattern */}
        <div className="card-gaming mb-responsive">
          <h2 className="heading-md mb-6 text-pink-400">🌟 Why Choose CADEM?</h2>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mb-8">
            Experience the future of gaming with blockchain technology, true ownership, and real rewards.
          </p>
          
          <div className="grid-responsive">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-pink-500/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl mb-4 group-hover:animate-bounce">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-3 text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Games Preview Section - matching Dashboard pattern */}
        <div className="card-gaming mb-responsive">
          <h2 className="heading-md mb-6 text-purple-400">🎮 Featured Games</h2>
          <p className="text-gray-300 text-base sm:text-lg mb-8">
            Play these exciting games and earn CADEM tokens
          </p>

          <div className="grid-responsive">
            {[
              {
                name: 'Puzzle Quest',
                description: 'Solve challenging puzzles and earn rewards',
                image: '🧩',
                rewards: '10-50 CADEM',
                difficulty: 'Easy'
              },
              {
                name: 'Tower Defense',
                description: 'Defend your base from waves of enemies',
                image: '🏰',
                rewards: '20-100 CADEM',
                difficulty: 'Medium'
              },
              {
                name: 'Racing Championship',
                description: 'Race against other players in real-time',
                image: '🏎️',
                rewards: '50-200 CADEM',
                difficulty: 'Hard'
              }
            ].map((game, index) => (
              <div key={index} className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 group">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl mb-4 group-hover:animate-pulse">
                    {game.image}
                  </div>
                  <h3 className="font-semibold text-white mb-3 text-lg">
                    {game.name}
                  </h3>
                  <p className="text-gray-300 mb-6 text-sm">
                    {game.description}
                  </p>
                  <div className="flex justify-between items-center text-sm mb-4">
                    <span className="text-green-400 font-semibold">
                      💰 {game.rewards}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      game.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                      game.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {game.difficulty}
                    </span>
                  </div>
                  <Link to="/game" className="btn-primary w-full text-sm">
                    🎮 Play Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section - matching Dashboard pattern */}
        <div className="card-gaming text-center">
          <h2 className="heading-md mb-6 text-pink-400">
            🚀 Ready to Start Gaming?
          </h2>
          <p className="text-gray-300 text-base sm:text-lg mb-8">
            Join thousands of players earning real rewards while having fun!
          </p>
          
          {!isConnected && (
            <button onClick={connectWallet} className="btn-primary">
              🚀 Connect Wallet & Start Playing
            </button>
          )}
          
          {isConnected && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard" className="btn-primary">
                📊 View Dashboard
              </Link>
              <Link to="/game" className="btn-secondary">
                🎮 Start Gaming
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
