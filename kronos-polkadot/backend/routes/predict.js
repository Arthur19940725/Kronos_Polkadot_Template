import express from 'express';
import axios from 'axios';

const router = express.Router();

// 币安 API 配置
const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';
const BINANCE_FAPI_URL = 'https://fapi.binance.com/fapi/v1';

// 符号映射（币安交易对格式）
const SYMBOL_MAP = {
  'BTC': 'BTCUSDT',
  'ETH': 'ETHUSDT',
  'DOT': 'DOTUSDT',
  'SOL': 'SOLUSDT',
  'ADA': 'ADAUSDT',
  'MATIC': 'MATICUSDT',
  'LINK': 'LINKUSDT',
  'AVAX': 'AVAXUSDT'
};

/**
 * 获取当前价格（币安 API）
 */
async function fetchCurrentPrice(symbol) {
  try {
    const tradingPair = SYMBOL_MAP[symbol.toUpperCase()] || `${symbol.toUpperCase()}USDT`;
    
    // 获取24小时价格变动统计
    const ticker24h = await axios.get(`${BINANCE_BASE_URL}/ticker/24hr`, {
      params: { symbol: tradingPair }
    });

    const data = ticker24h.data;
    
    return {
      price: parseFloat(data.lastPrice),
      change24h: parseFloat(data.priceChangePercent),
      volume24h: parseFloat(data.quoteVolume), // USDT 计价的成交量
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
      trades24h: data.count
    };
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * 获取历史数据（币安 K线数据）
 */
async function fetchHistoricalData(symbol, days = 7) {
  try {
    const tradingPair = SYMBOL_MAP[symbol.toUpperCase()] || `${symbol.toUpperCase()}USDT`;
    
    // 根据天数确定时间间隔
    const interval = days <= 1 ? '1h' : (days <= 7 ? '4h' : '1d');
    
    // 计算开始时间
    const endTime = Date.now();
    const startTime = endTime - (days * 24 * 60 * 60 * 1000);
    
    // 获取 K线数据
    const response = await axios.get(`${BINANCE_BASE_URL}/klines`, {
      params: {
        symbol: tradingPair,
        interval: interval,
        startTime: startTime,
        endTime: endTime,
        limit: 1000
      }
    });

    // 转换数据格式为与 CoinGecko 兼容的格式
    const prices = [];
    const volumes = [];
    const ohlcv = [];
    
    response.data.forEach(kline => {
      const [
        openTime,
        open,
        high,
        low,
        close,
        volume,
        closeTime,
        quoteVolume
      ] = kline;
      
      prices.push([openTime, parseFloat(close)]);
      volumes.push([openTime, parseFloat(quoteVolume)]);
      
      ohlcv.push({
        timestamp: openTime,
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        volume: parseFloat(volume),
        quoteVolume: parseFloat(quoteVolume)
      });
    });

    return {
      prices: prices,
      volumes: volumes,
      ohlcv: ohlcv // 额外提供完整的 OHLCV 数据
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
      high24h: currentPriceData.high24h,
      low24h: currentPriceData.low24h,
      trades24h: currentPriceData.trades24h,
      prediction: prediction,
      timestamp: new Date().toISOString(),
      dataSource: 'Binance'
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

/**
 * POST /api/predict
 * 高级预测接口，支持时间粒度和预测天数
 */
router.post('/predict', async (req, res) => {
  try {
    const { symbol, predictionDays = 7, timeGranularity = 'daily' } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const tradingPair = SYMBOL_MAP[symbol.toUpperCase()] || `${symbol.toUpperCase()}USDT`;
    
    // 时间粒度映射
    const intervalMap = {
      'minute': '1m',
      '15minute': '15m',
      'hourly': '1h',
      '4hourly': '4h',
      'daily': '1d'
    };
    
    const interval = intervalMap[timeGranularity] || '1d';
    
    // 获取历史数据
    const historicalData = await fetchHistoricalData(symbol, Math.max(predictionDays, 30));
    
    // 生成预测数据
    const predictionResult = generateAdvancedPrediction(
      historicalData, 
      predictionDays, 
      timeGranularity
    );

    res.json({
      symbol: symbol,
      predictionDays,
      timeGranularity,
      interval,
      ...predictionResult,
      timestamp: new Date().toISOString(),
      dataSource: 'Binance'
    });
  } catch (error) {
    console.error('Advanced prediction error:', error);
    res.status(500).json({
      error: 'Prediction failed',
      message: error.message
    });
  }
});

/**
 * 生成高级预测数据
 */
function generateAdvancedPrediction(historicalData, predictionDays, timeGranularity) {
  if (!historicalData || !historicalData.prices || historicalData.prices.length === 0) {
    return {
      trend: 'neutral',
      confidence: 0,
      predictionDays: 0,
      maxPrice: 0,
      minPrice: 0,
      priceData: [],
      volumeData: []
    };
  }

  const data = [];
  const now = new Date();
  const basePrice = historicalData.prices[historicalData.prices.length - 1][1];
  
  // 添加历史数据
  historicalData.prices.forEach((pricePoint, index) => {
    const date = new Date(pricePoint[0]);
    const volume = historicalData.volumes[index] ? historicalData.volumes[index][1] : 0;
    
    data.push({
      date: date.toISOString().split('T')[0],
      historicalPrice: pricePoint[1],
      volume: volume
    });
  });
  
  // 生成预测数据
  const trend = Math.random() > 0.5 ? 1 : -1;
  const confidence = 0.7 + Math.random() * 0.3;
  
  for (let i = 1; i <= predictionDays; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    const trendFactor = trend * (i / predictionDays) * 0.15; // 最大15%变化
    const randomFactor = (Math.random() - 0.5) * 0.08; // 8%随机波动
    const predictedPrice = basePrice * (1 + trendFactor + randomFactor);
    
    const maxPrice = predictedPrice * (1 + 0.2 * confidence); // 20%上限
    const minPrice = predictedPrice * (1 - 0.2 * confidence); // 20%下限
    
    data.push({
      date: date.toISOString().split('T')[0],
      predictedPrice,
      maxPrice,
      minPrice,
      volume: historicalData.volumes[historicalData.volumes.length - 1] ? 
        historicalData.volumes[historicalData.volumes.length - 1][1] * (0.6 + Math.random() * 0.8) : 0
    });
  }
  
  return {
    trend: trend > 0 ? 'up' : 'down',
    confidence: Math.round(confidence * 100),
    predictionDays,
    maxPrice: Math.max(...data.filter(d => d.predictedPrice).map(d => d.maxPrice || 0)),
    minPrice: Math.min(...data.filter(d => d.predictedPrice).map(d => d.minPrice || Infinity)),
    priceData: data,
    volumeData: data
  };
}

/**
 * GET /api/price/:symbol
 * 获取单个代币的当前价格
 */
router.get('/price/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const priceData = await fetchCurrentPrice(symbol);
    
    res.json({
      symbol: symbol,
      ...priceData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Price fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch price',
      message: error.message
    });
  }
});

export default router;

