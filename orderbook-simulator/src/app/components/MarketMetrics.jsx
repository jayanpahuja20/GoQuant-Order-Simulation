import React from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, Zap } from 'lucide-react';
import { calculateOrderbookMetrics } from '../lib/dataParser';

const MarketMetrics = ({ orderbook }) => {
  // Use the enhanced metrics calculator
  const metrics = calculateOrderbookMetrics(orderbook);
  
  // Fallback to basic calculations if enhanced metrics aren't available
  const bidVol = orderbook.bids?.reduce((sum, bid) => sum + (bid.quantity || 0), 0) || 0;
  const askVol = orderbook.asks?.reduce((sum, ask) => sum + (ask.quantity || 0), 0) || 0;
  const totalVol = bidVol + askVol;
  
  const imbalance = totalVol > 0 ? (bidVol - askVol) / totalVol : 0;
  const imbalancePercent = (imbalance * 100).toFixed(1);

  const getSentimentComponent = () => {
    if (imbalance > 0.1) {
      return (
        <div className="flex items-center text-green-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">Bullish</span>
        </div>
      );
    } else if (imbalance < -0.1) {
      return (
        <div className="flex items-center text-red-600">
          <TrendingDown className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">Bearish</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-600">
          <Activity className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">Neutral</span>
        </div>
      );
    }
  };

  const formatNumber = (num) => {
    if (num === 0) return '0.00';
    if (num < 0.01) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
        Market Metrics
      </h3>
      
      <div className="space-y-6 flex-1 overflow-y-auto pr-2">

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-base font-medium text-gray-700 mb-3">Volume Analysis</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bid Volume:</span>
              <span className="font-medium text-green-600 text-sm">
                {formatNumber(bidVol)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ask Volume:</span>
              <span className="font-medium text-red-600 text-sm">
                {formatNumber(askVol)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Volume:</span>
              <span className="font-medium text-gray-800 text-sm">
                {formatNumber(totalVol)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-base font-medium text-gray-700 mb-3">Market Sentiment</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Imbalance:</span>
              <span className={`font-medium text-sm ${
                imbalance > 0.1 ? 'text-green-600' : 
                imbalance < -0.1 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {imbalancePercent}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Order Flow:</span>
              {getSentimentComponent()}
            </div>

            {metrics.bidAskRatio > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bid/Ask Ratio:</span>
                <span className="font-medium text-gray-800 text-sm">
                  {metrics.bidAskRatio.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-base font-medium text-gray-700 mb-3">Price Analysis</h4>
          <div className="space-y-2">
            {orderbook.bestBid > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Best Bid:</span>
                <span className="font-mono text-green-600 text-sm">
                  ${orderbook.bestBid.toFixed(2)}
                </span>
              </div>
            )}

            {orderbook.bestAsk > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Best Ask:</span>
                <span className="font-mono text-red-600 text-sm">
                  ${orderbook.bestAsk.toFixed(2)}
                </span>
              </div>
            )}

            {orderbook.midPrice > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mid Price:</span>
                <span className="font-mono text-gray-800 text-sm">
                  ${orderbook.midPrice.toFixed(2)}
                </span>
              </div>
            )}

            {orderbook.spreadPercent > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Spread %:</span>
                <span className={`font-mono text-sm ${
                  orderbook.spreadPercent > 0.1 ? 'text-red-600' : 
                  orderbook.spreadPercent > 0.05 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {orderbook.spreadPercent.toFixed(3)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {metrics.weightedMidPrice > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-base font-medium text-blue-700 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Advanced Metrics
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600">Weighted Mid:</span>
                <span className="font-mono text-blue-800 text-sm">
                  ${metrics.weightedMidPrice.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600">Depth Imbalance:</span>
                <span className={`font-mono text-sm ${
                  Math.abs(metrics.depthImbalance) > 0.3 ? 'text-red-600' : 
                  Math.abs(metrics.depthImbalance) > 0.1 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {(metrics.depthImbalance * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 mt-auto border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Data Quality:</span>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              orderbook.bids?.length > 10 && orderbook.asks?.length > 10 
                ? 'bg-green-500' 
                : orderbook.bids?.length > 5 && orderbook.asks?.length > 5
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-600">
              {orderbook.bids?.length || 0} bids, {orderbook.asks?.length || 0} asks
            </span>
          </div>
        </div>
        
        {orderbook.timestamp && (
          <div className="text-xs text-gray-400 mt-1">
            Last update: {new Date(orderbook.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketMetrics;