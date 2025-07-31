import React, { useMemo } from 'react';
import { AlertTriangle, Clock, Target, TrendingUp, TrendingDown, Zap, DollarSign } from 'lucide-react';

const OrderImpactAnalysis = ({ simulatedOrder }) => {
  // Calculate comprehensive order impact metrics
  const impactMetrics = useMemo(() => {
    if (!simulatedOrder || !simulatedOrder.impact) {
      return null;
    }

    const { impact, type, side, price, quantity, venue, symbol } = simulatedOrder;
    
    return {
      ...impact,
      orderDetails: {
        type,
        side,
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        venue,
        symbol
      }
    };
  }, [simulatedOrder]);

  if (!impactMetrics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-gray-400" />
          Order Impact Analysis
        </h2>
        <div className="text-center text-gray-500 py-8">
          <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Simulate an order to see impact analysis</p>
        </div>
      </div>
    );
  }

  const {
    fillPercentage,
    averageFillPrice,
    slippage,
    marketImpact,
    timeToFill,
    wouldCrossSpread,
    position,
    estimatedFillTime,
    priceImpact,
    orderDetails
  } = impactMetrics;

  // Determine risk level based on metrics
  const getRiskLevel = () => {
    if (slippage > 0.5 || priceImpact > 1) return 'high';
    if (slippage > 0.1 || priceImpact > 0.3) return 'medium';
    return 'low';
  };

  const riskLevel = getRiskLevel();
  const riskColors = {
    low: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-red-600 bg-red-50 border-red-200'
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(3)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Target className="w-5 h-5 mr-2 text-blue-600" />
        Order Impact Analysis
      </h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Order Summary</span>
          <span className={`text-xs px-2 py-1 rounded-full border ${riskColors[riskLevel]}`}>
            {riskLevel.toUpperCase()} RISK
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-mono capitalize">{orderDetails.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Side:</span>
            <span className={`font-mono capitalize flex items-center ${
              orderDetails.side === 'buy' ? 'text-green-600' : 'text-red-600'
            }`}>
              {orderDetails.side === 'buy' ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {orderDetails.side}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Quantity:</span>
            <span className="font-mono">{orderDetails.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Price:</span>
            <span className="font-mono">{formatCurrency(orderDetails.price)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-blue-500" />
            Fill Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Expected Fill:</span>
              <span className={`font-mono font-medium ${
                fillPercentage === 100 ? 'text-green-600' : 
                fillPercentage > 80 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {formatPercentage(fillPercentage)}
              </span>
            </div>
            {averageFillPrice > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Fill Price:</span>
                <span className="font-mono">{formatCurrency(averageFillPrice)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Time to Fill:</span>
              <span className="font-mono flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {timeToFill || estimatedFillTime || 'Unknown'}
              </span>
            </div>
            {position >= 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Queue Position:</span>
                <span className="font-mono">#{position + 1}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-3 flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-green-500" />
            Price Impact
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Slippage:</span>
              <span className={`font-mono font-medium ${
                slippage > 0.5 ? 'text-red-600' : 
                slippage > 0.1 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {formatPercentage(slippage)}
              </span>
            </div>
            {priceImpact !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Price Impact:</span>
                <span className={`font-mono font-medium ${
                  priceImpact > 1 ? 'text-red-600' : 
                  priceImpact > 0.3 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {formatPercentage(priceImpact)}
                </span>
              </div>
            )}
            {marketImpact > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Levels Consumed:</span>
                <span className="font-mono">{marketImpact}</span>
              </div>
            )}
          </div>
        </div>

        {(wouldCrossSpread || slippage > 0.5 || fillPercentage < 100) && (
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center text-yellow-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Trading Alerts
            </h3>
            <div className="space-y-2 text-sm">
              {wouldCrossSpread && (
                <div className="flex items-start">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="ml-2 text-yellow-700">
                    Order would cross spread and execute immediately as a market order
                  </span>
                </div>
              )}
              {slippage > 0.5 && (
                <div className="flex items-start">
                  <span className="text-red-600">🚨</span>
                  <span className="ml-2 text-red-700">
                    High slippage detected - consider splitting order or adjusting price
                  </span>
                </div>
              )}
              {fillPercentage < 100 && orderDetails.type === 'market' && (
                <div className="flex items-start">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="ml-2 text-yellow-700">
                    Insufficient liquidity - only {formatPercentage(fillPercentage)} would be filled
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium mb-2 text-blue-700">Market Conditions</h3>
          <div className="text-xs text-blue-600">
            <p>• Analysis based on current orderbook snapshot</p>
            <p>• Actual results may vary due to market volatility</p>
            <p>• Consider market hours and trading volume</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date(simulatedOrder.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default OrderImpactAnalysis;