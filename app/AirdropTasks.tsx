'use client';

import { useState, useEffect } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Gift, Wallet } from 'lucide-react';
import TonWeb from 'tonweb';

export default function AirdropTasks() {
  const [tonConnectUI] = useTonConnectUI();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isTransactionCompleted, setIsTransactionCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const dummyTonAddress = 'UQDPwJ3uKK2GDhbnAOiknXEf5vcmJbAv-3IlkozffErB7kBT';

  useEffect(() => {
    const checkWalletConnection = () => {
      if (tonConnectUI.account?.address) {
        setIsWalletConnected(true);
        setWalletAddress(tonConnectUI.account.address);
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
      } else {
        setIsWalletConnected(false);
        setWalletAddress(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI]);

  const handleSendTransaction = async () => {
    if (!isWalletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const transaction = {
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: [
          {
            address: dummyTonAddress,
            amount: TonWeb.utils.toNano('0.2').toString(),
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);

      if (result.boc) {
        const bocCellBytes = await TonWeb.boc.Cell.oneFromBoc(
          TonWeb.utils.base64ToBytes(result.boc)
        ).hash();
        console.log('Transaction hash:', bocCellBytes);
        setIsTransactionCompleted(true);
      } else {
        throw new Error('Transaction failed to process');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md backdrop-blur-sm bg-white/10 rounded-xl shadow-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Gift className="w-8 h-8 text-red-500" />
        <h1 className="text-2xl font-bold text-white">Holiday Airdrop Tasks</h1>
      </div>

      <div className="space-y-4">
        {/* Connect Wallet Task */}
        <div className={`p-4 rounded-xl backdrop-blur-md 
          ${isWalletConnected 
            ? 'bg-green-500/20 border border-green-500/30' 
            : 'bg-white/20 border border-white/30'
          } transition-all duration-300`}>
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
            {!isWalletConnected && <TonConnectButton />}
          </div>
        </div>

        {/* Transaction Task */}
        <div className={`p-4 rounded-xl backdrop-blur-md 
          ${isTransactionCompleted 
            ? 'bg-green-500/20 border border-green-500/30' 
            : 'bg-white/20 border border-white/30'
          } transition-all duration-300`}>
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
