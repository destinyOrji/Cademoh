import React from 'react';

export const LayoutStatus: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/80 backdrop-blur-lg border border-green-500/30 rounded-lg p-4 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-semibold">Layout Fixed!</span>
        </div>
        <div className="text-gray-300 text-xs space-y-1">
          <div>✅ Navigation header improved</div>
          <div>✅ Hero title layout fixed</div>
          <div>✅ Button spacing corrected</div>
          <div>✅ Mobile responsiveness enhanced</div>
        </div>
      </div>
    </div>
  );
};

export default LayoutStatus;
