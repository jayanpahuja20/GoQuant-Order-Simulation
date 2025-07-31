import React from 'react';
import { venues } from '../constants/constants';

const ConnectionStatus = ({ connectionStatus, useRealData, onToggleConnection }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
      
      <div className="space-y-3">
        {venues.map(venue => (
          <div key={venue.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus[venue.id] === 'connected' ? 'bg-green-500' :
                connectionStatus[venue.id] === 'connecting' ? 'bg-yellow-500' :
                connectionStatus[venue.id] === 'error' ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium text-gray-700">{venue.name}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                connectionStatus[venue.id] === 'connected' ? 'bg-green-100 text-green-700' :
                connectionStatus[venue.id] === 'connecting' ? 'bg-yellow-100 text-yellow-700' :
                connectionStatus[venue.id] === 'error' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {connectionStatus[venue.id] || 'disconnected'}
              </span>
            </div>
            
            {useRealData && onToggleConnection && (
              <button
                onClick={() => onToggleConnection(venue.id)}
                disabled={connectionStatus[venue.id] === 'connecting'}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  connectionStatus[venue.id] === 'connected'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {connectionStatus[venue.id] === 'connecting' ? 'Connecting...' :
                 connectionStatus[venue.id] === 'connected' ? 'Disconnect' : 'Connect'}
              </button>
            )}
          </div>
        ))}
      </div>

      {useRealData && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-xs text-blue-800">
            <strong>API Configuration Required:</strong><br/>
            Fill in your API credentials in the WS_CONFIG object to connect to real exchanges.
            For public orderbook data, most exchanges don't require authentication.
          </div>
        </div>
      )}
      
      {!useRealData && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="text-xs text-gray-600">
            <strong>Mock Data Mode:</strong> Enable "Use Real WebSocket Data" in settings to connect to live exchanges.
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;