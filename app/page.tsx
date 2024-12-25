'use client';

import React, { useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import WebApp from '@twa-dev/sdk';
import { LoaderCircle, Gift } from 'lucide-react';

interface UserData {
  id: number;
  username?: string;
}

export default function SnapshotPage() {
  const [tonConnectUI] = useTonConnectUI();
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allocation, setAllocation] = useState<number | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize user data only
  useEffect(() => {
    try {
      const user = WebApp.initDataUnsafe.user as UserData | undefined;
      if (user?.id) {
        setUserData(user);
        console.log('User data loaded:', user.id);
      }
    } catch (error) {
      console.error('WebApp initialization error:', error);
    }
  }, []);

  // Update wallet address state when connection changes
  useEffect(() => {
    const walletAddress = tonConnectUI.account?.address || null;
    setTonWalletAddress(walletAddress);
  }, [tonConnectUI.account]);

  // Function to update wallet in database - will only be called when we have valid data
  const updateWalletInDatabase = async (address: string) => {
    if (!userData?.id) {
      console.log('No user data available yet');
      return;
    }

    try {
      console.log('Updating wallet in database:', address);
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: userData.id.toString(),
          wallet_address: address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update wallet');
      }

      const result = await response.json();
      console.log('Wallet update successful:', result);
    } catch (err) {
      console.error('Wallet update failed:', err);
      setError('Failed to update wallet');
    }
  };

  const handleWalletAction = async () => {
    if (tonConnectUI.connected) {
      setIsLoading(true);
      await tonConnectUI.disconnect();
      setIsLoading(false);
    } else {
      await tonConnectUI.openModal();
    }
  };

  const formatAddress = (address: string) => {
    try {
      const tempAddress = Address.parse(address).toString();
      
      // After successful format, update the database
      updateWalletInDatabase(address);
      
      return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
    } catch (error) {
      console.error('Error formatting address:', error);
      return '';
    }
  };

  const calculateAllocation = async () => {
    if (!userData?.id) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/user?telegram_id=${userData.id}`);
      const data = await response.json();
      
      if (!data.success) {
        setAllocation(0);
        return;
      }

      const userInfo = data.userInfo;
      const createdAt = new Date(userInfo.created_at);
      const coins = parseInt(localStorage.getItem('coins') || '0');
      
      // Base allocation calculation
      let baseAllocation: number;
      const now = new Date();
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceCreation > 30) {
        baseAllocation = Math.min(25000 + (coins * 0.1), 50000);
      } else if (daysSinceCreation > 14) {
        baseAllocation = Math.min(15000 + (coins * 0.08), 30000);
      } else {
        baseAllocation = Math.min(10000 + (coins * 0.05), 20000);
      }

      // Add bonus for upgraded cards (3 tokens per card)
      try {
        const collectedCards = JSON.parse(localStorage.getItem('collectedCards') || '{}');
        const cardCount = Object.keys(collectedCards).length;
        baseAllocation += cardCount * 3;  // 3 tokens per card
      } catch (e) {
        console.error('Error parsing collected cards:', e);
      }

      const finalAllocation = Math.min(baseAllocation, 100000);

      // Update allocation in database
      const updateResponse = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: userData.id.toString(),
          airdropped_value: finalAllocation
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update allocation');
      }

      setAllocation(finalAllocation);
    } catch (error) {
      console.error('Error calculating allocation:', error);
      setAllocation(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 to-green-900 flex flex-col items-center justify-start p-4">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-snow text-white opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-20px`,
              animation: `fall ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${-Math.random() * 5}s`
            }}
          >
            ❄
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 mt-12">
          <h1 className="text-3xl font-bold text-white mb-4">
            🎄 Christmas Airdrop Snapshot 🎄
          </h1>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            {tonWalletAddress ? (
              <div className="text-center">
                <p className="text-lg mb-4 text-white">
                  Connected: {formatAddress(tonWalletAddress)}
                </p>
                <button
                  onClick={handleWalletAction}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                  disabled={isLoading}
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <button
                onClick={handleWalletAction}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                disabled={isLoading}
              >
                Connect TON Wallet
              </button>
            )}
          </div>
        </div>

        {tonWalletAddress && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center mt-4">
            {isLoading ? (
              <div className="flex flex-col items-center space-y-4">
                <LoaderCircle className="animate-spin text-yellow-400 w-12 h-12" />
                <p className="text-white">Calculating your airdrop allocation...</p>
              </div>
            ) : allocation === null ? (
              <button
                onClick={calculateAllocation}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Gift className="w-6 h-6" />
                <span>View Your Allocation</span>
              </button>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-yellow-400">
                  Your Airdrop Allocation
                </h2>
                <div className="text-4xl font-bold text-white">
                  {allocation.toLocaleString()} $TGOLD
                </div>
                <p className="text-green-400 text-sm">
                  Successfully calculated and stored! 🎉
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
