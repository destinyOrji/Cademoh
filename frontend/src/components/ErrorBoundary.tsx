import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Filter out Web3/wallet connection errors that are not critical
    if (error.message?.includes('evmAsk') || 
        error.message?.includes('selectExtension') ||
        error.message?.includes('Unexpected error') ||
        error.message?.includes('hook.js') ||
        error.message?.includes('overrideMethod') ||
        error.message?.includes('Wallet connection timeout')) {
      console.debug('Web3 connection error caught and handled:', error.message);
      // Reset the error boundary for non-critical Web3 errors
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined });
      }, 500);
    }
  }

  public render() {
    if (this.state.hasError) {
      // Check if it's a Web3 error that we can recover from
      if (this.state.error?.message?.includes('evmAsk') || 
          this.state.error?.message?.includes('selectExtension') ||
          this.state.error?.message?.includes('Unexpected error') ||
          this.state.error?.message?.includes('hook.js') ||
          this.state.error?.message?.includes('overrideMethod') ||
          this.state.error?.message?.includes('Wallet connection timeout')) {
        // For Web3 errors, show a minimal error state and auto-recover
        return (
          <div className="min-h-screen bg-gaming-dark text-white flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🔄</div>
              <h2 className="text-xl font-bold mb-2">Connecting to Wallet...</h2>
              <p className="text-gray-400">Please wait while we establish the connection.</p>
            </div>
          </div>
        );
      }

      // For other errors, show a proper error page
      return (
        <div className="min-h-screen bg-gaming-dark text-white flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-400 mb-6">
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
