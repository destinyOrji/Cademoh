import React from 'react';

const TestTailwind: React.FC = () => {
  return (
    <div className="min-h-screen bg-gaming-dark flex items-center justify-center">
      <div className="card-gaming max-w-md w-full mx-4">
        <h1 className="text-gaming text-4xl font-bold mb-6 text-center">
          CADEM Gaming
        </h1>
        
        <div className="space-y-4">
          <div className="text-gradient text-xl font-semibold">
            🎮 Tailwind CSS is working!
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="btn-primary">
              Primary Button
            </button>
            <button className="btn-secondary">
              Secondary Button
            </button>
          </div>
          
          <div className="card bg-cadem-500/20 border-cadem-400/30">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">Backend Connected</span>
            </div>
          </div>
          
          <div className="glow-effect card bg-purple-500/10 border-purple-400/30">
            <div className="text-purple-300">
              ⛓️ Blockchain: Simulation Mode
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTailwind;
