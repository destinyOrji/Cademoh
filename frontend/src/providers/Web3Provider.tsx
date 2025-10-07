import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

interface User {
  walletAddress: string;
  username?: string;
  totalCademEarned: number;
  currentCademBalance: number;
  level: number;
  experiencePoints: number;
}

interface Web3ContextType {
  // Wallet connection
  isConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  
  // User data
  user: User | null;
  loading: boolean;
  
  // Backend API
  fetchUserData: () => Promise<void>;
  updateBalance: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:3000/api';

  // Utility function to check if an error is a Web3 extension error
  const isWeb3ExtensionError = (errorMessage: string): boolean => {
    return errorMessage.includes('evmAsk') || 
           errorMessage.includes('selectExtension') ||
           errorMessage.includes('Unexpected error') ||
           errorMessage.includes('hook.js') ||
           errorMessage.includes('overrideMethod') ||
           errorMessage.includes('Oe:') ||
           errorMessage.includes('Wallet connection timeout');
  };

  // Add global error handlers for Web3 errors
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || String(event.reason);
      
      // Check if it's a Web3/wallet related error that we want to suppress
      if (isWeb3ExtensionError(errorMessage)) {
        // Completely suppress these errors - don't even log them
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      
      // Let other errors through normally
      console.debug('Unhandled promise rejection (not Web3 related):', event.reason);
    };

    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.error?.message || event.message || String(event.error);
      
      // Check if it's a Web3/wallet related error that we want to suppress
      if (isWeb3ExtensionError(errorMessage)) {
        // Completely suppress these errors - don't even log them
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      
      // Let other errors through normally
      console.debug('Error event (not Web3 related):', event.error);
    };

    // Also override console.error temporarily to filter Web3 errors
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      if (isWeb3ExtensionError(message)) {
        // Suppress Web3 errors from console
        return;
      }
      originalConsoleError.apply(console, args);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      // Restore original console.error
      console.error = originalConsoleError;
    };
  }, []);

  // Check if wallet is already connected on page load
  useEffect(() => {
    // Temporarily disable automatic wallet connection to prevent errors
    // Users can still manually connect via the connect button
    console.debug('Automatic wallet connection disabled to prevent extension errors');
    
    // Uncomment the lines below to re-enable automatic connection:
    // const timer = setTimeout(() => {
    //   checkWalletConnection();
    // }, 2000);
    // return () => clearTimeout(timer);
  }, []);

  // Fetch user data when wallet connects
  useEffect(() => {
    const loadUserData = async () => {
      if (!walletAddress) return;

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/users/${walletAddress}`);
        const data = await response.json();
        
        if (data.success) {
          setUser(data.data.user || data.data);
          console.log('📊 User data loaded:', data.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Create mock user data if backend is not available
        setUser({
          walletAddress,
          username: `Player_${walletAddress.slice(0, 8)}`,
          totalCademEarned: 0,
          currentCademBalance: 0,
          level: 1,
          experiencePoints: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      loadUserData();
    }
  }, [walletAddress, API_BASE_URL]);

  const checkWalletConnection = async () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    // Check if ethereum object exists and is properly initialized
    if (!window.ethereum || typeof window.ethereum.request !== 'function') {
      console.debug('No wallet extension detected');
      return;
    }

    try {
      // Add a shorter timeout for initial check
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Wallet connection timeout')), 3000)
      );
      
      // Wrap the request in a try-catch to handle immediate errors
      const accountsPromise = new Promise<string[]>((resolve, reject) => {
        try {
          const request = window.ethereum!.request({ method: 'eth_accounts' });
          if (request && typeof request.then === 'function') {
            request.then(resolve).catch(reject);
          } else {
            reject(new Error('Invalid wallet response'));
          }
        } catch (err) {
          reject(err);
        }
      });
      
      const accounts = await Promise.race([accountsPromise, timeoutPromise]) as string[];
      
      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        console.debug('Wallet auto-connected:', accounts[0]);
      }
    } catch (error) {
      const errorMessage = String(error);
      
      // Only log non-Web3 extension errors
      if (!isWeb3ExtensionError(errorMessage)) {
        console.debug('Wallet connection check failed:', error);
      }
      
      // Reset connection state on error
      setWalletAddress(null);
      setIsConnected(false);
    }
  };

  const connectWallet = async () => {
    // Check if wallet extension exists
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet to connect!');
      return;
    }

    // Check if wallet is properly initialized
    if (typeof window.ethereum.request !== 'function') {
      alert('Wallet extension is not properly initialized. Please refresh the page and try again.');
      return;
    }

    try {
      setLoading(true);
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Wallet connection timeout')), 15000)
      );
      
      // Wrap the request with additional error handling
      const accountsPromise = new Promise<string[]>((resolve, reject) => {
        try {
          const request = window.ethereum!.request({ 
            method: 'eth_requestAccounts' 
          });
          
          if (request && typeof request.then === 'function') {
            request.then(resolve).catch(reject);
          } else {
            reject(new Error('Invalid wallet response'));
          }
        } catch (err) {
          reject(err);
        }
      });
      
      const accounts = await Promise.race([accountsPromise, timeoutPromise]) as string[];
      
      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        console.log('Wallet connected:', accounts[0]);
        await refreshUserData(); // Refresh user data after wallet connection
      } else {
        throw new Error('No accounts returned from wallet');
      }
    } catch (error: unknown) {
      const walletError = error as { code?: number; message?: string };
      const errorMessage = walletError.message || String(error);
      
      // Only log non-Web3 extension errors
      if (!isWeb3ExtensionError(errorMessage)) {
        console.error('Error connecting wallet:', error);
      }
      
      // Handle specific error types
      if (walletError.code === 4001) {
        alert('Wallet connection was rejected by user.');
      } else if (walletError.message?.includes('timeout')) {
        // Don't show timeout alerts for now to avoid user annoyance
        console.debug('Wallet connection timed out silently');
      } else if (walletError.message?.includes('User rejected')) {
        alert('Connection request was rejected. Please try again.');
      } else if (isWeb3ExtensionError(errorMessage)) {
        // Silently handle Web3 extension errors
        console.debug('Web3 extension error during connection attempt');
      } else {
        alert('Failed to connect wallet. Please check your wallet extension and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setUser(null);
    console.log('👋 Wallet disconnected');
  };

  const refreshUserData = async () => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/${walletAddress}`);
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data.user || data.data);
        console.log('📊 User data refreshed:', data.data);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async () => {
    if (!walletAddress) return;

    try {
      const response = await fetch(`${API_BASE_URL}/web3/sync/${walletAddress}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        await refreshUserData(); // Refresh user data to show new balance
        console.log('💰 Balance updated');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const value: Web3ContextType = {
    isConnected,
    walletAddress,
    connectWallet,
    disconnectWallet,
    user,
    loading,
    fetchUserData: refreshUserData,
    updateBalance
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
