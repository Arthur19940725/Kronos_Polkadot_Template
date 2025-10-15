import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Divider,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  Send,
  Refresh,
} from '@mui/icons-material';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPrediction, submitPredictionToChain } from '../api/backend';

interface PredictionPanelProps {
  account: InjectedAccountWithMeta;
  showNotification: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

const SUPPORTED_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'DOT', name: 'Polkadot' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'ADA', name: 'Cardano' },
];

const PredictionPanel = ({ account, showNotification }: PredictionPanelProps) => {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [predictionData, setPredictionData] = useState<any>(null);
  const [userPrediction, setUserPrediction] = useState('');

  useEffect(() => {
    loadPrediction();
  }, [selectedAsset]);

  const loadPrediction = async () => {
    setLoading(true);
    try {
      const data = await getPrediction(selectedAsset);
      setPredictionData(data);
    } catch (error) {
      console.error('Failed to load prediction:', error);
      showNotification('Failed to load prediction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPrediction = async () => {
    if (!userPrediction || parseFloat(userPrediction) <= 0) {
      showNotification('Please enter a valid prediction value', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitPredictionToChain(
        account,
        selectedAsset,
        parseFloat(userPrediction)
      );

      if (result.success) {
        showNotification(
          `Prediction submitted successfully! Block: ${result.blockHash}`,
          'success'
        );
        setUserPrediction('');
      } else {
        showNotification(`Failed to submit: ${result.error}`, 'error');
      }
    } catch (error: any) {
      console.error('Failed to submit prediction:', error);
      showNotification(error.message || 'Failed to submit prediction', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const prepareChartData = () => {
    if (!predictionData?.prediction?.predictions) return [];
    
    return predictionData.prediction.predictions.map((pred: any) => ({
      hour: `${pred.hour}h`,
      price: pred.price,
      timestamp: pred.timestamp,
    }));
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading prediction data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* 资产选择器 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Select Asset</InputLabel>
              <Select
                value={selectedAsset}
                label="Select Asset"
                onChange={(e) => setSelectedAsset(e.target.value)}
              >
                {SUPPORTED_ASSETS.map((asset) => (
                  <MenuItem key={asset.symbol} value={asset.symbol}>
                    {asset.symbol} - {asset.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadPrediction}
              disabled={loading}
            >
              Refresh Data
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Chip
              icon={predictionData?.prediction?.trend === 'bullish' ? <TrendingUp /> : <TrendingDown />}
              label={`Trend: ${predictionData?.prediction?.trend || 'N/A'}`}
              color={predictionData?.prediction?.trend === 'bullish' ? 'success' : 'error'}
              sx={{ width: '100%', py: 2 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 当前价格和预测 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Current Price
              </Typography>
              <Typography variant="h4" component="div">
                {predictionData ? formatPrice(predictionData.currentPrice) : '-'}
              </Typography>
              <Chip
                label={predictionData ? formatChange(predictionData.change24h) : '0%'}
                size="small"
                color={predictionData?.change24h >= 0 ? 'success' : 'error'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                AI Prediction (24h)
              </Typography>
              <Typography variant="h4" component="div">
                {predictionData?.prediction ? formatPrice(predictionData.prediction.price_24h) : '-'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="caption">Confidence:</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(predictionData?.prediction?.confidence || 0) * 100}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                />
                <Typography variant="caption">
                  {((predictionData?.prediction?.confidence || 0) * 100).toFixed(0)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Market Cap
              </Typography>
              <Typography variant="h4" component="div">
                {predictionData 
                  ? `$${(predictionData.marketCap / 1e9).toFixed(2)}B`
                  : '-'
                }
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                24h Volume: ${predictionData ? (predictionData.volume24h / 1e9).toFixed(2) : '0'}B
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 预测图表 */}
      {predictionData?.prediction?.predictions && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <ShowChart sx={{ mr: 1, verticalAlign: 'middle' }} />
            24-Hour Price Prediction
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => formatPrice(value)}
                labelFormatter={(label) => `Hour: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#E6007A" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <Alert severity="info" sx={{ mt: 2 }}>
            Model: {predictionData.prediction.model || 'Kronos'} | 
            Predicted change: {((predictionData.prediction.price_24h / predictionData.currentPrice - 1) * 100).toFixed(2)}%
          </Alert>
        </Paper>
      )}

      {/* 提交预测 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Submit Your Prediction
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label={`Your prediction for ${selectedAsset} in 24h (USD)`}
              type="number"
              value={userPrediction}
              onChange={(e) => setUserPrediction(e.target.value)}
              disabled={submitting}
              placeholder={predictionData ? `AI suggests: ${predictionData.prediction?.price_24h?.toFixed(2)}` : ''}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
              onClick={handleSubmitPrediction}
              disabled={submitting || !userPrediction}
              sx={{ height: '56px' }}
            >
              {submitting ? 'Submitting...' : 'Submit to Chain'}
            </Button>
          </Grid>
        </Grid>

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Your prediction will be submitted to the Polkadot Westend testnet. 
            Rewards will be distributed based on prediction accuracy after 24 hours.
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
};

export default PredictionPanel;

