// Venue configurations
export const venues = [
  { id: 'binance', name: 'Binance', logo: 'https://ik.imagekit.io/j0xinhiam/binance_logo.png?updatedAt=1753961468115' },
  { id: 'bybit', name: 'Bybit', logo: '#https://ik.imagekit.io/j0xinhiam/bybit_logo.jpg?updatedAt=1753961456972' },
  { id: 'deribit', name: 'Deribit', logo: '#https://ik.imagekit.io/j0xinhiam/deribit_logo.png?updatedAt=1753961468091' }
];

export const symbolsWithLogos = [
  { ticker: 'BTC-USD', name: 'BTC-USD', logo: 'https://ik.imagekit.io/j0xinhiam/btc.png?updatedAt=1753960972282' },
  { ticker: 'ETH-USD', name: 'ETH-USD', logo: 'https://ik.imagekit.io/j0xinhiam/eth.png?updatedAt=1753960971901' },
  { ticker: 'SOL-USD', name: 'SOL-USD', logo: 'https://ik.imagekit.io/j0xinhiam/sol.png?updatedAt=1753960972282' },
  { ticker: 'ADA-USD', name: 'ADA-USD', logo: 'https://ik.imagekit.io/j0xinhiam/ada_logo.png?updatedAt=1753961104549' },
  { ticker: 'DOT-USD', name: 'DOT-USD', logo: 'https://ik.imagekit.io/j0xinhiam/dot_logo.png?updatedAt=1753961104545' },
  { ticker: 'LINK-USD', name: 'LINK-USD', logo: 'https://ik.imagekit.io/j0xinhiam/link_logo.png?updatedAt=1753961104560' }
]

// Available symbols
export const symbols = symbolsWithLogos.map(symbol => symbol.ticker);

// Symbol mappings for each exchange
export const SYMBOL_MAPPINGS = {
  binance: {
    'BTC-USD': 'BTCUSDT',
    'ETH-USD': 'ETHUSDT',
    'SOL-USD': 'SOLUSDT',
    'ADA-USD': 'ADAUSDT',
    'DOT-USD': 'DOTUSDT',
    'LINK-USD': 'LINKUSDT'
  },
  bybit: {
    'BTC-USD': 'BTCUSDT',
    'ETH-USD': 'ETHUSDT',
    'SOL-USD': 'SOLUSDT',
    'ADA-USD': 'ADAUSDT',
    'DOT-USD': 'DOTUSDT',
    'LINK-USD': 'LINKUSDT'
  },
  deribit: {
    'BTC-USD': 'BTC-PERPETUAL',
    'ETH-USD': 'ETH-PERPETUAL',
    'SOL-USD': 'SOL-PERPETUAL',
    'ADA-USD': 'ADA-PERPETUAL',
    'DOT-USD': 'DOT-PERPETUAL',
    'LINK-USD': 'LINK-PERPETUAL'
  }
};

// Base prices for mock data generation (updated to more recent values)
export const basePrices = {
  'BTC-USD': 67000,
  'ETH-USD': 3400,
  'BTC-USDT': 67000,
  'ETH-USDT': 3400,
  'SOL-USD': 180,
  'ADA-USD': 0.75,
  'DOT-USD': 9,
  'LINK-USD': 18
};

// Order types
export const orderTypes = [
  { value: 'limit', label: 'Limit' },
  { value: 'market', label: 'Market' },
  { value: 'stop', label: 'Stop' },
  { value: 'stop_limit', label: 'Stop Limit' }
];

// Order sides
export const orderSides = [
  { value: 'buy', label: 'Buy' },
  { value: 'sell', label: 'Sell' }
];

// Timing options for order simulation
export const timingOptions = [
  { value: 'immediate', label: 'Immediate' },
  { value: '5s', label: '5s Delay' },
  { value: '10s', label: '10s Delay' },
  { value: '30s', label: '30s Delay' },
  { value: '1m', label: '1m Delay' },
  { value: '5m', label: '5m Delay' }
];

// Exchange-specific configuration (updated URLs and settings)
export const EXCHANGE_CONFIG = {
  binance: {
    name: 'Binance',
    wsUrl: 'wss://stream.binance.com:9443/ws',
    streamUrl: 'wss://stream.binance.com:9443/stream', // For multiple streams
    restUrl: 'https://api.binance.com/api/v3',
    orderBookDepth: 1000,
    maxReconnectAttempts: 5,
    pingInterval: 180000, // 3 minutes
    apiKey: '',
    secretKey: '',
    rateLimit: {
      requests: 1200,
      interval: 60000 // per minute
    }
  },
  bybit: {
    name: 'Bybit',
    wsUrl: 'wss://stream.bybit.com/v5/public/spot',
    linearUrl: 'wss://stream.bybit.com/v5/public/linear', // For futures
    inverseUrl: 'wss://stream.bybit.com/v5/public/inverse', // For inverse contracts
    restUrl: 'https://api.bybit.com/v5/market',
    orderBookDepth: 1000,
    maxReconnectAttempts: 5,
    pingInterval: 20000, // 20 seconds
    apiKey: '',
    secretKey: '',
    rateLimit: {
      requests: 600,
      interval: 60000 // per minute
    }
  },
  deribit: {
    name: 'Deribit',
    wsUrl: 'wss://www.deribit.com/ws/api/v2',
    testUrl: 'wss://test.deribit.com/ws/api/v2', // Testnet
    restUrl: 'https://www.deribit.com/api/v2/public',
    orderBookDepth: 1000,
    maxReconnectAttempts: 5,
    pingInterval: 60000, // 1 minute
    clientId: '',
    clientSecret: '',
    rateLimit: {
      requests: 20,
      interval: 1000 // per second
    }
  }
};

// Subscription channel templates for each exchange
export const SUBSCRIPTION_CHANNELS = {
  binance: {
    depth: (symbol, levels = 20, speed = '100ms') => `${symbol.toLowerCase()}@depth${levels}@${speed}`,
    ticker: (symbol) => `${symbol.toLowerCase()}@ticker`,
    trades: (symbol) => `${symbol.toLowerCase()}@trade`,
    kline: (symbol, interval = '1m') => `${symbol.toLowerCase()}@kline_${interval}`
  },
  bybit: {
    orderbook: (symbol, depth = 50) => `orderbook.${depth}.${symbol}`,
    ticker: (symbol) => `tickers.${symbol}`,
    trades: (symbol) => `publicTrade.${symbol}`,
    kline: (symbol, interval = '1') => `kline.${interval}.${symbol}`
  },
  deribit: {
    book: (symbol, interval = '100ms') => `book.${symbol}.${interval}`,
    ticker: (symbol) => `ticker.${symbol}.100ms`,
    trades: (symbol) => `trades.${symbol}.100ms`,
    chart: (symbol, resolution = '1') => `chart.trades.${symbol}.${resolution}`
  }
};