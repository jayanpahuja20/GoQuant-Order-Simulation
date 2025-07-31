import React from 'react';

const SettingsPanel = ({ useRealData, onToggleRealData, show }) => {
  if (!show) return null;

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-medium mb-3">Settings</h3>
      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={useRealData}
            onChange={(e) => onToggleRealData(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">Use Real WebSocket Data</span>
        </label>
        <div className="text-xs text-gray-500">
          {useRealData ? 
            'Configure API keys in WS_CONFIG to connect to real exchanges' : 
            'Using mock data for demonstration'
          }
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;