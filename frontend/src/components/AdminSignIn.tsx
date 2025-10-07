import React, { useState } from 'react';
import '../styles/GlobalStyles.css';
import '../styles/LayoutFixes.css';

interface AdminSignInProps {
  onSignIn: (credentials: { username: string; password: string }) => void;
  onSwitchToSignUp: () => void;
  error?: string;
  loading?: boolean;
}

export const AdminSignIn: React.FC<AdminSignInProps> = ({ onSignIn, onSwitchToSignUp, error, loading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn({ username, password });
  };

  return (
    <div className="page-container bg-gaming-dark text-white overflow-fix">
      <div className="content-wrapper">
        {/* Floating background orbs */}
        <div className="absolute top-0 left-10 w-32 sm:w-72 h-32 sm:h-72 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-10 w-48 sm:w-96 h-48 sm:h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center text-4xl sm:text-5xl animate-bounce mb-6 shadow-lg shadow-red-500/20">
                👑
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Admin Access
              </h1>
              <p className="text-gray-300 text-base sm:text-lg">
                Sign in to access the CADEM admin dashboard
              </p>
            </div>

            {/* Sign In Form */}
            <div className="card-gaming">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    👤 Admin Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                    placeholder="Enter admin username"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    🔐 Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all pr-12"
                      placeholder="Enter admin password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                    🚫 {error}
                  </div>
                )}

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className="w-full btn-primary bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      🚀 Sign In to Admin Dashboard
                    </>
                  )}
                </button>

                {/* Switch to Sign Up */}
                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Don't have an admin account?{' '}
                    <button
                      type="button"
                      onClick={onSwitchToSignUp}
                      className="text-red-400 hover:text-red-300 font-medium transition-colors"
                      disabled={loading}
                    >
                      Create Account Here
                    </button>
                  </p>
                </div>

                {/* Demo Credentials */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-blue-300 text-sm">
                  <div className="font-semibold mb-2">🔧 Demo Credentials:</div>
                  <div className="space-y-1 text-xs">
                    <div><strong>Username:</strong> admin</div>
                    <div><strong>Password:</strong> cadem2024</div>
                  </div>
                </div>
              </form>
            </div>

            {/* Security Notice */}
            <div className="text-center mt-6">
              <p className="text-gray-400 text-sm">
                🔒 This is a secure admin area. All activities are logged and monitored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
