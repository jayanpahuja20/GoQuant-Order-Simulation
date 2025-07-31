import React from 'react';
import { venues, symbols, orderTypes, orderSides, timingOptions } from '../constants/constants';

const OrderSimulationForm = ({ 
  orderForm, 
  onFormChange, 
  onSimulateOrder, 
  onResetSimulation 
}) => {
  
  const handleFieldChange = (field, value) => {
    onFormChange(field, value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Order Simulation</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
          <select 
            value={orderForm.venue}
            onChange={(e) => handleFieldChange('venue', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {venues.map(venue => (
              <option key={venue.id} value={venue.id}>{venue.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
          <select 
            value={orderForm.symbol}
            onChange={(e) => handleFieldChange('symbol', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {symbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select 
              value={orderForm.type}
              onChange={(e) => handleFieldChange('type', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {orderTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Side</label>
            <select 
              value={orderForm.side}
              onChange={(e) => handleFieldChange('side', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {orderSides.map(side => (
                <option key={side.value} value={side.value}>{side.label}</option>
              ))}
            </select>
          </div>
        </div>

        {orderForm.type === 'limit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input 
              type="number"
              value={orderForm.price}
              onChange={(e) => handleFieldChange('price', e.target.value)}
              placeholder="Enter price"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              step="0.01"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input 
            type="number"
            value={orderForm.quantity}
            onChange={(e) => handleFieldChange('quantity', e.target.value)}
            placeholder="Enter quantity"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            step="0.0001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timing</label>
          <select 
            value={orderForm.timing}
            onChange={(e) => handleFieldChange('timing', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {timingOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={onSimulateOrder}
            disabled={!orderForm.quantity || (orderForm.type === 'limit' && !orderForm.price)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
          >
            Simulate Order
          </button>
          <button 
            onClick={onResetSimulation}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSimulationForm;