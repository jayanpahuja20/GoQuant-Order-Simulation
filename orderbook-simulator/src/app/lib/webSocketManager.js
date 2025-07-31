import { SYMBOL_MAPPINGS, EXCHANGE_CONFIG, SUBSCRIPTION_CHANNELS } from "../constants/constants";

export class WebSocketManager {
  constructor() {
    this.connections = new Map();
    this.subscriptions = new Map();
    this.reconnectTimeouts = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.isReconnecting = new Map();
    this.pingIntervals = new Map();

    // Cache for Bybit's stateful order book
    this.bybitOrderbookCache = new Map();
  }

  connect(venue, onMessage, onError, onClose) {
    const config = EXCHANGE_CONFIG[venue];
    if (!config) {
      console.error(`Unknown venue: ${venue}`);
      onError?.(venue, new Error(`Unknown venue: ${venue}`));
      return;
    }

    if (this.isReconnecting.get(venue)) {
      console.log(`Already attempting to connect to ${venue}`);
      return;
    }

    this.isReconnecting.set(venue, true);

    try {
      const wsUrl = config.wsUrl;
      console.log(`Attempting to connect to ${venue} at ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      this.connections.set(venue, ws);

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.error(`Connection timeout for ${venue}`);
          ws.close();
          this.handleConnectionFailure(venue, onMessage, onError, onClose);
        }
      }, 15000);

      ws.onopen = () => {
        console.log(`Connected to ${venue}`);
        clearTimeout(connectionTimeout);
        this.isReconnecting.set(venue, false);
        this.reconnectAttempts.set(venue, 0);
        
        const existingTimeout = this.reconnectTimeouts.get(venue);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          this.reconnectTimeouts.delete(venue);
        }

        this.setupPingInterval(venue, ws);
        this.handleConnectionSetup(venue, ws);

        this.resubscribeToChannels(venue);
      };

      ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            if (this.isConnectionMessage(venue, data)) {
                console.log(`${venue} connection confirmed:`, data);
                return;
            }

            if (this.isSubscriptionMessage(venue, data)) {
                console.log(`${venue} subscription confirmed:`, data);
                
                // FIX: Add a check to ensure 'data.args' exists and is not empty
                if (venue === 'bybit' && data.op === 'subscribe' && data.args && data.args.length > 0) {
                    const symbol = data.args[0].split('.').pop();
                    // Clear any old cache for this symbol upon successful resubscription
                    this.bybitOrderbookCache.delete(symbol);
                }
                return;
            }

            if (this.isPingPongMessage(venue, data)) {
                this.handlePingPong(venue, ws, data);
                return;
            }

            if (this.isErrorMessage(venue, data)) {
                console.error(`${venue} error:`, data);
                onError?.(venue, new Error(data.error?.message || data.msg || JSON.stringify(data)));
                return;
            }

            // Handle Bybit's stateful orderbook (snapshot/delta)
            if (venue === 'bybit' && data.topic?.startsWith('orderbook')) {
                const symbol = data.topic.split('.').pop();
                let currentBook = this.bybitOrderbookCache.get(symbol);

                if (data.type === 'snapshot') {
                    console.log(`📸 Received Bybit snapshot for ${symbol}`);
                    currentBook = {
                        bids: new Map(data.data.b.map(bid => [bid[0], bid[1]])),
                        asks: new Map(data.data.a.map(ask => [ask[0], ask[1]]))
                    };
                    this.bybitOrderbookCache.set(symbol, currentBook);
                } else if (data.type === 'delta' && currentBook) {
                    data.data.b.forEach(([price, size]) => {
                        if (parseFloat(size) === 0) currentBook.bids.delete(price);
                        else currentBook.bids.set(price, size);
                    });

                    data.data.a.forEach(([price, size]) => {
                        if (parseFloat(size) === 0) currentBook.asks.delete(price);
                        else currentBook.asks.set(price, size);
                    });
                }

                if (currentBook) {
                    const fullOrderbookMessage = {
                        ...data,
                        data: {
                            b: Array.from(currentBook.bids.entries()).sort((a, b) => parseFloat(b[0]) - parseFloat(a[0])),
                            a: Array.from(currentBook.asks.entries()).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
                        },
                        isManaged: true
                    };
                    onMessage?.(venue, fullOrderbookMessage);
                }
            } else {
                onMessage?.(venue, data);
            }
        } catch (error) {
            console.error(`Error parsing message from ${venue}:`, error, event.data);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${venue}:`, error);
        clearTimeout(connectionTimeout);
        onError?.(venue, error);
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed for ${venue}. Code: ${event.code}, Reason: ${event.reason || 'Unknown'}`);
        clearTimeout(connectionTimeout);
        this.connections.delete(venue);
        this.isReconnecting.set(venue, false);
        
        const pingInterval = this.pingIntervals.get(venue);
        if (pingInterval) {
          clearInterval(pingInterval);
          this.pingIntervals.delete(venue);
        }
        
        onClose?.(venue);
        
        if (event.code !== 1000) {
          this.handleConnectionFailure(venue, onMessage, onError, onClose);
        }
      };

      return ws;
    } catch (error) {
      console.error(`Failed to create WebSocket for ${venue}:`, error);
      this.isReconnecting.set(venue, false);
      onError?.(venue, error);
    }
  }

  setupPingInterval(venue, ws) {
    const pingIntervalMs = EXCHANGE_CONFIG[venue]?.pingInterval;
    if (!pingIntervalMs) return;

    const pingAction = () => {
      if (ws.readyState !== WebSocket.OPEN) return;
      
      switch (venue) {
        case 'bybit': {
          const pingMessage = { op: 'ping' };
          const messageToSend = JSON.stringify(pingMessage);
          console.log(`Sending ping to ${venue}:`, messageToSend);
          // ws.send(messageToSend);
          break;
        }
        case 'deribit': {
          const testMessage = { jsonrpc: '2.0', id: Date.now(), method: 'public/test' };
          const messageToSend = JSON.stringify(testMessage);
          console.log(`Sending test request to ${venue}:`, messageToSend);
          ws.send(messageToSend);
          break;
        }
        case 'binance':
          console.log('Maintaining Binance connection...');
          break;
      }
    };
    
    const interval = setInterval(pingAction, pingIntervalMs);
    this.pingIntervals.set(venue, interval);
  }

  handleConnectionSetup(venue, ws) {
    switch (venue) {
      case 'deribit':
        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'public/test'
        }));
        break;
    }
  }

  handlePingPong(venue, ws, data) {
    switch (venue) {
      case 'bybit':
        if (data.op === 'ping') {
          ws.send(JSON.stringify({ op: 'pong' }));
        }
        break;
      case 'deribit':
        if (data.method === 'heartbeat') {
          ws.send(JSON.stringify({
            jsonrpc: '2.0',
            id: data.id,
            method: 'public/heartbeat',
            params: data.params
          }));
        }
        break;
    }
  }

  handleConnectionFailure(venue, onMessage, onError, onClose) {
    const attempts = this.reconnectAttempts.get(venue) || 0;
    
    if (attempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for ${venue}`);
      this.isReconnecting.set(venue, false);
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, attempts);
    console.log(`Scheduling reconnection to ${venue} in ${delay}ms (attempt ${attempts + 1})`);
    
    this.reconnectAttempts.set(venue, attempts + 1);
    
    const timeout = setTimeout(() => {
      this.reconnectTimeouts.delete(venue);
      this.connect(venue, onMessage, onError, onClose);
    }, delay);
    
    this.reconnectTimeouts.set(venue, timeout);
  }

  isConnectionMessage(venue, data) {
    switch (venue) {
      case 'binance':
        return false;
      case 'bybit':
        return data.success === true && data.op === 'auth';
      case 'deribit':
        return data.id === 1 && data.result !== undefined;
      default:
        return false;
    }
  }

  isSubscriptionMessage(venue, data) {
    switch (venue) {
      case 'binance':
        return data.result === null && data.id;
      case 'bybit':
        return data.success === true && data.op === 'subscribe';
      case 'deribit':
        return data.method === 'subscription' && data.params && data.params.channel;
      default:
        return false;
    }
  }

  isErrorMessage(venue, data) {
    switch (venue) {
      case 'binance':
        return data.error !== undefined;
      case 'bybit':
        return data.success === false;
      case 'deribit':
        return data.error !== undefined;
      default:
        return false;
    }
  }

  isPingPongMessage(venue, data) {
    switch (venue) {
      case 'binance':
        return false;
      case 'bybit':
        return (data.op === 'ping' || data.op === 'pong') || (data.ret_msg === 'pong');
      case 'deribit':
        return data.method === 'heartbeat';
      default:
        return false;
    }
  }

  subscribeOrderbook(venue, symbol) {
    const ws = this.connections.get(venue);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error(`WebSocket not connected for ${venue}`);
      return false;
    }

    const mappedSymbol = SYMBOL_MAPPINGS[venue]?.[symbol] || symbol;
    console.log(`Subscribing to orderbook for ${symbol} (${mappedSymbol}) on ${venue}`);
    
    let subscriptionMessage;
    const channelBuilder = SUBSCRIPTION_CHANNELS[venue];

    try {
      switch (venue) {
        case 'binance':
          subscriptionMessage = {
            method: 'SUBSCRIBE',
            params: [channelBuilder.depth(mappedSymbol, 20, '100ms')],
            id: Date.now()
          };
          break;
        case 'bybit':
          subscriptionMessage = {
            op: 'subscribe',
            args: [channelBuilder.orderbook(mappedSymbol, 50)]
          };
          break;
        case 'deribit':
          subscriptionMessage = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'public/subscribe',
            params: {
              channels: [channelBuilder.book(mappedSymbol, '100ms')]
            }
          };
          break;
        default:
          console.error(`Unknown venue for subscription: ${venue}`);
          return false;
      }

      const messageToSend = JSON.stringify(subscriptionMessage);
      console.log(`Sending subscription to ${venue}:`, messageToSend);
      ws.send(messageToSend);

      const key = `${venue}-${symbol}`;
      this.subscriptions.set(key, { venue, symbol, mappedSymbol });
      
      return true;
    } catch (error) {
      console.error(`Error subscribing to ${venue}:`, error);
      return false;
    }
  }

  unsubscribeOrderbook(venue, symbol) {
    const ws = this.connections.get(venue);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn(`WebSocket not connected for ${venue}, cannot unsubscribe`);
      return;
    }

    const mappedSymbol = SYMBOL_MAPPINGS[venue]?.[symbol] || symbol;
    console.log(`Unsubscribing from ${symbol} (${mappedSymbol}) on ${venue}`);
    
    let unsubscribeMessage;
    const channelBuilder = SUBSCRIPTION_CHANNELS[venue];

    try {
      switch (venue) {
        case 'binance':
          unsubscribeMessage = {
            method: 'UNSUBSCRIBE',
            params: [channelBuilder.depth(mappedSymbol, 20, '100ms')],
            id: Date.now()
          };
          break;
        case 'bybit':
          unsubscribeMessage = {
            op: 'unsubscribe',
            args: [channelBuilder.orderbook(mappedSymbol, 50)]
          };
          break;
        case 'deribit':
          unsubscribeMessage = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'public/unsubscribe',
            params: {
              channels: [channelBuilder.book(mappedSymbol, '100ms')]
            }
          };
          break;
        default:
          console.error(`Unknown venue for unsubscribe: ${venue}`);
          return;
      }

      const messageToSend = JSON.stringify(unsubscribeMessage);
      console.log(`Sending unsubscribe to ${venue}:`, messageToSend);
      ws.send(messageToSend);

      const key = `${venue}-${symbol}`;
      this.subscriptions.delete(key);
    } catch (error) {
      console.error(`Error unsubscribing from ${venue}:`, error);
    }
  }

  disconnect(venue) {
    console.log(`Disconnecting from ${venue}`);
    
    const ws = this.connections.get(venue);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close(1000, 'Manual disconnect');
    }
    
    this.connections.delete(venue);
    this.isReconnecting.set(venue, false);
    
    const pingInterval = this.pingIntervals.get(venue);
    if (pingInterval) {
      clearInterval(pingInterval);
      this.pingIntervals.delete(venue);
    }
    
    const timeout = this.reconnectTimeouts.get(venue);
    if (timeout) {
      clearTimeout(timeout);
      this.reconnectTimeouts.delete(venue);
    }
    
    for (const [key, sub] of this.subscriptions) {
      if (sub.venue === venue) {
        this.subscriptions.delete(key);
      }
    }
  }

  resubscribeToChannels(venue) {
    console.log(`Resubscribing to all channels for ${venue}...`);
    for (const [key, sub] of this.subscriptions) {
        if (sub.venue === venue) {
            console.log(`Resubscribing to ${sub.symbol} on ${venue}`);
            // Calling subscribeOrderbook will handle the message formatting
            this.subscribeOrderbook(venue, sub.symbol);
        }
    }
}

  disconnectAll() {
    console.log('Disconnecting from all venues');
    const venues = Array.from(this.connections.keys());
    for (const venue of venues) {
      this.disconnect(venue);
    }
  }

  getConnectionStatus(venue) {
    const ws = this.connections.get(venue);
    if (!ws) return 'disconnected';
    
    switch (ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'disconnecting';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  getConnectionStatuses() {
    const statuses = {};
    for (const venue of Object.keys(EXCHANGE_CONFIG)) {
      statuses[venue] = this.getConnectionStatus(venue);
    }
    return statuses;
  }
}