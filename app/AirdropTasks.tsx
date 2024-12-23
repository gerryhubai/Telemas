'use client';

import { useState, useEffect } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Gift, Wallet } from 'lucide-react';

// TypeScript declarations for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id?: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
        ready: () => void;
        close: () => void;
        expand: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
        };
      };
    };
  }
}

export default function AirdropTasks() {
  const [tonConnectUI] = useTonConnectUI();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isTransactionCompleted, setIsTransactionCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telegramId, setTelegramId] = useState<string>('');
  const dummyTonAddress = 'UQDPwJ3uKK2GDhbnAOiknXEf5vcmJbAv-3IlkozffErB7kBT';

  // Initialize Telegram WebApp and get user ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        console.log('Initializing Telegram WebApp...');
        console.log('Window.Telegram:', window.Telegram);
        
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
          
          const userId = window.Telegram.WebApp.initDataUnsafe.user?.id;
          console.log('User ID from Telegram:', userId);
          
          if (userId) {
            setTelegramId(userId.toString());
            console.log('Telegram User ID set successfully:', userId);
          } else {
            console.error('No user ID found in Telegram WebApp data');
            setError('Could not retrieve Telegram ID - Please open in Telegram');
          }
        } else {
          console.error('Telegram WebApp is not available');
          setError('This app must be opened in Telegram');
        }
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
        setError('Error accessing Telegram features');
      }
    }
  }, []);

  // Monitor wallet connection
  useEffect(() => {
    const checkWalletConnection = () => {
      if (tonConnectUI.connected && tonConnectUI.account?.address) {
        setIsWalletConnected(true);
        setWalletAddress(tonConnectUI.account.address);
        updateWalletInDatabase(tonConnectUI.account.address);
      } else {
        setIsWalletConnected(false);
        setWalletAddress(null);
      }
    };

    checkWalletConnection();

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        setIsWalletConnected(true);
        setWalletAddress(wallet.account.address);
        updateWalletInDatabase(wallet.account.address);
      } else {
        setIsWalletConnected(false);
        setWalletAddress(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI]);

  // Update wallet in database
  const updateWalletInDatabase = async (address: string) => {
    try {
      if (!telegramId) {
        console.warn('No Telegram ID available for wallet update');
        return;
      }

      console.log('Updating wallet in database:', {
        telegram_id: telegramId,
        wallet_address: address
      });

      const response = await fetch('/api/update-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: telegramId,
          wallet_address: address,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update wallet address');
      }

      const result = await response.json();
      console.log('Wallet updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating wallet:', error);
    }
  };

  // Handle TON transaction
  const handleSendTransaction = async () => {
    if (!tonConnectUI.connected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert 0.2 TON to nanotons (1 TON = 1,000,000,000 nanotons)
      const amountInNanotons = '200000000'; // 0.2 TON

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now
        messages: [
          {
            address: dummyTonAddress,
            amount: amountInNanotons,
          },
        ],
      };

      console.log('Initiating transaction:', transaction);
      const result = await tonConnectUI.sendTransaction(transaction);
      console.log('Transaction result:', result);

      if (result) {
        setIsTransactionCompleted(true);
        
        // Update transaction status in database
        try {
          const response = await fetch('/api/update-transaction-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              telegram_id: telegramId,
              transaction_hash: result.boc,
              status: 'completed'
            }),
          });

          if (!response.ok) {
            console.error('Failed to update transaction status in database');
          }
        } catch (error) {
          console.error('Error updating transaction status:', error);
        }
      } else {
        throw new Error('Transaction failed to process');
      }
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md backdrop-blur-sm bg-white/10 rounded-xl shadow-xl p-6">
      {/* Telegram Status Indicator */}
      {!telegramId && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-200 text-sm">
            Please open this app in Telegram to access all features
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Gift className="w-8 h-8 text-red-500" />
        <h1 className="text-2xl font-bold text-white">Holiday Airdrop Tasks</h1>
      </div>

      <div className="space-y-4">
        {/* Connect Wallet Task */}
        <div
          className={`p-4 rounded-xl backdrop-blur-md 
          ${isWalletConnected 
            ? 'bg-green-500/20 border border-green-500/30' 
            : 'bg-white/20 border border-white/30'
          } transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-white" />
              <h3 className="font-semibold text-lg text-white">Connect TON Wallet</h3>
            </div>
            {isWalletConnected && (
              <span className="text-green-400 text-sm font-medium px-2 py-1 rounded-full bg-green-500/20">
                Connected ✓
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-200">
              Connect your wallet to participate in the holiday airdrop
            </p>
            <TonConnectButton />
          </div>
        </div>

        {/* Transaction Task */}
        <div
          className={`p-4 rounded-xl backdrop-blur-md 
          ${isTransactionCompleted 
            ? 'bg-green-500/20 border border-green-500/30' 
            : 'bg-white/20 border border-white/30'
          } transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-white" />
              <h3 className="font-semibold text-lg text-white">Make a TON transaction of 0.2 TON</h3>
            </div>
            {isTransactionCompleted && (
              <span className="text-green-400 text-sm font-medium px-2 py-1 rounded-full bg-green-500/20">
                Completed ✓
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-200 mb-2">
                Send 0.2 TON to participate in the holiday airdrop
              </p>
              {error && (
                <p className="text-red-400 text-sm mt-1">{error}</p>
              )}
            </div>
            {!isTransactionCompleted && (
              <button
                onClick={handleSendTransaction}
                disabled={!isWalletConnected || isLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300
                  ${isLoading 
                    ? 'bg-gray-500/50 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600'
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Sending...' : 'Send 0.2 TON'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
