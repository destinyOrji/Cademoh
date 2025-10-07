import React, { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../providers/Web3Provider';
import '../styles/LayoutFixes.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isConnected, walletAddress, user, connectWallet, disconnectWallet, loading } = useWeb3();

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Game', href: '/game', icon: '🎮' },
    { name: 'Leaderboard', href: '/leaderboard', icon: '🏆' },
    { name: 'Marketplace', href: '/marketplace', icon: '🛒' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gaming-dark">
      {/* Navigation Header */}
      <nav className="nav-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="logo-container">
              <div className="logo-text">
                CADEM
              </div>
              <div className="logo-subtitle hidden sm:block">
                Gaming Platform
              </div>
            </Link>

            {/* Navigation Links - Responsive */}
            <div className="flex space-x-1 sm:space-x-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                >
                  <span className="text-base sm:text-lg">{item.icon}</span>
                  <span className="hidden sm:inline font-medium">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {isConnected && user ? (
                <div className="flex items-center space-x-4">
                  {/* Enhanced User Stats */}
                  <div className="hidden sm:flex items-center space-x-6 text-sm">
                    <div className="glass px-3 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-cadem-400 text-lg">💰</span>
                        <div>
                          <div className="text-white font-bold">
                            {user.currentCademBalance.toFixed(2)}
                          </div>
                          <div className="text-gray-400 text-xs">CADEM</div>
                        </div>
                      </div>
                    </div>
                    <div className="glass px-3 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-400 text-lg">⭐</span>
                        <div>
                          <div className="text-white font-bold">
                            Level {user.level}
                          </div>
                          <div className="text-gray-400 text-xs">Player</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Wallet Address */}
                  <div className="glass-strong px-4 py-2 rounded-xl border border-cadem-400/30">
                    <div className="flex items-center space-x-3">
                      <div className="status-online"></div>
                      <div>
                        <div className="text-cadem-400 font-mono text-sm font-bold">
                          {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                        </div>
                        <div className="text-gray-400 text-xs">Connected</div>
                      </div>
                    </div>
                  </div>

                  {/* Disconnect Button */}
                  <button
                    onClick={disconnectWallet}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    title="Disconnect Wallet"
                  >
                    🚪
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <span>🔗</span>
                      <span>Connect Wallet</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black/20 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-gaming text-xl font-bold mb-4">CADEM</div>
              <p className="text-gray-400 text-sm">
                The ultimate blockchain gaming platform. Play, earn, and trade in the metaverse.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Features</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-cadem-400 transition-colors text-sm">
                  🎮 Play & Earn
                </a>
                <a href="#" className="block text-gray-400 hover:text-cadem-400 transition-colors text-sm">
                  🏆 Compete
                </a>
                <a href="#" className="block text-gray-400 hover:text-cadem-400 transition-colors text-sm">
                  🎨 Collect NFTs
                </a>
                <a href="#" className="block text-gray-400 hover:text-cadem-400 transition-colors text-sm">
                  💰 Stake & Earn
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-cadem-400 transition-colors">
                  📱 Discord
                </a>
                <a href="#" className="text-gray-400 hover:text-cadem-400 transition-colors">
                  🐦 Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-cadem-400 transition-colors">
                  📘 Telegram
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 CADEM Gaming Platform. Built with ❤️ for the gaming community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
