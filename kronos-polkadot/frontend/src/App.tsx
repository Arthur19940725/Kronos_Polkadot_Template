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
  Snackbar
} from '@mui/material';
import WalletConnect from './components/WalletConnect';
import PredictionPanel from './components/PredictionPanel';
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
            <WalletConnect 
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
                Welcome to Kronos Prediction DApp
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Please connect your Polkadot wallet to start predicting cryptocurrency prices
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Powered by Kronos AI Foundation Model
              </Typography>
            </Box>
          ) : (
            <PredictionPanel 
              account={account} 
              showNotification={showNotification}
            />
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

