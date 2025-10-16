import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ChartIcon,
  BarChart as BarChartIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon,
  Lightning as LightningIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
}

interface PricePoint {
  date: string;
  historicalPrice?: number;
  predictedPrice?: number;
  maxPrice?: number;
  minPrice?: number;
  volume?: number;
}

interface PredictionResult {
  trend: 'up' | 'down';
  confidence: number;
  predictionDays: number;
  maxPrice: number;
  minPrice: number;
  priceData: PricePoint[];
  volumeData: PricePoint[];
}

const CryptoPredictor: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [predictionDays, setPredictionDays] = useState(7);
  const [timeGranularity, setTimeGranularity] = useState('daily');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 模拟加密货币数据
  const cryptoList: CryptoData[] = [
    { symbol: 'BTC', name: 'Bitcoin', price: 112986.27, change24h: -1.40, volume24h: 28500000000 },
    { symbol: 'ETH', name: 'Ethereum', price: 4156.62, change24h: 0.46, volume24h: 18500000000 },
    { symbol: 'BNB', name: 'Binance Coin', price: 645.32, change24h: 2.15, volume24h: 3200000000 },
    { symbol: 'ADA', name: 'Cardano', price: 0.4856, change24h: -0.85, volume24h: 890000000 },
    { symbol: 'SOL', name: 'Solana', price: 198.45, change24h: 3.25, volume24h: 2100000000 },
    { symbol: 'XRP', name: 'Ripple', price: 0.6234, change24h: -2.10, volume24h: 1200000000 },
  ];

  const filteredCrypto = cryptoList.filter(crypto =>
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const timeGranularityOptions = [
    { value: 'minute', label: '每分钟', interval: '1m' },
    { value: '15minute', label: '每15分钟', interval: '15m' },
    { value: 'hourly', label: '每小时', interval: '1h' },
    { value: '4hourly', label: '每4小时', interval: '4h' },
    { value: 'daily', label: '每天', interval: '1d' }
  ];

  const handleCryptoSelect = (crypto: CryptoData) => {
    setSelectedCrypto(crypto);
    setSearchTerm('');
  };

  const handleRefreshPrice = async () => {
    if (!selectedCrypto) return;
    
    setLoading(true);
    try {
      // 模拟从币安获取最新价格
      const response = await fetch(`/api/price/${selectedCrypto.symbol}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedCrypto(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (error) {
      console.error('Failed to refresh price:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrediction = async () => {
    if (!selectedCrypto) return;

    setLoading(true);
    setError(null);
    
    try {
      // 调用后端预测 API
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: selectedCrypto.symbol,
          predictionDays,
          timeGranularity
        }),
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const result = await response.json();
      setPredictionResult(result);
    } catch (error) {
      setError('预测失败，请稍后重试');
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 生成模拟预测数据
  const generateMockData = (crypto: CryptoData, days: number, granularity: string) => {
    const data: PricePoint[] = [];
    const now = new Date();
    const basePrice = crypto.price;
    
    // 生成历史数据（过去30天）
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const volatility = 0.02; // 2% 波动
      const randomChange = (Math.random() - 0.5) * volatility;
      const price = basePrice * (1 + randomChange * (30 - i) / 30);
      
      data.push({
        date: date.toISOString().split('T')[0],
        historicalPrice: price,
        volume: crypto.volume24h * (0.8 + Math.random() * 0.4)
      });
    }
    
    // 生成预测数据
    const trend = Math.random() > 0.5 ? 1 : -1;
    const confidence = 0.7 + Math.random() * 0.3;
    
    for (let i = 1; i <= days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      const trendFactor = trend * (i / days) * 0.1; // 最大10%变化
      const randomFactor = (Math.random() - 0.5) * 0.05; // 5%随机波动
      const predictedPrice = basePrice * (1 + trendFactor + randomFactor);
      
      const maxPrice = predictedPrice * (1 + 0.15 * confidence); // 15%上限
      const minPrice = predictedPrice * (1 - 0.15 * confidence); // 15%下限
      
      data.push({
        date: date.toISOString().split('T')[0],
        predictedPrice,
        maxPrice,
        minPrice,
        volume: crypto.volume24h * (0.6 + Math.random() * 0.8)
      });
    }
    
    return {
      trend: trend > 0 ? 'up' : 'down',
      confidence: Math.round(confidence * 100),
      predictionDays: days,
      maxPrice: Math.max(...data.filter(d => d.predictedPrice).map(d => d.maxPrice || 0)),
      minPrice: Math.min(...data.filter(d => d.predictedPrice).map(d => d.minPrice || Infinity)),
      priceData: data,
      volumeData: data
    };
  };

  const handleMockPrediction = () => {
    if (!selectedCrypto) return;
    
    setLoading(true);
    setTimeout(() => {
      const result = generateMockData(selectedCrypto, predictionDays, timeGranularity);
      setPredictionResult(result);
      setLoading(false);
    }, 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? '#4caf50' : '#f44336';
  };

  const renderPriceChart = () => {
    if (!predictionResult) return null;

    const data = predictionResult.priceData;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <RechartsTooltip 
            formatter={(value: any, name: string) => [formatPrice(value), name]}
            labelFormatter={(label) => new Date(label).toLocaleDateString('zh-CN')}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="historicalPrice" 
            stroke="#2196f3" 
            strokeWidth={2}
            name="历史价格"
            dot={{ fill: '#2196f3', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="predictedPrice" 
            stroke="#f44336" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="预测价格"
            dot={{ fill: '#f44336', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="maxPrice" 
            stroke="#4caf50" 
            strokeWidth={1}
            strokeDasharray="3 3"
            name="价格上限"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="minPrice" 
            stroke="#ff9800" 
            strokeWidth={1}
            strokeDasharray="3 3"
            name="价格下限"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderVolumeChart = () => {
    if (!predictionResult) return null;

    const data = predictionResult.volumeData;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          />
          <RechartsTooltip 
            formatter={(value: any, name: string) => [`${(value / 1000000).toFixed(2)}M`, name]}
            labelFormatter={(label) => new Date(label).toLocaleDateString('zh-CN')}
          />
          <Legend />
          <Bar dataKey="volume" fill="#2196f3" name="交易量" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      {/* 左侧控制面板 */}
      <Paper sx={{ width: 350, p: 3, borderRadius: 0, boxShadow: 2 }}>
        {/* 标题区域 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
            Kronos Crypto Predictor
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
            QuantPredict Pro - AI-Powered Crypto Analysis Tool
          </Typography>
          <Typography variant="body2" sx={{ color: '#888' }}>
            Cryptocurrency Trend Prediction Based on Kronos Large Model
          </Typography>
        </Box>

        {/* 设计师信息 */}
        <Box sx={{ mb: 4, textAlign: 'right' }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Designer: Arthur
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Contact: xu505483585@gmail.com
          </Typography>
        </Box>

        {/* 加密货币搜索 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon color="primary" />
            Cryptocurrency Search
          </Typography>
          
          <TextField
            fullWidth
            placeholder="Enter token symbol or name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Paper sx={{ maxHeight: 200, overflow: 'auto' }}>
            <List dense>
              {filteredCrypto.map((crypto) => (
                <ListItem
                  key={crypto.symbol}
                  button
                  onClick={() => handleCryptoSelect(crypto)}
                  sx={{
                    bgcolor: selectedCrypto?.symbol === crypto.symbol ? '#e3f2fd' : 'transparent',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <ListItemText
                    primary={`${crypto.symbol} ${crypto.name}`}
                    secondary={formatPrice(crypto.price)}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        {/* 选定的代币 */}
        {selectedCrypto && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="success" />
              Selected Token
            </Typography>
            
            <Card sx={{ bgcolor: '#f8f9fa' }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {selectedCrypto.symbol} {selectedCrypto.name}
                </Typography>
                <Typography variant="h4" sx={{ color: '#1976d2', mb: 1 }}>
                  {formatPrice(selectedCrypto.price)}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: getChangeColor(selectedCrypto.change24h),
                    mb: 2 
                  }}
                >
                  {formatChange(selectedCrypto.change24h)}
                </Typography>
                
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefreshPrice}
                  disabled={loading}
                  fullWidth
                >
                  Refresh Price
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* 预测设置 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon color="primary" />
            Prediction Settings
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Prediction Days"
                type="number"
                value={predictionDays}
                onChange={(e) => setPredictionDays(Number(e.target.value))}
                inputProps={{ min: 1, max: 30 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Time Granularity</InputLabel>
                <Select
                  value={timeGranularity}
                  onChange={(e) => setTimeGranularity(e.target.value)}
                  label="Time Granularity"
                >
                  {timeGranularityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<LightningIcon />}
            onClick={handleMockPrediction}
            disabled={!selectedCrypto || loading}
            sx={{ mt: 2, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : '开始预测'}
          </Button>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* 右侧预测结果区域 */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          Prediction Results
        </Typography>

        {/* 结果标签页 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<AssessmentIcon />} label="Summary" />
            <Tab icon={<ChartIcon />} label="Price Chart" />
            <Tab icon={<BarChartIcon />} label="Volume Chart" />
            <Tab icon={<InfoIcon />} label="Details" />
          </Tabs>
        </Box>

        {/* 标签页内容 */}
        {activeTab === 0 && (
          <Box>
            {predictionResult ? (
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        Trend
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        {predictionResult.trend === 'up' ? (
                          <TrendingUpIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                        ) : (
                          <TrendingDownIcon sx={{ fontSize: 40, color: '#f44336' }} />
                        )}
                        <Typography variant="h4" sx={{ 
                          color: predictionResult.trend === 'up' ? '#4caf50' : '#f44336',
                          fontWeight: 'bold'
                        }}>
                          {predictionResult.trend === 'up' ? 'Up' : 'Down'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={4}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        Confidence
                      </Typography>
                      <Typography variant="h3" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                        {predictionResult.confidence}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={4}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        预测天数
                      </Typography>
                      <Typography variant="h3" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                        {predictionResult.predictionDays} 天
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="textSecondary">
                  请选择一个代币并开始预测
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {predictionResult ? (
              <Box>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  {selectedCrypto?.symbol} 价格走势预测
                </Typography>
                {renderPriceChart()}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="textSecondary">
                  请先进行预测以查看价格图表
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            {predictionResult ? (
              <Box>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  {selectedCrypto?.symbol} 交易量分析
                </Typography>
                {renderVolumeChart()}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="textSecondary">
                  请先进行预测以查看交易量图表
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            {predictionResult ? (
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        预测详情
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>预测天数:</Typography>
                        <Typography>{predictionResult.predictionDays} 天</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>时间粒度:</Typography>
                        <Typography>{timeGranularityOptions.find(opt => opt.value === timeGranularity)?.label}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>置信度:</Typography>
                        <Typography>{predictionResult.confidence}%</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>预测趋势:</Typography>
                        <Chip 
                          label={predictionResult.trend === 'up' ? '上涨' : '下跌'} 
                          color={predictionResult.trend === 'up' ? 'success' : 'error'}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        价格范围
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>当前价格:</Typography>
                        <Typography>{selectedCrypto && formatPrice(selectedCrypto.price)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>预测最高价:</Typography>
                        <Typography color="success.main">{formatPrice(predictionResult.maxPrice)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>预测最低价:</Typography>
                        <Typography color="error.main">{formatPrice(predictionResult.minPrice)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>价格波动范围:</Typography>
                        <Typography>
                          {formatPrice(predictionResult.minPrice)} - {formatPrice(predictionResult.maxPrice)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="textSecondary">
                  请先进行预测以查看详细信息
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CryptoPredictor;
