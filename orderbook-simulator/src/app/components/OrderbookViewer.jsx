// OrderbookViewer.jsx

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Wifi, WifiOff, Settings } from 'lucide-react';

// Import components
import Navbar from './Navbar';
import VenueSelector from './VenueSelector';
import SymbolSelector from './SymbolSelector';
import OrderbookDisplay from './OrderbookDisplay';
import OrderSimulationForm from './OrderSimulationForm';
import OrderImpactAnalysis from './OrderImpactAnalysis';
import ConnectionStatus from './ConnectionStatus';
import MarketMetrics from './MarketMetrics';
import APIIntegrationGuide from './APIIntegrationGuide';
import SettingsPanel from './SettingsPanel';
import OrderLogs from './OrderLogs';

// Import utilities and constants
import { WebSocketManager } from '../lib/webSocketManager';
import { parseOrderbookData, processOrderbookData, generateMockOrderbook, mergeOrderbookUpdate } from '../lib/dataParser';
import { venues, symbols, basePrices, SYMBOL_MAPPINGS } from '../constants/constants';
import { useOrderImpactCalculator } from '../hooks/useOrderImpactCalculator';

const OrderbookViewer = () => {
  const [selectedVenue, setSelectedVenue] = useState('binance');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC-USD');
  const [orderbooks, setOrderbooks] = useState({});
  const [connectionStatus, setConnectionStatus] = useState({});
  const [simulatedOrder, setSimulatedOrder] = useState(null);
  const [useRealData, setUseRealData] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [simulatedOrders, setSimulatedOrders] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimeoutRef = useRef(null);
  
  // Order form state
  const [orderForm, setOrderForm] = useState({
    venue: 'binance',
    symbol: 'BTC-USD',
    type: 'limit',
    side: 'buy',
    price: '',
    quantity: '',
    timing: 'immediate'
  });

  const wsManagerRef = useRef(null);
  const mockIntervalRef = useRef(null);
  // Ref to track the previous venue and symbol to make cleanup smarter
  const prevSubscriptionRef = useRef();

  // Add system log helper function
  const addSystemLog = useCallback((type, message, details = null, venue = null) => {
    const newLog = {
      type,
      message,
      details,
      venue,
      timestamp: Date.now()
    };
    setSystemLogs(prev => [...prev, newLog].slice(-100)); // Keep only last 100 logs
  }, []);

  // Initialize WebSocketManager only on client side
  useEffect(() => {
    wsManagerRef.current = new WebSocketManager();
    
    // This cleanup runs only when the entire component unmounts
    return () => {
      if (wsManagerRef.current) {
        console.log('Component unmounting, disconnecting all websockets.');
        wsManagerRef.current.disconnectAll();
      }
    };
  }, []);

  const currentOrderbook = orderbooks[`${selectedVenue}-${selectedSymbol}`] || { 
    bids: [], 
    asks: [], 
    spread: 0, 
    spreadPercent: 0,
    bestBid: 0,
    bestAsk: 0,
    midPrice: 0
  };
  
  const isConnected = connectionStatus[selectedVenue] === 'connected';

  const handleWebSocketMessage = useCallback((venue, data) => {
    const parsedData = parseOrderbookData(venue, data, selectedSymbol);

    if (parsedData) {
      addSystemLog('success', `Received orderbook data from ${venue}`, `Symbol: ${parsedData.symbol}`, venue);

      const venueMapping = SYMBOL_MAPPINGS[venue];
      const internalSymbol = Object.keys(venueMapping).find(key => venueMapping[key] === parsedData.symbol) || selectedSymbol;
      const key = `${venue}-${internalSymbol}`;

      if (venue === 'deribit' && parsedData.type === 'change') {
        setOrderbooks(prev => {
          const existingOrderbook = prev[key];
          const updatedOrderbook = mergeOrderbookUpdate(existingOrderbook, parsedData);
          return {
            ...prev,
            [key]: updatedOrderbook
          };
        });
      } else {
        const processedData = processOrderbookData(parsedData);
        setOrderbooks(prev => ({
          ...prev,
          [key]: processedData
        }));
      }

      if (venue === selectedVenue && internalSymbol === selectedSymbol) {
        setIsLoading(false);
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
      }
    }
  }, [addSystemLog, selectedVenue, selectedSymbol]);

  const handleWebSocketError = useCallback((venue, error) => {
    console.error(`WebSocket error for ${venue}:`, error);
    addSystemLog('error', `WebSocket error for ${venue}`, error.message, venue);
    setConnectionStatus(prev => ({ ...prev, [venue]: 'error' }));
  }, [addSystemLog]);

  const handleWebSocketClose = useCallback((venue) => {
    console.log(`WebSocket closed for ${venue}`);
    addSystemLog('warning', `Disconnected from ${venue}`, 'WebSocket connection closed', venue);
    setConnectionStatus(prev => ({ ...prev, [venue]: 'disconnected' }));
  }, [addSystemLog]);

  useEffect(() => {
    if (useRealData) {
      addSystemLog('info', 'Switched to real-time mode');
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
        mockIntervalRef.current = null;
      }
      setOrderbooks({});
    } else {
      addSystemLog('info', 'Switched to mock data mode');
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnectAll();
      }
      setConnectionStatus({});
      setIsLoading(false);

      const updateMockData = () => {
        const newOrderbooks = {};
        venues.forEach(venue => {
          symbols.forEach(symbol => {
            const key = `${venue.id}-${symbol}`;
            const basePrice = basePrices[symbol] * (1 + (Math.random() - 0.5) * 0.002);
            newOrderbooks[key] = generateMockOrderbook(basePrice, symbol);
          });
        });
        setOrderbooks(newOrderbooks);
      };
      updateMockData();
      mockIntervalRef.current = setInterval(updateMockData, 1000);
    }
    
    return () => {
      if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    };
  }, [useRealData, addSystemLog]);

  // Effect to manage active WebSocket connection and subscription
  useEffect(() => {
    const wsManager = wsManagerRef.current;

    // This cleanup function will run when dependencies change or the component unmounts.
    const cleanup = () => {
      const prev = prevSubscriptionRef.current;
      if (!wsManager || !prev) return;

      if (prev.venue !== selectedVenue) {
        console.log(`🧹 Disconnecting from old venue: ${prev.venue}`);
        addSystemLog('info', `Disconnecting from ${prev.venue}`);
        wsManager.disconnect(prev.venue);
      } else if (prev.symbol !== selectedSymbol) {
        console.log(`🧹 Unsubscribing from old symbol: ${prev.symbol} on ${prev.venue}`);
        wsManager.unsubscribeOrderbook(prev.venue, prev.symbol);
      }
    };

    if (!useRealData) {
      if (wsManager) wsManager.disconnectAll();
      return;
    }

    cleanup();

    prevSubscriptionRef.current = { venue: selectedVenue, symbol: selectedSymbol };
    if (!wsManager) return;
    
    setIsLoading(true);
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        console.warn(`Loading timeout for ${selectedSymbol} on ${selectedVenue}`);
        addSystemLog('warning', 'Loading timeout', `No data received for ${selectedSymbol} on ${selectedVenue}.`);
    }, 10000);

    setOrderbooks(prev => ({ ...prev, [`${selectedVenue}-${selectedSymbol}`]: undefined }));

    let subscribeTimeout;
    const connectAndSubscribe = () => {
      addSystemLog('info', `Connecting to ${selectedVenue}...`);
      setConnectionStatus(prev => ({ ...prev, [selectedVenue]: 'connecting' }));
      
      wsManager.connect(
        selectedVenue,
        handleWebSocketMessage,
        handleWebSocketError,
        handleWebSocketClose
      );

      subscribeTimeout = setTimeout(() => {
        console.log(`Subscribing to ${selectedSymbol} on ${selectedVenue}`);
        addSystemLog('info', `Subscribing to ${selectedSymbol} on ${selectedVenue}`);
        const success = wsManager.subscribeOrderbook(selectedVenue, selectedSymbol);
        if (success) {
          setConnectionStatus(prev => ({ ...prev, [selectedVenue]: 'connected' }));
        } else {
          console.error(`Failed to subscribe to ${selectedSymbol} on ${selectedVenue}`);
          addSystemLog('error', `Failed to subscribe to ${selectedSymbol}`, null, selectedVenue);
          setConnectionStatus(prev => ({ ...prev, [selectedVenue]: 'error' }));
        }
      }, 2000);
    };

    connectAndSubscribe();

    return () => {
      clearTimeout(subscribeTimeout);
      clearTimeout(loadingTimeoutRef.current);
    };
  }, [selectedVenue, selectedSymbol, useRealData, addSystemLog, handleWebSocketMessage, handleWebSocketError, handleWebSocketClose]);

  useEffect(() => {
    setOrderForm(prev => ({
      ...prev,
      venue: selectedVenue,
      symbol: selectedSymbol
    }));
  }, [selectedVenue, selectedSymbol]);
  
  const calculateOrderImpact = useOrderImpactCalculator(orderForm, currentOrderbook);

  const handleOrderFormChange = (field, value) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
  };

  const simulateOrder = () => {
    const impact = calculateOrderImpact();
    if (impact) {
      const newOrder = { ...orderForm, impact, timestamp: Date.now() };
      setSimulatedOrder(newOrder);
      setSimulatedOrders(prev => [newOrder, ...prev].slice(0, 50));
      addSystemLog('success', `Order simulated: ${orderForm.side.toUpperCase()} ${orderForm.quantity} ${orderForm.symbol}`, 
        `Slippage: ${impact.slippage?.toFixed(3)}%`, orderForm.venue);
    } else {
      addSystemLog('warning', 'Order simulation failed', 'Insufficient orderbook data');
    }
  };

  const resetSimulation = () => {
    setSimulatedOrder(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Navbar /> 
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Real-Time Orderbook Viewer</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                aria-label="Toggle Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              {isConnected && useRealData ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="w-4 h-4 mr-1" />
                  <span className="text-sm">Connected</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <WifiOff className="w-4 h-4 mr-1" />
                  <span className="text-sm">Disconnected</span>
                </div>
              )}
            </div>
          </div>

          <SettingsPanel 
            useRealData={useRealData}
            onToggleRealData={setUseRealData}
            show={showSettings}
          />

          <div className="flex flex-wrap gap-4 items-center">
            <VenueSelector 
              selectedVenue={selectedVenue}
              onVenueChange={setSelectedVenue}
              connectionStatus={connectionStatus}
            />
            
            <SymbolSelector 
              selectedSymbol={selectedSymbol}
              onSymbolChange={setSelectedSymbol}
            />
            
            {isLoading && useRealData && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm">Loading data...</span>
              </div>
            )}
            
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Spread:</span>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                ${(currentOrderbook.spread || 0).toFixed(2)} ({(currentOrderbook.spreadPercent || 0).toFixed(3)}%)
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Mid Price:</span>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                ${(currentOrderbook.midPrice || 0).toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Data Source:</span>
              <span className={`text-xs px-2 py-1 rounded ${
                useRealData ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {useRealData ? 'Real-time' : 'Mock'}
              </span>
            </div>
          </div>
        </div>

        <div id="orderbook" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <OrderbookDisplay 
            selectedVenue={selectedVenue}
            selectedSymbol={selectedSymbol}
            orderbook={currentOrderbook}
            simulatedOrder={simulatedOrder}
            isLoading={isLoading && useRealData}
          />

          <div className="space-y-6">
            <div id="simulation">
              <OrderSimulationForm 
                orderForm={orderForm}
                onFormChange={handleOrderFormChange}
                onSimulateOrder={simulateOrder}
                onResetSimulation={resetSimulation}
              />
            </div>
            <div id="analysis">
              <OrderImpactAnalysis simulatedOrder={simulatedOrder} />
            </div>
            <div id="status">
            <ConnectionStatus 
              connectionStatus={connectionStatus}
              useRealData={useRealData}
            />
            </div>
            <div id="api">
              <APIIntegrationGuide useRealData={useRealData} />
            </div>
          </div>

          <div id="logs" className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrderLogs 
              simulatedOrders={simulatedOrders}
              systemLogs={systemLogs}
              connectionStatus={connectionStatus}
            />
            <MarketMetrics orderbook={currentOrderbook} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderbookViewer;