# OrderBook Viewer - Real-Time Trading Analytics

![GoQuant OrderBook Viewer](https://ik.imagekit.io/j0xinhiam/goquant_logo.png?updatedAt=1753960225261)

A sophisticated real-time orderbook visualization and order simulation platform that connects to multiple cryptocurrency exchanges including Binance, Bybit, and Deribit. Built with React and Next.js, this application provides professional-grade trading analytics and market depth analysis.

## 🚀 Features

### Real-Time Data

- **Multi-Exchange Support**: Connects to Binance, Bybit, and Deribit via WebSocket
- **Live OrderBook**: Real-time bid/ask data with automatic updates
- **Market Depth Visualization**: Interactive charts showing market liquidity
- **Connection Management**: Automatic reconnection with exponential backoff

### Order Simulation

- **Advanced Order Types**: Market and limit order simulation
- **Impact Analysis**: Calculate slippage, price impact, and fill probability
- **Queue Position**: Estimate order position in the market
- **Fill Time Prediction**: Smart algorithms to predict execution time

### Analytics & Metrics

- **Market Sentiment**: Real-time bid/ask ratio and volume imbalance
- **Spread Analysis**: Live spread calculations and percentage metrics
- **Volume Metrics**: Cumulative volume analysis across price levels
- **Risk Assessment**: Automated risk level categorization

### User Interface

- **Professional Dashboard**: Clean, trader-focused interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Themes**: Modern glass-morphism design
- **Real-time Updates**: Live data with smooth animations

## 🏗️ Architecture

### Frontend Components

```
src/
├── components/
│   ├── OrderbookViewer.jsx       # Main container component
│   ├── OrderbookDisplay.jsx      # OrderBook visualization
│   ├── OrderbookTable.jsx        # Bid/Ask tables
│   ├── OrderSimulationForm.jsx   # Order entry form
│   ├── OrderImpactAnalysis.jsx   # Impact calculations
│   ├── MarketDepthChart.jsx      # Depth chart visualization
│   ├── MarketMetrics.jsx         # Analytics dashboard
│   ├── ConnectionStatus.jsx      # WebSocket status
│   ├── OrderLogs.jsx            # Order history & logs
│   └── Navbar.jsx               # Navigation component
├── lib/
│   ├── webSocketManager.js      # WebSocket connection handler
│   └── dataParser.js            # Exchange data parsers
├── hooks/
│   └── useOrderImpactCalculator.js # Order impact calculations
└── constants/
    └── constants.js             # Exchange configurations
```

### WebSocket Management

- **Connection Pooling**: Manages multiple exchange connections
- **Auto-Reconnection**: Handles network failures and reconnects
- **Message Parsing**: Exchange-specific data formatters
- **State Management**: Maintains orderbook state across updates

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.18.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🛠️ Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/jayanpahuja20/GoQuant-Order-Simulation.git
cd orderbook-simulator
```

### Step 2: Install Dependencies

Using npm:

```bash
npm install
```

Using yarn:

```bash
yarn install
```

### Step 3: Install Required Packages

Make sure these key dependencies are installed:

```bash
# Core React and Next.js
npm install react react-dom next

# UI Components and Icons
npm install lucide-react tailwindcss

# Charts and Visualization
npm install recharts

# Utility Libraries
npm install lodash mathjs

# Development Dependencies
npm install --save-dev @types/react @types/node
```

### Step 4: Configure Environment (Optional)

Create a `.env.local` file in the root directory for any environment-specific configurations:

```env
# Optional: API Keys for authenticated endpoints
NEXT_PUBLIC_BINANCE_API_KEY=your_binance_api_key
NEXT_PUBLIC_BYBIT_API_KEY=your_bybit_api_key
NEXT_PUBLIC_DERIBIT_CLIENT_ID=your_deribit_client_id

# Development settings
NEXT_PUBLIC_NODE_ENV=development
```

**Note**: For public orderbook data, API keys are not required. The application works without authentication for market data.

### Step 5: Update Constants Configuration

Edit `src/constants/constants.js` to customize exchange settings:

```javascript
// WebSocket Configuration
export const EXCHANGE_CONFIG = {
  binance: {
    wsUrl: "wss://stream.binance.com:9443/ws",
    pingInterval: 30000, // 30 seconds
  },
  bybit: {
    wsUrl: "wss://stream.bybit.com/v5/public/spot",
    pingInterval: 20000, // 20 seconds
  },
  deribit: {
    wsUrl: "wss://www.deribit.com/ws/api/v2",
    pingInterval: 60000, // 60 seconds
  },
};
```

### Step 6: Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Step 7: Build for Production

To create a production build:

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 🎯 Usage Guide

### Getting Started

1. **Launch the Application**: Open your browser and navigate to `http://localhost:3000`

2. **Select Exchange and Symbol**:

   - Choose from Binance, Bybit, or Deribit
   - Select a trading pair (BTC-USD, ETH-USD, etc.)

3. **Enable Real-Time Data**:
   - Click the Settings icon in the top-right
   - Toggle "Use Real WebSocket Data" for live feeds
   - Or keep it off to use mock data for testing

### Order Simulation

1. **Configure Order Parameters**:

   - Select order type (Market/Limit)
   - Choose side (Buy/Sell)
   - Enter quantity and price (for limit orders)

2. **Analyze Impact**:

   - Click "Simulate Order" to see impact analysis
   - Review slippage, fill probability, and estimated execution time
   - Check queue position and market impact

3. **Monitor Results**:
   - View detailed metrics in the Impact Analysis panel
   - Check order logs for historical simulations
   - Monitor connection status across exchanges

### Market Analysis

- **OrderBook View**: Real-time bid/ask levels with volume bars
- **Market Depth Chart**: Visual representation of market liquidity
- **Market Metrics**: Live spread, volume, and sentiment indicators
- **Connection Status**: Monitor WebSocket connections to all exchanges

## ⚙️ Configuration

### Exchange Symbol Mappings

The application automatically maps internal symbols to exchange-specific formats:

```javascript
export const SYMBOL_MAPPINGS = {
  binance: {
    "BTC-USD": "BTCUSDT",
    "ETH-USD": "ETHUSDT",
    // ... more mappings
  },
  bybit: {
    "BTC-USD": "BTCUSDT",
    "ETH-USD": "ETHUSDT",
    // ... more mappings
  },
  deribit: {
    "BTC-USD": "BTC-PERPETUAL",
    "ETH-USD": "ETH-PERPETUAL",
    // ... more mappings
  },
};
```

### WebSocket Connection Settings

Customize connection behavior in `constants.js`:

```javascript
export const EXCHANGE_CONFIG = {
  binance: {
    wsUrl: "wss://stream.binance.com:9443/ws",
    pingInterval: 30000,
    maxReconnectAttempts: 5,
    reconnectDelay: 2000,
  },
  // ... other exchanges
};
```

## 🔧 Troubleshooting

### Common Issues

1. **WebSocket Connection Failures**

   - Check internet connectivity
   - Verify exchange WebSocket URLs are accessible
   - Review browser console for connection errors

2. **No Data Appearing**

   - Ensure "Use Real WebSocket Data" is enabled for live data
   - Check that the selected symbol is supported by the exchange
   - Verify WebSocket connection status in the Connection Status panel

3. **Build Errors**

   - Ensure all dependencies are installed: `npm install`
   - Check Node.js version compatibility (v18.18.0+)
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

4. **Performance Issues**
   - Limit orderbook depth in settings if experiencing lag
   - Check browser memory usage with multiple exchanges connected
   - Consider using mock data mode for development

## 🤝 Contributing

I welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow React best practices and hooks patterns
- Use TypeScript for type safety
- Write comprehensive tests for new features
- Follow the existing code style and formatting
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Exchange APIs**: Thanks to Binance, Bybit, and Deribit for providing WebSocket APIs
- **UI Components**: Built with Tailwind CSS and Lucide React icons
- **Charts**: Powered by Recharts for beautiful data visualization
- **Community**: Special thanks to all contributors and users

## 📞 Support

For support, please:

1. Check the troubleshooting section above
2. Search existing [GitHub Issues](https://github.com/your-username/orderbook-viewer/issues)
3. Create a new issue with detailed information

---

**Happy Trading! 📈**
