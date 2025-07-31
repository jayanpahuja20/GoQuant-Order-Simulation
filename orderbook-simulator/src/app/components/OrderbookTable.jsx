import React, { useMemo } from 'react';
import { Target, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const OrderbookTable = ({ data, type, simulatedOrder }) => {
  // Create enhanced orderbook data with simulated order inserted
  const enhancedData = useMemo(() => {
    if (!simulatedOrder || !data || data.length === 0) {
      return data || [];
    }

    const { side, price, quantity, type: orderType } = simulatedOrder;
    
    // Validate simulatedOrder data
    if (!price || !quantity || isNaN(parseFloat(price)) || isNaN(parseFloat(quantity))) {
      return data;
    }
    
    // Only show simulation if it matches the current side
    const shouldShowSimulation = (type === 'asks' && side === 'sell') || 
                                (type === 'bids' && side === 'buy');
    
    if (!shouldShowSimulation || orderType === 'market') {
      return data;
    }

    // Create a copy of the data with validation
    const dataWithSimulation = data.filter(item => 
      item && typeof item.price === 'number' && typeof item.quantity === 'number'
    );
    
    // Create simulated order entry
    const simulatedEntry = {
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      total: parseFloat(quantity), // This would be cumulative in real implementation
      isSimulated: true
    };

    // Find correct position to insert simulated order
    let insertIndex = -1;
    for (let i = 0; i < dataWithSimulation.length; i++) {
      const currentPrice = dataWithSimulation[i].price;
      
      if (type === 'asks') {
        // For asks, lower prices come first
        if (simulatedEntry.price < currentPrice) {
          insertIndex = i;
          break;
        }
      } else {
        // For bids, higher prices come first
        if (simulatedEntry.price > currentPrice) {
          insertIndex = i;
          break;
        }
      }
    }

    // Insert at found position or at the end
    if (insertIndex >= 0) {
      dataWithSimulation.splice(insertIndex, 0, simulatedEntry);
    } else {
      dataWithSimulation.push(simulatedEntry);
    }

    return dataWithSimulation;
  }, [data, simulatedOrder, type]);

  // Calculate maximum quantity for bar visualization
  const maxQuantity = useMemo(() => {
    if (!enhancedData || enhancedData.length === 0) return 1;
    return Math.max(...enhancedData.map(item => item.quantity || 0));
  }, [enhancedData]);

  // Get color scheme based on type
  const colorScheme = {
    asks: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      bar: 'bg-red-100',
      border: 'border-red-200'
    },
    bids: {
      bg: 'bg-green-50', 
      text: 'text-green-600',
      bar: 'bg-green-100',
      border: 'border-green-200'
    }
  };

  const colors = colorScheme[type];

  if (!enhancedData || enhancedData.length === 0) {
    return (
      <div className={`border rounded-lg ${colors.border} ${colors.bg} p-4`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold ${colors.text} flex items-center`}>
            {type === 'asks' ? (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Asks
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 mr-2" />
                Bids
              </>
            )}
          </h3>
        </div>
        <div className="text-center text-gray-500 py-8">
          No orderbook data available
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg ${colors.border} ${colors.bg}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-semibold ${colors.text} flex items-center`}>
            {type === 'asks' ? (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Asks
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 mr-2" />
                Bids
              </>
            )}
          </h3>
          <span className="text-xs text-gray-500">
            {enhancedData.filter(item => !item.isSimulated).length} levels
          </span>
        </div>
        
        {/* Column headers */}
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 font-medium">
          <div className="text-left">Price</div>
          <div className="text-right">Size</div>
          <div className="text-right">Total</div>
        </div>
      </div>

      {/* Orderbook rows */}
      <div className="max-h-80 overflow-y-auto">
        {enhancedData.slice(0, 15).map((level, index) => {
          const widthPercentage = ((level.quantity || 0) / maxQuantity) * 100;
          const isSimulated = level.isSimulated;
          
          return (
            <div 
              key={isSimulated ? 'simulated' : index}
              className={`relative h-7 flex items-center border-b border-gray-100 last:border-b-0 ${
                isSimulated ? 'ring-2 ring-yellow-400 ring-inset bg-yellow-50 z-10' : 'hover:bg-gray-50'
              }`}
            >
              {/* Quantity visualization bar */}
              <div 
                className={`absolute left-0 top-0 h-full ${
                  isSimulated ? 'bg-yellow-200' : colors.bar
                } opacity-60`}
                style={{ width: `${widthPercentage}%` }}
              />
              
              {/* Order data */}
              <div className="relative z-10 w-full px-4 grid grid-cols-3 gap-2 text-xs">
                <div className={`font-mono ${
                  isSimulated ? 'font-bold text-yellow-700' : colors.text
                }`}>
                  {(level.price || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
                <div className={`text-right font-mono ${
                  isSimulated ? 'font-bold text-yellow-700' : 'text-gray-700'
                }`}>
                  {(level.quantity || 0).toFixed(4)}
                </div>
                <div className="text-right font-mono text-gray-500 text-xs">
                  {(level.quantity || 0).toFixed(4)}
                </div>
              </div>
              
              {/* Simulated order indicator */}
              {isSimulated && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                  <Target className="w-3 h-3 text-yellow-600" />
                  <span className="ml-1 text-xs text-yellow-700 font-medium">SIM</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Simulated order summary at bottom */}
      {simulatedOrder && ((type === 'asks' && simulatedOrder.side === 'sell') || 
                          (type === 'bids' && simulatedOrder.side === 'buy')) && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-yellow-700">
              <AlertTriangle className="w-3 h-3 mr-1" />
              <span className="font-medium">
                Simulated {simulatedOrder.type} {simulatedOrder.side}
              </span>
            </div>
            <div className="text-yellow-600 font-mono">
              {simulatedOrder.quantity} @ ${simulatedOrder.price || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderbookTable;