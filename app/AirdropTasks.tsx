'use client';

import { useState, useEffect } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import TonWeb from 'tonweb';

export default function AirdropTasks() {
  const [tonConnectUI] = useTonConnectUI();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isTransactionCompleted, setIsTransactionCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dummyTonAddress = 'EQBvNsQHv9sXQ6KQFSLM2fKmnbh0p7Zh65_JSmC38t-x9f8h';

  // Handle wallet connection status
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

  // Handle sending a transaction
  const handleSendTransaction = async () => {
    if (!isWalletConnected) {
      console.error('Wallet not connected');
      return;
    }

    try {
      const transaction = {
        validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes expiration
        messages: [
          {
            address: dummyTonAddress,
            amount: (0.2 * 1e9).toString(), // 0.2 TON in nanoTON
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);

      if (result.boc) {
        // Verify transaction
        const bocCellBytes = await TonWeb.boc.Cell.oneFromBoc(
          TonWeb.utils.base64ToBytes(result.boc)
        ).hash();

        console.log('Transaction hash:', bocCellBytes);
        setIsTransactionCompleted(true);
      } else {
        throw new Error('Transaction did not return a valid BOC.');
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      setError(error instanceof Error ? error.message : 'Transaction failed');
    }
  };

  return (
    <div className="w-full max-w-md bg-opacity-70 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg shadow-lg p-4 text-white">
      <div className="text-2xl font-bold mb-4">Airdrop Tasks 🎁</div>
      <ul className="space-y-4">
        {/* Connect TON Wallet Task */}
        <li className={`p-4 rounded-lg bg-opacity-30 bg-white flex items-center justify-between ${
          isWalletConnected ? 'opacity-75' : ''
        }`}>
          <div>
            <h3 className="font-semibold text-lg">Connect TON Wallet</h3>
            <p className="text-sm text-gray-300">
              Connect your TON wallet to participate in the airdrop.
            </p>
          </div>
          {isWalletConnected ? (
            <span className="text-green-500 font-bold">Completed</span>
          ) : (
            <TonConnectButton />
          )}
        </li>

        {/* Make a TON Transaction Task */}
        <li className={`p-4 rounded-lg bg-opacity-30 bg-white flex items-center justify-between ${
          isTransactionCompleted ? 'opacity-75' : ''
        }`}>
          <div>
            <h3 className="font-semibold text-lg">Make a TON Transaction</h3>
            <p className="text-sm text-gray-300">
              Send 0.2 TON to the specified wallet address.
            </p>
          </div>
          {isTransactionCompleted ? (
            <span className="text-green-500 font-bold">Completed</span>
          ) : (
            <button
              className="py-1 px-4 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded font-bold"
              onClick={handleSendTransaction}
              disabled={!isWalletConnected}
            >
              Send
            </button>
          )}
        </li>
      </ul>
    </div>
  );
}
