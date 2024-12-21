'use client';

import { useState, useEffect } from 'react';
import { TonConnectButton, TonConnectUI } from '@tonconnect/ui-react';
import { sendTransaction } from './tonUtils'; // Utility function for TON transactions

export default function AirdropTasks() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isTransactionCompleted, setIsTransactionCompleted] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const dummyTonAddress = 'EQBvNsQHv9sXQ6KQFSLM2fKmnbh0p7Zh65_JSmC38t-x9f8h'; // Replace with actual address later

  // TonConnectUI instance
  const tonConnectUI = new TonConnectUI();

  useEffect(() => {
    tonConnectUI.onStatusChange((status) => {
      if (status === 'connected') {
        setIsWalletConnected(true);
        setWalletAddress(tonConnectUI.wallet?.address || null);
      } else {
        setIsWalletConnected(false);
        setWalletAddress(null);
      }
    });

    return () => {
      tonConnectUI.offStatusChange(); // Clean up the listener
    };
  }, [tonConnectUI]);

  const handleSendTransaction = async () => {
    try {
      if (!walletAddress) return;

      const transaction = {
        to: dummyTonAddress,
        value: 0.2, // TON
        message: 'Airdrop Task Completion',
      };

      await sendTransaction(transaction, tonConnectUI);
      setIsTransactionCompleted(true);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div className="w-full max-w-md bg-opacity-70 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg shadow-lg p-4 text-white">
      <div className="text-2xl font-bold mb-4">Airdrop Tasks 🎁</div>
      <ul className="space-y-4">
        {/* Connect TON Wallet Task */}
        <li
          className={`p-4 rounded-lg bg-opacity-30 bg-white flex items-center justify-between ${
            isWalletConnected ? 'opacity-75' : ''
          }`}
        >
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
        <li
          className={`p-4 rounded-lg bg-opacity-30 bg-white flex items-center justify-between ${
            isTransactionCompleted ? 'opacity-75' : ''
          }`}
        >
          <div>
            <h3 className="font-semibold text-lg">Make a TON Transaction</h3>
            <p className="text-sm text-gray-300">
              Make a TON transaction of 0.2 TON.
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
