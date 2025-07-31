import React from 'react';
import OrderbookTable from './OrderbookTable.jsx';
import MarketDepthChart from './MarketDepthChart.jsx';
import { venues } from '../constants/constants.js';
import { Loader } from 'lucide-react';

const OrderbookDisplay = ({ selectedVenue, selectedSymbol, orderbook, simulatedOrder, isLoading }) => {
  const venueName = venues.find(v => v.id === selectedVenue)?.name;

  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-[500px]">
        <div className="text-center text-gray-500">
          <Loader className="w-12 h-12 mx-auto animate-spin text-blue-600" />
          <p className="mt-4 text-lg font-medium">Connecting to {venueName}...</p>
          <p className="text-sm">Fetching order book for {selectedSymbol}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">
        Orderbook - {venueName} {selectedSymbol}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <OrderbookTable 
            data={orderbook.asks} 
            type="asks" 
            simulatedOrder={simulatedOrder}
          />
        </div>
        
        <div>
          <OrderbookTable 
            data={orderbook.bids} 
            type="bids" 
            simulatedOrder={simulatedOrder}
          />
        </div>
      </div>

      <MarketDepthChart orderbook={orderbook} />
    </div>
  );
};

export default OrderbookDisplay;