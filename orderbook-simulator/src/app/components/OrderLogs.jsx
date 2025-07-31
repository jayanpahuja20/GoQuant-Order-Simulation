import React, { useState } from 'react';
import { Clock, Filter, ChevronDown, ChevronUp, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { venues } from '../constants/constants';

const OrderLogs = ({ simulatedOrders = [], systemLogs = [], connectionStatus = {} }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [filterType, setFilterType] = useState('all');
  const [filterVenue, setFilterVenue] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Filter orders based on selected filters
  const filteredOrders = simulatedOrders.filter(order => {
    if (filterType !== 'all' && order.side !== filterType) return false;
    if (filterVenue !== 'all' && order.venue !== filterVenue) return false;
    return true;
  });

  // Filter logs based on selected filters
  const filteredLogs = systemLogs.filter(log => {
    if (filterType !== 'all') {
      if (filterType === 'error' && log.type !== 'error') return false;
      if (filterType === 'success' && log.type !== 'success') return false;
      if (filterType === 'info' && log.type !== 'info') return false;
    }
    return true;
  });

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getOrderStatusColor = (impact) => {
    if (!impact) return 'bg-gray-100 text-gray-800';
    const slippage = impact.slippage || 0;
    if (slippage < 0.1) return 'bg-green-100 text-green-800';
    if (slippage < 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getLogTypeColor = (type) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getLogTypeIcon = (type) => {
    switch (type) {
      case 'error': return <TrendingDown className="w-4 h-4" />;
      case 'success': return <TrendingUp className="w-4 h-4" />;
      case 'warning': return <Activity className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full min-w-[550px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Order Logs & Activity</h3>
      </div>

      <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'orders'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Simulated Orders ({filteredOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'logs'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          System Logs ({filteredLogs.length})
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-1">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Filters:</span>
        </div>
        
        {activeTab === 'orders' ? (
          <>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs px-2 py-1 border rounded"
            >
              <option value="all">All Types</option>
              <option value="buy">Buy Orders</option>
              <option value="sell">Sell Orders</option>
            </select>
            <select
              value={filterVenue}
              onChange={(e) => setFilterVenue(e.target.value)}
              className="text-xs px-2 py-1 border rounded"
            >
              <option value="all">All Venues</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.name}>
                  {venue.id.charAt(0).toUpperCase() + venue.id.slice(1)}
                </option>
              ))}
            </select>
          </>
        ) : (
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs px-2 py-1 border rounded"
          >
            <option value="all">All Types</option>
            <option value="error">Errors</option>
            <option value="success">Success</option>
            <option value="info">Info</option>
            <option value="warning">Warnings</option>
          </select>
        )}
        
        <button
          onClick={() => {
            setFilterType('all');
            setFilterVenue('all');
          }}
          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
        >
          Clear Filters
        </button>
      </div>

      <div className="flex-1 overflow-y-auto border rounded-lg">
        {activeTab === 'orders' ? (
          <>
            {filteredOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No simulated orders yet</p>
                <p className="text-xs">Orders will appear here when you simulate trades</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredOrders.map((order, index) => (
                  <div key={index} className="p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.side === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {order.side === 'buy' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {order.side.toUpperCase()}
                        </div>
                        <span className="font-medium">{order.symbol}</span>
                        <span className="text-sm text-gray-600">{order.venue}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getOrderStatusColor(order.impact)}`}>
                          {order.impact ? `${order.impact.slippage?.toFixed(3)}% slippage` : 'No impact data'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{formatTime(order.timestamp)}</span>
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === index ? null : index)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {expandedOrder === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {expandedOrder === index && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="font-medium">Order Details:</span>
                            <div className="mt-1 space-y-1">
                              <div>Type: <span className="font-mono">{order.type}</span></div>
                              <div>Quantity: <span className="font-mono">{order.quantity}</span></div>
                              <div>Price: <span className="font-mono">{formatCurrency(parseFloat(order.price) || 0)}</span></div>
                              <div>Timing: <span className="font-mono">{order.timing}</span></div>
                            </div>
                          </div>
                          {order.impact && (
                            <div>
                              <span className="font-medium">Impact Analysis:</span>
                              <div className="mt-1 space-y-1">
                                <div>Fill Price: <span className="font-mono">{formatCurrency(order.impact.fillPrice || 0)}</span></div>
                                <div>Total Cost: <span className="font-mono">{formatCurrency(order.impact.totalCost || 0)}</span></div>
                                <div>Slippage: <span className="font-mono">{order.impact.slippage?.toFixed(4)}%</span></div>
                                <div>Filled: <span className="font-mono">{order.impact.filledQuantity || 0}/{order.quantity}</span></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {filteredLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No system logs</p>
                <p className="text-xs">Connection events and errors will appear here</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredLogs.map((log, index) => (
                  <div key={index} className="p-3 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className={`flex items-center px-2 py-1 rounded-full ${getLogTypeColor(log.type)}`}>
                        {getLogTypeIcon(log.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{log.message}</p>
                          <span className="text-xs text-gray-500">{formatTime(log.timestamp)}</span>
                        </div>
                        {log.details && (
                          <p className="text-xs text-gray-600 mt-1">{log.details}</p>
                        )}
                        {log.venue && (
                          <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mt-1">
                            {log.venue}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Stats - Fixed at bottom */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-2 bg-blue-50 rounded">
          <div className="text-sm font-medium text-blue-800">Total Orders</div>
          <div className="text-lg font-bold text-blue-900">{simulatedOrders.length}</div>
        </div>
        <div className="p-2 bg-green-50 rounded">
          <div className="text-sm font-medium text-green-800">Buy Orders</div>
          <div className="text-lg font-bold text-green-900">
            {simulatedOrders.filter(o => o.side === 'buy').length}
          </div>
        </div>
        <div className="p-2 bg-red-50 rounded">
          <div className="text-sm font-medium text-red-800">Sell Orders</div>
          <div className="text-lg font-bold text-red-900">
            {simulatedOrders.filter(o => o.side === 'sell').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderLogs;