// Parse orderbook data from different exchanges
export const parseOrderbookData = (venue, data, symbol) => {
  try {
    switch (venue) {
      case 'binance':
        return parseBinanceOrderbook(data, symbol);
      case 'bybit':
        return parseBybitOrderbook(data);
      case 'deribit':
        return parseDeribitOrderbook(data);
      default:
        console.warn(`Unknown venue for parsing: ${venue}`);
        return null;
    }
  } catch (error) {
    console.error(`Error parsing orderbook data from ${venue}:`, error, data);
    return null;
  }
};

// Binance orderbook parser
const parseBinanceOrderbook = (data, symbol) => {
  // Handle subscription confirmation
  if (data.result === null && data.id) {
    console.log('Binance subscription confirmed');
    return null;
  }

  // Handle error messages
  if (data.error) {
    console.error('Binance error:', data.error);
    return null;
  }

  // Handle direct depth stream data (when connected to specific stream)
  if (data.lastUpdateId && data.bids && data.asks) {
    return {
      symbol: symbol,
      bids: data.bids?.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity)
      })) || [],
      asks: data.asks?.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity)
      })) || [],
      timestamp: data.lastUpdateId || Date.now()
    };
  }

  // Handle stream wrapper format
  if (data.stream && data.data) {
    // Skip non-orderbook messages
    if (!data.stream.includes('@depth')) {
      return null;
    }

    const orderbookData = data.data;
    
    return {
      symbol: symbol,
      bids: orderbookData.bids?.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity)
      })) || [],
      asks: orderbookData.asks?.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity)
      })) || [],
      timestamp: orderbookData.lastUpdateId || Date.now()
    };
  }

  return null;
};

// Bybit orderbook parser
const parseBybitOrderbook = (data) => {
  // Handle subscription confirmation
  if (data.success === true && data.op === 'subscribe') {
    console.log('Bybit subscription confirmed:', data);
    return null;
  }

  // Handle error messages
  if (data.success === false || data.ret_msg) {
    return null;
  }

  // Handle ping/pong messages
  if (data.op === 'ping' || data.op === 'pong') {
    return null;
  }

  // Handle orderbook data
  if (data.topic && data.topic.startsWith('orderbook.') && data.data) {
    const orderbookData = data.data;
    
    // Extract symbol from topic (e.g., "orderbook.50.BTCUSDT" -> "BTCUSDT")
    const symbol = data.topic.split('.')[2];
    
    return {
      symbol: symbol,
      bids: orderbookData.b?.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity)
      })) || [],
      asks: orderbookData.a?.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity)
      })) || [],
      timestamp: parseInt(data.ts) || Date.now()
    };
  }

  return null;
};

// Deribit orderbook parser
const parseDeribitOrderbook = (data) => {
  // Handle error messages first
  if (data.error) {
    console.error('Deribit error:', data.error);
    return null;
  }

  // Ignore heartbeat messages
  if (data.method === 'heartbeat') {
    return null;
  }
  
  // Ignore one-time JSON-RPC responses (like for public/test or subscribe)
  if (data.id && data.result) {
    return null;
  }

  // Handle and parse orderbook data from the subscription stream
  if (data.method === 'subscription' && data.params?.channel?.startsWith('book.')) {
    const orderbookData = data.params.data;
    
    // Ensure there is data to parse
    if (!orderbookData) return null;

    const symbol = data.params.channel.split('.')[1];
    
    return {
      symbol: symbol,
      // Note: This data is a delta (changes), not a full order book snapshot.
      // It must be passed to a function like your `mergeOrderbookUpdate`.
      bids: orderbookData.bids?.map(([action, price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        action: action
      })) || [],
      asks: orderbookData.asks?.map(([action, price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        action: action
      })) || [],
      timestamp: parseInt(orderbookData.timestamp) || Date.now(),
      changeId: orderbookData.change_id,
      type: orderbookData.type // 'snapshot' or 'change'
    };
  }

  // Return null for any other message type
  return null;
};

// Process and enhance orderbook data
export const processOrderbookData = (rawData) => {
  if (!rawData || !rawData.bids || !rawData.asks) {
    return { 
      symbol: rawData?.symbol || 'UNKNOWN',
      bids: [], 
      asks: [], 
      spread: 0,
      spreadPercent: 0,
      timestamp: rawData?.timestamp || Date.now()
    };
  }

  // Sort and limit orderbook levels
  const bids = rawData.bids
    .filter(level => level.price > 0 && level.quantity > 0) // Filter out invalid levels
    .sort((a, b) => b.price - a.price) // Highest price first for bids
    .slice(0, 20) // Limit to 20 levels
    .map((level, index, array) => ({
      ...level,
      total: array.slice(0, index + 1).reduce((sum, l) => sum + l.quantity, 0)
    }));

  const asks = rawData.asks
    .filter(level => level.price > 0 && level.quantity > 0) // Filter out invalid levels
    .sort((a, b) => a.price - b.price) // Lowest price first for asks
    .slice(0, 20) // Limit to 20 levels
    .map((level, index, array) => ({
      ...level,
      total: array.slice(0, index + 1).reduce((sum, l) => sum + l.quantity, 0)
    }));

  // Calculate spread
  const bestBid = bids[0]?.price || 0;
  const bestAsk = asks[0]?.price || 0;
  const spread = bestAsk > 0 && bestBid > 0 ? bestAsk - bestBid : 0;
  const midPrice = (bestBid + bestAsk) / 2;
  const spreadPercent = midPrice > 0 ? (spread / midPrice) * 100 : 0;

  return {
    symbol: rawData.symbol,
    bids,
    asks,
    spread: Math.round(spread * 100) / 100,
    spreadPercent: Math.round(spreadPercent * 10000) / 10000, // 4 decimal places
    timestamp: rawData.timestamp || Date.now(),
    bestBid,
    bestAsk,
    midPrice: Math.round(midPrice * 100) / 100
  };
};

// Generate mock orderbook data for testing
export const generateMockOrderbook = (basePrice, symbol = 'BTC-USD') => {
  const spread = basePrice * 0.0001; // 0.01% spread
  const midPrice = basePrice + (Math.random() - 0.5) * basePrice * 0.001; // Add some random movement
  const bestBid = midPrice - spread / 2;
  const bestAsk = midPrice + spread / 2;

  const generateLevels = (startPrice, increment, count) => {
    const levels = [];
    let cumulativeTotal = 0;
    
    for (let i = 0; i < count; i++) {
      const price = startPrice + (increment * i);
      const quantity = Math.random() * 5 + 0.1; // Random quantity between 0.1 and 5.1
      cumulativeTotal += quantity;
      
      levels.push({
        price: Math.round(price * 100) / 100, // Round to 2 decimal places
        quantity: Math.round(quantity * 10000) / 10000, // Round to 4 decimal places
        total: Math.round(cumulativeTotal * 10000) / 10000
      });
    }
    
    return levels;
  };

  // Generate bid levels (decreasing prices)
  const bids = generateLevels(bestBid, -basePrice * 0.0001, 15);
  
  // Generate ask levels (increasing prices)
  const asks = generateLevels(bestAsk, basePrice * 0.0001, 15);

  return {
    symbol,
    bids,
    asks,
    spread: Math.round(spread * 100) / 100,
    spreadPercent: Math.round((spread / midPrice) * 10000) / 100,
    timestamp: Date.now(),
    bestBid: Math.round(bestBid * 100) / 100,
    bestAsk: Math.round(bestAsk * 100) / 100,
    midPrice: Math.round(midPrice * 100) / 100
  };
};

// Validate orderbook data structure
export const validateOrderbookData = (data) => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const { bids, asks } = data;
  
  if (!Array.isArray(bids) || !Array.isArray(asks)) {
    return false;
  }

  // Check if levels have required properties
  const isValidLevel = (level) => {
    return level && 
           typeof level.price === 'number' && 
           typeof level.quantity === 'number' && 
           level.price > 0 && 
           level.quantity > 0 &&
           !isNaN(level.price) &&
           !isNaN(level.quantity);
  };

  return bids.every(isValidLevel) && asks.every(isValidLevel);
};

// Merge orderbook updates (for incremental updates)
export const mergeOrderbookUpdate = (existingOrderbook, update) => {
  if (!existingOrderbook || !update) {
    return update || existingOrderbook;
  }

  const mergeLevels = (existingLevels, updateLevels) => {
    const merged = new Map();
    
    // Add existing levels
    existingLevels.forEach(level => {
      merged.set(level.price, level);
    });
    
    // Apply updates
    updateLevels.forEach(level => {
      if (level.quantity === 0 || (level.action && level.action === 'delete')) {
        // Remove level if quantity is 0 or action is delete
        merged.delete(level.price);
      } else {
        // Update or add level
        merged.set(level.price, {
          price: level.price,
          quantity: level.quantity
        });
      }
    });
    
    return Array.from(merged.values());
  };

  const mergedBids = mergeLevels(existingOrderbook.bids || [], update.bids || [])
    .sort((a, b) => b.price - a.price);
    
  const mergedAsks = mergeLevels(existingOrderbook.asks || [], update.asks || [])
    .sort((a, b) => a.price - b.price);

  return processOrderbookData({
    symbol: update.symbol || existingOrderbook.symbol,
    bids: mergedBids,
    asks: mergedAsks,
    timestamp: update.timestamp || Date.now()
  });
};

// Symbol mapping helper for different exchanges
export const getExchangeSpecificSymbol = (venue, symbol) => {
  const mappings = {
    binance: {
      'BTC-USD': 'BTCUSDT',
      'ETH-USD': 'ETHUSDT',
      'BTC-USDT': 'BTCUSDT',
      'ETH-USDT': 'ETHUSDT',
      'SOL-USD': 'SOLUSDT',
      'ADA-USD': 'ADAUSDT',
      'DOT-USD': 'DOTUSDT',
      'LINK-USD': 'LINKUSDT'
    },
    bybit: {
      'BTC-USD': 'BTCUSDT',
      'ETH-USD': 'ETHUSDT', 
      'BTC-USDT': 'BTCUSDT',
      'ETH-USDT': 'ETHUSDT',
      'SOL-USD': 'SOLUSDT',
      'ADA-USD': 'ADAUSDT',
      'DOT-USD': 'DOTUSDT',
      'LINK-USD': 'LINKUSDT'
    },
    deribit: {
      'BTC-USD': 'BTC-PERPETUAL',
      'ETH-USD': 'ETH-PERPETUAL',
      'BTC-USDT': 'BTC-PERPETUAL',
      'ETH-USDT': 'ETH-PERPETUAL',
      'SOL-USD': 'SOL-PERPETUAL',
      'ADA-USD': 'ADA-PERPETUAL',
      'DOT-USD': 'DOT-PERPETUAL',
      'LINK-USD': 'LINK-PERPETUAL'
    }
  };
  
  return mappings[venue]?.[symbol] || symbol;
};

// Format price for display based on symbol
export const formatPrice = (price, symbol) => {
  if (!price || isNaN(price)) return '0.00';
  
  // Different precision for different symbols
  const precision = {
    'BTC-USD': 2,
    'BTC-USDT': 2,
    'ETH-USD': 2,
    'ETH-USDT': 2,
    'SOL-USD': 3,
    'ADA-USD': 4,
    'DOT-USD': 3,
    'LINK-USD': 3
  };
  
  const decimals = precision[symbol] || 2;
  return price.toFixed(decimals);
};

// Format quantity for display
export const formatQuantity = (quantity, symbol) => {
  if (!quantity || isNaN(quantity)) return '0.0000';
  
  // Different precision for different symbols
  const precision = {
    'BTC-USD': 6,
    'BTC-USDT': 6,
    'ETH-USD': 4,
    'ETH-USDT': 4,
    'SOL-USD': 2,
    'ADA-USD': 0,
    'DOT-USD': 2,
    'LINK-USD': 2
  };
  
  const decimals = precision[symbol] || 4;
  return quantity.toFixed(decimals);
};

// Calculate orderbook metrics
export const calculateOrderbookMetrics = (orderbook) => {
  if (!orderbook || !orderbook.bids || !orderbook.asks) {
    return {
      totalBidVolume: 0,
      totalAskVolume: 0,
      bidAskRatio: 0,
      weightedMidPrice: 0,
      depthImbalance: 0
    };
  }
  
  const totalBidVolume = orderbook.bids.reduce((sum, level) => sum + level.quantity, 0);
  const totalAskVolume = orderbook.asks.reduce((sum, level) => sum + level.quantity, 0);
  const bidAskRatio = totalAskVolume > 0 ? totalBidVolume / totalAskVolume : 0;
  
  // Calculate weighted mid price (volume-weighted)
  const bidWeightedPrice = orderbook.bids.reduce((sum, level) => sum + (level.price * level.quantity), 0);
  const askWeightedPrice = orderbook.asks.reduce((sum, level) => sum + (level.price * level.quantity), 0);
  const totalVolume = totalBidVolume + totalAskVolume;
  const weightedMidPrice = totalVolume > 0 ? (bidWeightedPrice + askWeightedPrice) / totalVolume : 0;
  
  // Depth imbalance (-1 = all asks, +1 = all bids, 0 = balanced)
  const depthImbalance = totalVolume > 0 ? (totalBidVolume - totalAskVolume) / totalVolume : 0;
  
  return {
    totalBidVolume: Math.round(totalBidVolume * 10000) / 10000,
    totalAskVolume: Math.round(totalAskVolume * 10000) / 10000,
    bidAskRatio: Math.round(bidAskRatio * 100) / 100,
    weightedMidPrice: Math.round(weightedMidPrice * 100) / 100,
    depthImbalance: Math.round(depthImbalance * 10000) / 10000
  };
};