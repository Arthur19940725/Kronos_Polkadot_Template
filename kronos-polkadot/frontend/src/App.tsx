import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box,
  Alert,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import { ShowChart, Assignment, List } from '@mui/icons-material';
import MultiWalletConnect from './components/MultiWalletConnect';
import PredictionPanel from './components/PredictionPanel';
import CryptoPredictor from './components/CryptoPredictor';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#E6007A',
    },
    secondary: {
      main: '#00B2FF',
    },
    background: {
      default: '#0f0f0f',
      paper: '#1a1a1a',
    },
  },
});

function App() {
  const [account, setAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showNotification = (
    message: string, 
    severity: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  useEffect(() => {
    document.title = 'Kronos Prediction DApp';
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* 顶部导航栏 */}
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                🔮 Kronos Prediction
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  ml: 2, 
                  px: 1, 
                  py: 0.5, 
                  bgcolor: 'secondary.main', 
                  borderRadius: 1,
                  color: 'black',
                  fontWeight: 600
                }}
              >
                Polkadot Westend
              </Typography>
            </Box>
            <MultiWalletConnect 
              account={account} 
              setAccount={setAccount} 
              showNotification={showNotification}
            />
          </Toolbar>
        </AppBar>

        {/* 主内容区 */}
        <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
          {!account ? (
            <Box 
              sx={{ 
                textAlign: 'center', 
                mt: 10,
                p: 4,
                bgcolor: 'background.paper',
                borderRadius: 2
              }}
            >
              <Typography variant="h4" gutterBottom>
                🔮 Welcome to Kronos Prediction DApp
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                AI-powered cryptocurrency price predictions on Polkadot
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                Powered by Kronos AI Foundation Model
              </Typography>
              
              <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
                <Typography variant="subtitle2" gutterBottom>
                  🚀 Getting Started:
                </Typography>
                <Box component="ol" sx={{ pl: 2, m: 0 }}>
                  <li>Click "Connect Wallet" button above</li>
                  <li>Select your wallet (Polkadot.js, OKX, SubWallet, or Talisman)</li>
                  <li>If you don't have a wallet, we'll guide you to install one</li>
                  <li>Create an account in your wallet if you haven't already</li>
                  <li>Authorize the connection and start predicting!</li>
                </Box>
              </Alert>

              <Alert severity="warning" sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="subtitle2" gutterBottom>
                  📱 Supported Wallets:
                </Typography>
                <Typography variant="body2">
                  • Polkadot.js Extension (Recommended)<br/>
                  • OKX Wallet (Multi-chain)<br/>
                  • SubWallet<br/>
                  • Talisman<br/>
                  <br/>
                  <strong>Note:</strong> MetaMask requires Polkadot Snap. We recommend using OKX Wallet or Polkadot.js for the best experience.
                </Typography>
              </Alert>
            </Box>
          ) : (
            <Box>
              {/* 导航标签页 */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  sx={{ 
                    '& .MuiTab-root': { 
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600
                    }
                  }}
                >
                  <Tab 
                    icon={<ShowChart />} 
                    label="Crypto Prediction" 
                    iconPosition="start"
                    sx={{ 
                      bgcolor: activeTab === 0 ? 'primary.main' : 'transparent',
                      color: activeTab === 0 ? 'white' : 'text.primary',
                      borderRadius: '8px 8px 0 0',
                      mx: 0.5
                    }}
                  />
                  <Tab 
                    icon={<Assignment />} 
                    label="Create Task" 
                    iconPosition="start"
                    sx={{ 
                      bgcolor: activeTab === 1 ? 'primary.main' : 'transparent',
                      color: activeTab === 1 ? 'white' : 'text.primary',
                      borderRadius: '8px 8px 0 0',
                      mx: 0.5
                    }}
                  />
                  <Tab 
                    icon={<List />} 
                    label="Task List" 
                    iconPosition="start"
                    sx={{ 
                      bgcolor: activeTab === 2 ? 'primary.main' : 'transparent',
                      color: activeTab === 2 ? 'white' : 'text.primary',
                      borderRadius: '8px 8px 0 0',
                      mx: 0.5
                    }}
                  />
                </Tabs>
              </Box>

              {/* 标签页内容 */}
              {activeTab === 0 && (
                <CryptoPredictor />
              )}
              
              {activeTab === 1 && (
                <PredictionPanel 
                  account={account} 
                  showNotification={showNotification}
                />
              )}
              
              {activeTab === 2 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h5" gutterBottom>
                    Task List
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Coming soon...
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Container>

        {/* 通知提示 */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;

