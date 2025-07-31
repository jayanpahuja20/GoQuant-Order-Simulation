// APIIntegrationGuide.jsx
import React from "react";

const APIIntegrationGuide = ({ useRealData }) => {
  if (!useRealData) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">API Integration Guide</h3>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Binance Configuration:
          </h4>
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono">
            WS_CONFIG.binance.apiKey = 'your_binance_api_key'
            <br />
            WS_CONFIG.binance.secretKey = 'your_binance_secret'
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Bybit Configuration:
          </h4>
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono">
            WS_CONFIG.bybit.apiKey = 'your_bybit_api_key'
            <br />
            WS_CONFIG.bybit.secretKey = 'your_bybit_secret'
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Deribit Configuration:
          </h4>
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono">
            WS_CONFIG.deribit.clientId = 'your_deribit_client_id'
            <br />
            WS_CONFIG.deribit.clientSecret = 'your_deribit_secret'
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <strong>Note:</strong> For public orderbook data, authentication is
          typically not required. The WebSocket connections will work without
          API keys for market data.
        </div>
      </div>
    </div>
  );
};

export default APIIntegrationGuide;
