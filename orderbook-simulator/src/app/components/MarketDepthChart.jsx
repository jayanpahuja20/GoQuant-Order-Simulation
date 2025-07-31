import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MarketDepthChart = ({ orderbook }) => {
  const generateDepthData = () => {
    const bidData = orderbook.bids.slice(0, 20).map((bid, index) => ({
      price: bid.price,
      cumulative: bid.total,
      side: 'bid'
    }));

    const askData = orderbook.asks.slice(0, 20).map((ask, index) => ({
      price: ask.price,
      cumulative: ask.total,
      side: 'ask'
    }));

    return [...bidData.reverse(), ...askData];
  };

  return (
    <div className="mt-8">
      <h3 className="text-md font-medium mb-4">Market Depth</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={generateDepthData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="price" 
              type="number"
              scale="linear"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => value.toFixed(0)}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value.toFixed(4), 'Cumulative Size']}
              labelFormatter={(label) => `Price: $${label.toFixed(2)}`}
            />
            <Area 
              type="stepAfter" 
              dataKey="cumulative" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MarketDepthChart;