import { useCallback } from 'react';

export const useOrderImpactCalculator = (orderForm, currentOrderbook) => {
  return useCallback(() => {
    if (!orderForm.quantity || !currentOrderbook.bids?.length || !currentOrderbook.asks?.length) {
      return null;
    }

    const quantity = parseFloat(orderForm.quantity);
    const price = parseFloat(orderForm.price) || 0;
    const isBuy = orderForm.side === 'buy';
    const isMarket = orderForm.type === 'market';

    // Use the correct property names from the updated data structure
    const levels = isBuy ? currentOrderbook.asks : currentOrderbook.bids;
    const oppositeLevels = isBuy ? currentOrderbook.bids : currentOrderbook.asks;
    
    if (!levels || levels.length === 0) {
      return null;
    }

    let fillQuantity = 0;
    let fillValue = 0;
    let impactedLevels = 0;
    let wouldCrossSpread = false;
    let position = -1;

    const bestBid = currentOrderbook.bestBid || currentOrderbook.bids[0]?.price || 0;
    const bestAsk = currentOrderbook.bestAsk || currentOrderbook.asks[0]?.price || 0;
    const midPrice = currentOrderbook.midPrice || (bestBid + bestAsk) / 2;

    if (isMarket) {
      // Market order - walk through levels until filled
      for (let i = 0; i < levels.length && fillQuantity < quantity; i++) {
        const level = levels[i];
        const availableQty = Math.min(level.quantity, quantity - fillQuantity);
        fillQuantity += availableQty;
        fillValue += availableQty * level.price;
        impactedLevels = i + 1;
      }
      wouldCrossSpread = true;
    } else {
      // Limit order analysis
      if (isBuy) {
        // Buy order - check if price is above best ask (would cross spread)
        wouldCrossSpread = price >= bestAsk;
        
        if (wouldCrossSpread) {
          // Would execute immediately as market order
          for (let i = 0; i < levels.length && fillQuantity < quantity; i++) {
            const level = levels[i];
            if (level.price <= price) {
              const availableQty = Math.min(level.quantity, quantity - fillQuantity);
              fillQuantity += availableQty;
              fillValue += availableQty * level.price;
              impactedLevels = i + 1;
            } else {
              break;
            }
          }
        } else {
          // Find position in bid queue
          position = oppositeLevels.findIndex(level => level.price < price);
          if (position === -1) position = oppositeLevels.length;
          fillQuantity = quantity;
          fillValue = quantity * price;
        }
      } else {
        // Sell order - check if price is below best bid (would cross spread)
        wouldCrossSpread = price <= bestBid;
        
        if (wouldCrossSpread) {
          // Would execute immediately as market order
          for (let i = 0; i < levels.length && fillQuantity < quantity; i++) {
            const level = levels[i];
            if (level.price >= price) {
              const availableQty = Math.min(level.quantity, quantity - fillQuantity);
              fillQuantity += availableQty;
              fillValue += availableQty * level.price;
              impactedLevels = i + 1;
            } else {
              break;
            }
          }
        } else {
          // Find position in ask queue
          position = oppositeLevels.findIndex(level => level.price > price);
          if (position === -1) position = oppositeLevels.length;
          fillQuantity = quantity;
          fillValue = quantity * price;
        }
      }
    }

    const avgFillPrice = fillQuantity > 0 ? fillValue / fillQuantity : price;
    const slippage = midPrice > 0 ? Math.abs((avgFillPrice - midPrice) / midPrice * 100) : 0;
    const priceImpact = midPrice > 0 ? Math.abs((avgFillPrice - (isBuy ? bestAsk : bestBid)) / midPrice * 100) : 0;
    
    // Calculate estimated fill time based on position and market activity
    const estimatedFillTime = isMarket || wouldCrossSpread ? 
      'Immediate' : 
      position < 5 ? 'Fast (~1-5min)' : 
      position < 20 ? 'Medium (~5-30min)' : 
      'Slow (30min+)';

    // Determine market impact level
    let marketImpactLevel = 'Low';
    if (slippage > 0.5 || impactedLevels > 10) {
      marketImpactLevel = 'High';
    } else if (slippage > 0.1 || impactedLevels > 5) {
      marketImpactLevel = 'Medium';
    }
    
    return {
      fillPercentage: Math.min(100, (fillQuantity / quantity) * 100),
      averageFillPrice: avgFillPrice,
      slippage: Math.round(slippage * 1000) / 1000, // Round to 3 decimal places
      priceImpact: Math.round(priceImpact * 1000) / 1000,
      marketImpact: impactedLevels,
      marketImpactLevel,
      impactedLevels,
      wouldCrossSpread,
      position,
      estimatedFillTime,
      timeToFill: estimatedFillTime,
      totalCost: fillValue,
      remainingQuantity: quantity - fillQuantity,
      liquidityUtilized: fillQuantity > 0 ? (fillQuantity / quantity) * 100 : 0
    };
  }, [orderForm, currentOrderbook]);
};