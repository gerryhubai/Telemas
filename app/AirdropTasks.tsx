'use client';

import { useState, useEffect } from 'react';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { sendTransaction } from './tonUtils'; // Ensure this utility is correctly implemented

export default function AirdropTasks() {
  const wallet = useTonWallet();
  const [isTransactionCompleted, setIsTransactionCompleted] = useState(false);

  const dummyTonAddress = 'EQBvNsQHv9sXQ6KQFSLM2fKmnbh0p7Zh65_JSmC38t-x9f8h'; // Replace with actual address later

  const handleSendTransaction = async () => {
    if (!wallet) {
      console.error('Wallet not connected');
      return;
    }

    try {
      const transaction = {
        to: dummyTonAddress,
        value: 0.2, // TON
        message: 'Airdrop Task Completion',
      };

      await sendTransaction(transaction);
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
            wallet ? 'opacity-75' : ''
          }`}
        >
          <div>
            <h3 className="font-semibold text-lg">Connect TON Wallet</h3>
            <p className="text-sm text-gray-300">
              Connect your TON wallet to participate in the airdrop.
            </p>
          </div>
          {wallet ? (
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
              Send 0.2 TON to the specified wallet address.
            </p>
          </div>
          {isTransactionCompleted ? (
            <span className="text-green-500 font-bold">Completed</span>
          ) : (
            <button
              className="py-1 px-4 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded font-bold"
              onClick={handleSendTransaction}
              disabled={!wallet}
            >
              Send
            </button>
          )}
        </li>
      </ul>
    </div>
  );
}
