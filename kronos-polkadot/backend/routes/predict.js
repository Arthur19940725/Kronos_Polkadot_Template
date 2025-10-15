import express from 'express';
import axios from 'axios';

const router = express.Router();

// CoinGecko API 配置
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// 符号映射
const SYMBOL_MAP = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'DOT': 'polkadot',
  'SOL': 'solana',
  'ADA': 'cardano',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'AVAX': 'avalanche-2'
};

/**
 * 获取当前价格
 */
async function fetchCurrentPrice(symbol) {
  try {
    const coinId = SYMBOL_MAP[symbol.toUpperCase()] || symbol.toLowerCase();
    const response = await axios.get(`${COINGECKO_BASE_URL}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_24hr_vol: true,
        include_market_cap: true
      }
    });

    const data = response.data[coinId];
    if (!data) {
      throw new Error(`Price data not found for ${symbol}`);
    }

    return {
      price: data.usd,
      change24h: data.usd_24h_change || 0,
      volume24h: data.usd_24h_vol || 0,
      marketCap: data.usd_market_cap || 0
    };
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * 获取历史数据
 */
async function fetchHistoricalData(symbol, days = 7) {
  try {
    const coinId = SYMBOL_MAP[symbol.toUpperCase()] || symbol.toLowerCase();
    const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
        interval: days > 1 ? 'daily' : 'hourly'
      }
    });

    return {
      prices: response.data.prices,
      volumes: response.data.total_volumes,
      marketCaps: response.data.market_caps
    };
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * 调用 Python Kronos 模型进行预测
 */
async function callKronosPredictor(symbol, historicalData) {
  try {
    // 调用本地 Python Flask 服务
    const response = await axios.post('http://localhost:5001/predict', {
      symbol: symbol,
      data: historicalData
    }, {
      timeout: 30000 // 30秒超时
    });

    return response.data;
  } catch (error) {
    console.error('Kronos predictor error:', error.message);
    
    // 如果 Python 服务不可用，使用简单的预测算法作为后备
    return generateSimplePrediction(historicalData);
  }
}

/**
 * 简单预测算法（后备方案）
 */
function generateSimplePrediction(historicalData) {
  if (!historicalData || !historicalData.prices || historicalData.prices.length === 0) {
    return null;
  }

  const prices = historicalData.prices.map(p => p[1]);
  const latestPrice = prices[prices.length - 1];
  
  // 计算移动平均
  const ma7 = prices.slice(-7).reduce((a, b) => a + b, 0) / 7;
  
  // 计算趋势
  const trend = (latestPrice - ma7) / ma7;
  
  // 生成预测（24小时后）
  const randomFactor = (Math.random() - 0.5) * 0.1; // ±10% 随机因素
  const prediction24h = latestPrice * (1 + trend + randomFactor);
  
  // 生成多个预测点
  const predictions = [];
  for (let i = 1; i <= 24; i++) {
    const hourlyTrend = trend / 24;
    const hourlyRandom = (Math.random() - 0.5) * 0.02;
    predictions.push({
      hour: i,
      price: latestPrice * (1 + hourlyTrend * i + hourlyRandom),
      timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString()
    });
  }

  return {
    price_24h: prediction24h,
    confidence: 0.65,
    trend: trend > 0 ? 'bullish' : 'bearish',
    predictions: predictions,
    model: 'simple_fallback'
  };
}

/**
 * GET /api/predict
 * 获取价格预测
 */
router.get('/predict', async (req, res) => {
  try {
    const symbol = (req.query.symbol || 'BTC').toUpperCase();
    
    // 获取当前价格
    const currentPriceData = await fetchCurrentPrice(symbol);
    
    // 获取历史数据（7天）
    const historicalData = await fetchHistoricalData(symbol, 7);
    
    // 调用 Kronos 模型预测
    const prediction = await callKronosPredictor(symbol, historicalData);

    res.json({
      symbol: symbol,
      currentPrice: currentPriceData.price,
      change24h: currentPriceData.change24h,
      volume24h: currentPriceData.volume24h,
      marketCap: currentPriceData.marketCap,
      prediction: prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      error: 'Prediction failed',
      message: error.message
    });
  }
});

/**
 * GET /api/history
 * 获取历史数据
 */
router.get('/history', async (req, res) => {
  try {
    const symbol = (req.query.symbol || 'BTC').toUpperCase();
    const days = parseInt(req.query.days) || 7;

    const historicalData = await fetchHistoricalData(symbol, days);

    res.json({
      symbol: symbol,
      days: days,
      data: historicalData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      error: 'Failed to fetch history',
      message: error.message
    });
  }
});

/**
 * GET /api/assets
 * 获取支持的资产列表
 */
router.get('/assets', (req, res) => {
  const assets = Object.keys(SYMBOL_MAP).map(symbol => ({
    symbol: symbol,
    name: SYMBOL_MAP[symbol],
    supported: true
  }));

  res.json({
    assets: assets,
    count: assets.length
  });
});

export default router;

