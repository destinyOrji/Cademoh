import React, { useState } from 'react';
import '../styles/GlobalStyles.css';
import '../styles/LayoutFixes.css';

interface AdminSignUpProps {
  onSignUp: (credentials: { username: string; email: string; password: string }) => void;
  onSwitchToLogin: () => void;
  error?: string;
  loading?: boolean;
}

export const AdminSignUp: React.FC<AdminSignUpProps> = ({ onSignUp, onSwitchToLogin, error, loading }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateForm = () => {
    if (!username || username.length < 3) {
      setValidationError('Username must be at least 3 characters long');
      return false;
    }
    if (!email || !email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSignUp({ username, email, password });
    }
  };

  return (
    <div className="page-container bg-gaming-dark text-white overflow-fix">
      <div className="content-wrapper">
        {/* Floating background orbs */}
        <div className="absolute top-0 left-10 w-32 sm:w-72 h-32 sm:h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-10 w-48 sm:w-96 h-48 sm:h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-4xl sm:text-5xl animate-bounce mb-6 shadow-lg shadow-purple-500/20">
                👑
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Create Admin Account
              </h1>
              <p className="text-gray-300 text-base sm:text-lg">
                Register for CADEM admin dashboard access
              </p>
            </div>

            {/* Sign Up Form */}
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
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="Enter admin username"
                    required
                    disabled={loading}
                    minLength={3}
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    📧 Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="Enter email address"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    🔐 Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all pr-12"
                      placeholder="Enter password (min 6 characters)"
                      required
                      disabled={loading}
                      minLength={6}
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

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    🔒 Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all pr-12"
                      placeholder="Confirm your password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Error Messages */}
                {(error || validationError) && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                    🚫 {error || validationError}
                  </div>
                )}

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={loading || !username || !email || !password || !confirmPassword}
                  className="w-full btn-primary bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      🚀 Create Admin Account
                    </>
                  )}
                </button>

                {/* Switch to Login */}
                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Already have an admin account?{' '}
                    <button
                      type="button"
                      onClick={onSwitchToLogin}
                      className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                      disabled={loading}
                    >
                      Sign In Here
                    </button>
                  </p>
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-blue-300 text-sm">
                  <div className="font-semibold mb-2">📋 Password Requirements:</div>
                  <ul className="space-y-1 text-xs">
                    <li>• At least 6 characters long</li>
                    <li>• Must match confirmation password</li>
                    <li>• Use a strong, unique password</li>
                  </ul>
                </div>
              </form>
            </div>

            {/* Security Notice */}
            <div className="text-center mt-6">
              <p className="text-gray-400 text-sm">
                🔒 Your admin account will have full platform access. Keep credentials secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
