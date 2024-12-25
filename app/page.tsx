'use client';

import React, { useEffect, useState } from 'react';
import { useTonConnect } from '@/hooks/useTonConnect';
import { LoaderCircle, Gift } from 'lucide-react';

export default function SnapshotPage() {
  const { connected, wallet, connect } = useTonConnect();
  const [isLoading, setIsLoading] = useState(false);
  const [allocation, setAllocation] = useState<number | null>(null);
  const [telegramId, setTelegramId] = useState('');

  useEffect(() => {
    const initWebApp = async () => {
      if (typeof window !== 'undefined') {
        const WebApp = (await import('@twa-dev/sdk')).default;
        const user = WebApp.initDataUnsafe.user;
        if (user) {
          setTelegramId(user.id.toString());
        }
      }
    };

    initWebApp();
  }, []);

  useEffect(() => {
    const updateWalletAddress = async () => {
      if (connected && wallet && telegramId) {
        try {
          await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegram_id: telegramId,
              wallet_address: wallet
            })
          });
        } catch (error) {
          console.error('Error updating wallet address:', error);
        }
      }
    };

    updateWalletAddress();
  }, [connected, wallet, telegramId]);

  const calculateAllocation = async () => {
    if (!telegramId) return;

    setIsLoading(true);
    
    try {
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 7000));

      // Get user info from database
      const response = await fetch(`/api/user?telegram_id=${telegramId}`);
      const data = await response.json();
      
      if (!data.success) {
        setAllocation(0);
        return;
      }

      const userInfo = data.userInfo;
      const createdAt = new Date(userInfo.created_at);
      const coins = parseInt(localStorage.getItem('coins') || '0');
      
      // Calculate base allocation based on creation date
      let divisor = 100; // Default for November 15th - December
      
      if (createdAt < new Date('2024-11-15')) {
        divisor = 5000;
      } else if (createdAt > new Date('2024-12-01')) {
        divisor = 10;
      }

      let baseAllocation = coins / divisor;

      // Add bonus from collected cards
      try {
        const collectedCards = JSON.parse(localStorage.getItem('collectedCards') || '{}');
        const cardCount = Object.keys(collectedCards).length;
        baseAllocation += cardCount * 5;
      } catch (e) {
        console.error('Error parsing collected cards:', e);
      }

      // Update allocation in database
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: telegramId,
          airdropped_value: baseAllocation
        })
      });

      setAllocation(baseAllocation);
    } catch (error) {
      console.error('Error calculating allocation:', error);
      setAllocation(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 to-green-900 flex flex-col items-center justify-start p-4">
      {/* Snowfall effect */}
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
        {/* Connect Wallet Section */}
        <div className="text-center mb-8 mt-12">
          <h1 className="text-3xl font-bold text-white mb-4">
            🎄 Christmas Airdrop Snapshot 🎄
          </h1>
          <p className="text-yellow-300 mb-6">
            Connect wallet again to see your allocation
          </p>
          {!connected ? (
            <button
              onClick={connect}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="bg-green-800 rounded-lg p-4 break-all">
              <p className="text-green-300 text-sm">Connected:</p>
              <p className="text-white text-xs">{wallet}</p>
            </div>
          )}
        </div>

        {/* Allocation Display */}
        {connected && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            {isLoading ? (
              <div className="flex flex-col items-center space-y-4">
                <LoaderCircle className="animate-spin text-yellow-400 w-12 h-12" />
                <p className="text-white">Calculating your airdrop allocation...</p>
              </div>
            ) : allocation === null ? (
              <button
                onClick={calculateAllocation}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center space-x-2"
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
                  {allocation.toLocaleString()} $SANTA
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
