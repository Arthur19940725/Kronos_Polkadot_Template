import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  Chip,
  Alert,
  Link,
  Divider,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Logout,
  CheckCircle,
  Info,
} from '@mui/icons-material';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

interface MultiWalletConnectProps {
  account: InjectedAccountWithMeta | null;
  setAccount: (account: InjectedAccountWithMeta | null) => void;
  showNotification: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

// 钱包类型定义
interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  downloadUrl: string;
  detectFunction: () => Promise<boolean>;
}

const MultiWalletConnect = ({ account, setAccount, showNotification }: MultiWalletConnectProps) => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [noAccountDialog, setNoAccountDialog] = useState(false);
  const open = Boolean(anchorEl);

  const APP_NAME = 'Kronos Prediction DApp';

  // 支持的钱包列表
  const walletOptions: WalletOption[] = [
    {
      id: 'polkadot-js',
      name: 'Polkadot{.js}',
      icon: '🔴',
      description: 'Official Polkadot extension (Recommended)',
      downloadUrl: 'https://polkadot.js.org/extension/',
      detectFunction: async () => {
        try {
          const extensions = await web3Enable(APP_NAME);
          return extensions.some(ext => ext.name === 'polkadot-js');
        } catch {
          return false;
        }
      }
    },
    {
      id: 'okx',
      name: 'OKX Wallet',
      icon: '🟠',
      description: 'Multi-chain wallet with Polkadot support',
      downloadUrl: 'https://www.okx.com/web3',
      detectFunction: async () => {
        try {
          // OKX Wallet 也会注入 Polkadot 扩展
          const extensions = await web3Enable(APP_NAME);
          return extensions.some(ext => 
            ext.name?.toLowerCase().includes('okx') || 
            ext.name?.toLowerCase().includes('okexchain')
          );
        } catch {
          return false;
        }
      }
    },
    {
      id: 'subwallet',
      name: 'SubWallet',
      icon: '🟣',
      description: 'All-in-one Polkadot wallet',
      downloadUrl: 'https://subwallet.app/',
      detectFunction: async () => {
        try {
          const extensions = await web3Enable(APP_NAME);
          return extensions.some(ext => ext.name?.toLowerCase().includes('subwallet'));
        } catch {
          return false;
        }
      }
    },
    {
      id: 'talisman',
      name: 'Talisman',
      icon: '🌟',
      description: 'Better Web3 wallet for Polkadot & Ethereum',
      downloadUrl: 'https://talisman.xyz/',
      detectFunction: async () => {
        try {
          const extensions = await web3Enable(APP_NAME);
          return extensions.some(ext => ext.name?.toLowerCase().includes('talisman'));
        } catch {
          return false;
        }
      }
    },
  ];

  useEffect(() => {
    // 尝试从 localStorage 恢复连接
    const savedAccount = localStorage.getItem('selectedAccount');
    if (savedAccount) {
      restoreConnection(savedAccount);
    }
  }, []);

  const restoreConnection = async (address: string) => {
    try {
      const extensions = await web3Enable(APP_NAME);
      if (extensions.length === 0) return;

      const allAccounts = await web3Accounts();
      const savedAcc = allAccounts.find(acc => acc.address === address);
      if (savedAcc) {
        setAccount(savedAcc);
      }
    } catch (error) {
      console.error('Failed to restore connection:', error);
    }
  };

  const connectWallet = async (walletId?: string) => {
    setLoading(true);
    setWalletDialogOpen(false);
    
    try {
      // 启用所有可用的 Polkadot 扩展
      const extensions = await web3Enable(APP_NAME);
      
      if (extensions.length === 0) {
        showNotification(
          'No wallet extension found. Please install a wallet.',
          'error'
        );
        setWalletDialogOpen(true);
        setLoading(false);
        return;
      }

      console.log('Available extensions:', extensions.map(e => e.name));

      // 获取所有账户
      const allAccounts = await web3Accounts();
      
      if (allAccounts.length === 0) {
        showNotification(
          'No accounts found. Please create an account first.',
          'warning'
        );
        setNoAccountDialog(true);
        setLoading(false);
        return;
      }

      setAccounts(allAccounts);
      
      // 如果只有一个账户，直接选择
      if (allAccounts.length === 1) {
        selectAccount(allAccounts[0]);
      } else {
        // 打开账户选择菜单
        setAnchorEl(document.getElementById('wallet-button'));
      }

      showNotification(
        `Found ${allAccounts.length} account(s) from ${extensions.length} wallet(s)`,
        'success'
      );
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      showNotification(
        'Failed to connect wallet: ' + (error as Error).message,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const selectAccount = (selectedAccount: InjectedAccountWithMeta) => {
    setAccount(selectedAccount);
    localStorage.setItem('selectedAccount', selectedAccount.address);
    setAnchorEl(null);
    showNotification(
      `Connected: ${selectedAccount.meta.name || 'Account'}`,
      'success'
    );
  };

  const disconnectWallet = () => {
    setAccount(null);
    localStorage.removeItem('selectedAccount');
    setAnchorEl(null);
    showNotification('Wallet disconnected', 'info');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleWalletSelect = async (wallet: WalletOption) => {
    const isInstalled = await wallet.detectFunction();
    
    if (!isInstalled) {
      showNotification(
        `${wallet.name} is not installed`,
        'warning'
      );
      window.open(wallet.downloadUrl, '_blank');
      return;
    }

    connectWallet(wallet.id);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={24} />
        <Typography variant="body2">Connecting...</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Connect Button */}
      {!account && (
        <Button
          id="wallet-button"
          variant="contained"
          color="primary"
          startIcon={<AccountBalanceWallet />}
          onClick={() => setWalletDialogOpen(true)}
        >
          Connect Wallet
        </Button>
      )}

      {/* Connected Account Chip */}
      {account && (
        <Chip
          id="wallet-button"
          icon={<CheckCircle />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {account.meta.name || 'Account'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatAddress(account.address)}
              </Typography>
            </Box>
          }
          onClick={handleMenuOpen}
          sx={{ 
            px: 1, 
            py: 3,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(230, 0, 122, 0.1)',
            }
          }}
        />
      )}

      {/* Wallet Selection Dialog */}
      <Dialog 
        open={walletDialogOpen} 
        onClose={() => setWalletDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalanceWallet />
            <Typography variant="h6">Select Wallet</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Choose your preferred wallet to connect to Kronos DApp
          </Alert>
          
          <List>
            {walletOptions.map((wallet) => (
              <ListItem key={wallet.id} disablePadding>
                <ListItemButton 
                  onClick={() => handleWalletSelect(wallet)}
                  sx={{ 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(230, 0, 122, 0.05)',
                    }
                  }}
                >
                  <ListItemIcon>
                    <Typography fontSize="2rem">{wallet.icon}</Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={600}>
                        {wallet.name}
                      </Typography>
                    }
                    secondary={wallet.description}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Alert severity="warning" icon={<Info />}>
            <Typography variant="body2">
              Don't have a wallet?{' '}
              <Link 
                href="/wallet-setup-guide.html" 
                target="_blank" 
                underline="hover"
              >
                View setup guide
              </Link>
            </Typography>
          </Alert>
        </DialogContent>
      </Dialog>

      {/* No Account Dialog */}
      <Dialog
        open={noAccountDialog}
        onClose={() => setNoAccountDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>No Accounts Found</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You haven't created any accounts yet in your wallet extension.
          </Alert>

          <Typography variant="body1" gutterBottom>
            To use Kronos DApp, you need to:
          </Typography>

          <Box component="ol" sx={{ pl: 2 }}>
            <li>
              <Typography variant="body2">
                Open your wallet extension (e.g., Polkadot.js, OKX Wallet)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Click "+ Create Account" or similar button
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Follow the instructions to create a new account
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Important:</strong> Save your recovery phrase securely!
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Come back and click "Connect Wallet" again
              </Typography>
            </li>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Need help?{' '}
              <Link 
                href="https://wiki.polkadot.network/docs/learn-account-generation"
                target="_blank"
                underline="hover"
              >
                Read the complete guide
              </Link>
            </Typography>
          </Alert>

          <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setNoAccountDialog(false);
                window.open('https://polkadot.js.org/extension/', '_blank');
              }}
            >
              Install Polkadot.js
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setNoAccountDialog(false)}
            >
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Account Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {accounts.length > 1 && (
          <>
            <MenuItem disabled>
              <Typography variant="caption" color="text.secondary">
                Switch Account
              </Typography>
            </MenuItem>
            {accounts.map((acc) => (
              <MenuItem
                key={acc.address}
                onClick={() => selectAccount(acc)}
                selected={acc.address === account?.address}
              >
                <ListItemIcon>
                  {acc.address === account?.address && <CheckCircle fontSize="small" color="primary" />}
                </ListItemIcon>
                <ListItemText
                  primary={acc.meta.name || 'Account'}
                  secondary={formatAddress(acc.address)}
                />
              </MenuItem>
            ))}
            <MenuItem divider />
          </>
        )}
        <MenuItem onClick={disconnectWallet}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Disconnect</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default MultiWalletConnect;

