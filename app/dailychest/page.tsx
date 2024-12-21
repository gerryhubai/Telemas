'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAdsgram, ShowPromiseResult } from '../../hooks/useAdsgram';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { ShoppingCart, Crown, Wallet } from 'lucide-react';

interface StarBurstProps {
  isVisible: boolean;
}

// Original StarBurst component remains unchanged
const StarBurst: React.FC<StarBurstProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute text-4xl animate-burst"
          style={{
            left: '50%',
            top: '50%',
            animation: `burst 1s ease-out forwards ${Math.random() * 0.5}s`,
            transform: `rotate(${i * 18}deg) translateY(-100px)`,
          }}
        >
          ⭐
        </div>
      ))}
    </div>
  );
};

// Original gift cards
const giftCards = [
  { id: 1, name: "Santa's Magic", description: "May Santa bring joy and light with a tree full of Christmas magic!", price: 1 },
  { id: 2, name: "Snowflake Joy", description: "Unwrap the holiday cheer as snowflakes and presents brighten your heart!", price: 1 },
  { id: 3, name: "Santa's Bounty", description: "Let Santa fill your world with gifts, warmth, and endless joy this season!", price: 1 },
  { id: 4, name: "Frosty's Cheer", description: "Embrace the holiday spirit with a snowman, bringing frosty fun and smiles!", price: 1 },
  { id: 5, name: "Stocking Wonder", description: "Stockings full of love and festive surprises await to make your Christmas bright!", price: 1 },
  { id: 6, name: "Jingle Delight", description: "Ring the bells of joy and unwrap the wonders of Christmas with festive delight!", price: 1 }
];

// New premium cards
const premiumCards = [
  { id: 'p1', name: "Royal Christmas", description: "A majestic celebration fit for royalty!", priceInTon: 0.02, image: '/giftcards/premium1.jpg' },
  { id: 'p2', name: "Celestial Wonder", description: "Ethereal beauty of the winter night sky!", priceInTon: 0.05, image: '/giftcards/premium2.jpg' },
  { id: 'p3', name: "Golden Splendor", description: "The most luxurious holiday experience!", priceInTon: 0.1, image: '/giftcards/premium3.jpg' },
];

// Modify the GiftCardModal to include premium tab
const GiftCardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  collectedCards: Record<string, number>;
  onBuy: (cardId: number) => void;
  onBuyPremium: (cardId: string) => void;
  premiumCards: typeof premiumCards;
  isWalletConnected: boolean;
}> = ({
  isOpen,
  onClose,
  collectedCards,
  onBuy,
  onBuyPremium,
  premiumCards,
  isWalletConnected
}) => {
  const [activeTab, setActiveTab] = useState<'regular' | 'premium'>('regular');

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg p-4 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-red-700">Your Festive Collection</h2>
        
        {/* Tabs */}
        <div className="flex mb-4 border-b">
          <button
            onClick={() => setActiveTab('regular')}
            className={`flex-1 py-2 px-4 ${
              activeTab === 'regular'
                ? 'border-b-2 border-red-700 text-red-700'
                : 'text-gray-500'
            }`}
          >
            Regular Cards
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 ${
              activeTab === 'premium'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-500'
            }`}
          >
            <Crown size={16} />
            Premium Cards
          </button>
        </div>

        {activeTab === 'regular' ? (
          // Regular cards grid
          <div className="grid grid-cols-3 gap-2">
            {giftCards.map((card) => (
              <div key={card.id} className="flex flex-col items-center bg-green-100 p-2 rounded-lg">
                <Image
                  src={`/giftcards/${card.id}.jpg`}
                  alt={card.name}
                  width={60}
                  height={60}
                  className="rounded-lg shadow-md"
                />
                <p className="mt-1 text-xs font-semibold text-green-800 text-center">{card.name}</p>
                <p className="text-lg font-bold text-red-600">{collectedCards[card.id] || 0}</p>
                <button
                  onClick={() => onBuy(card.id)}
                  className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition duration-300"
                >
                  Buy ({card.price} Ad{card.price > 1 ? 's' : ''})
                </button>
              </div>
            ))}
          </div>
        ) : (
          // Premium cards grid
          <div className="space-y-4">
            {!isWalletConnected && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg mb-4">
                <p className="text-sm text-yellow-700 mb-2">Connect your TON wallet to buy premium cards</p>
                <TonConnectButton />
              </div>
            )}
            {premiumCards.map((card) => (
              <div key={card.id} className="flex items-center bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                <Image
                  src={card.image}
                  alt={card.name}
                  width={80}
                  height={80}
                  className="rounded-lg shadow-md"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-yellow-800">{card.name}</h3>
                    <Crown size={16} className="text-yellow-600" />
                  </div>
                  <p className="text-sm text-gray-600">{card.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-gray-700">
                      Owned: {collectedCards[card.id] || 0}
                    </span>
                    <button
                      onClick={() => onBuyPremium(card.id)}
                      disabled={!isWalletConnected}
                      className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Buy {card.priceInTon} TON
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-300"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

const DailyChest: React.FC = () => {
  // Existing states
  const [coins, setCoins] = useState<number>(0);
  const [chestOpened, setChestOpened] = useState<boolean>(false);
  const [showStars, setShowStars] = useState<boolean>(false);
  const [newCoins, setNewCoins] = useState<number>(0);
  const [openCount, setOpenCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [giftCard, setGiftCard] = useState<{ id: number, name: string, description: string } | null>(null);
  const [collectedCards, setCollectedCards] = useState<Record<string, number>>({});
  const [isGiftCardModalOpen, setIsGiftCardModalOpen] = useState<boolean>(false);
  const [upgradesRemaining, setUpgradesRemaining] = useState<number>(35);
  const [lastResetDate, setLastResetDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // TON Connect integration
  const [tonConnectUI] = useTonConnectUI();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const dummyTonAddress = 'UQDPwJ3uKK2GDhbnAOiknXEf5vcmJbAv-3IlkozffErB7kBT';

  // Check wallet connection
  useEffect(() => {
    const checkWalletConnection = () => {
      if (tonConnectUI.connected && tonConnectUI.account?.address) {
        setIsWalletConnected(true);
      } else {
        setIsWalletConnected(false);
      }
    };

    checkWalletConnection();

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      setIsWalletConnected(!!wallet);
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI]);

  const showAd = useAdsgram({ blockId: '3072', onReward: () => {}, onError: () => {} });

  // Load saved data
  useEffect(() => {
    const storedCoins = localStorage.getItem('coins');
    const storedOpenCount = localStorage.getItem('openCount');
    const storedCards = localStorage.getItem('collectedCards');
    if (storedCoins) setCoins(parseInt(storedCoins));
    if (storedOpenCount) setOpenCount(parseInt(storedOpenCount));
    if (storedCards) setCollectedCards(JSON.parse(storedCards));

    const storedUpgradesRemaining = localStorage.getItem('upgradesRemaining');
    const storedLastResetDate = localStorage.getItem('lastResetDate');
    
    if (storedUpgradesRemaining) setUpgradesRemaining(parseInt(storedUpgradesRemaining));
    if (storedLastResetDate) setLastResetDate(storedLastResetDate);

    const currentDate = new Date().toDateString();
    if (currentDate !== storedLastResetDate) {
      setUpgradesRemaining(15);
      setOpenCount(0);
      setLastResetDate(currentDate);
      localStorage.setItem('upgradesRemaining', '15');
      localStorage.setItem('openCount', '0');
      localStorage.setItem('lastResetDate', currentDate);
    }
  }, []);

  const playAudio = (filename: string) => {
    const audio = new Audio(filename);
    audio.play().catch(error => console.error('Audio playback failed', error));
  };

  const handleOpenChest = () => {
    if (openCount >= 10) return;

    setIsLoading(true);
    playAudio('/openingsound.mp3');

    setTimeout(() => {
      const isGiftCard = Math.random() < 0.3;
      const updatedOpenCount = openCount + 1;

      if (isGiftCard) {
        const randomGiftCard = giftCards[Math.floor(Math.random() * giftCards.length)];
        setGiftCard(randomGiftCard);
        setNewCoins(0);
        const updatedCollectedCards = {
          ...collectedCards,
          [randomGiftCard.id]: (collectedCards[randomGiftCard.id] || 0) + 1
        };
        setCollectedCards(updatedCollectedCards);
        localStorage.setItem('collectedCards', JSON.stringify(updatedCollectedCards));
      } else {
        const coinsToAdd = Math.floor(Math.random() * 901) + 100;
        const updatedCoins = coins + coinsToAdd;
        setCoins(updatedCoins);
        setNewCoins(coinsToAdd);
        setGiftCard(null);
        localStorage.setItem('coins', updatedCoins.toString());
      }

      setChestOpened(true);
      setShowStars(true);
      setOpenCount(updatedOpenCount);
      setIsLoading(false);

      localStorage.setItem('openCount', updatedOpenCount.toString());

      if (updatedOpenCount === 10) {
        playAudio('/congratulations.mp3');
      } else {
        playAudio('/goodresult.mp3');
      }

      setTimeout(() => {
        setChestOpened(false);
        setShowStars(false);
        setNewCoins(0);
        setGiftCard(null);
      }, 5000);
    }, 3000);
  };

  const handleBuyCard = async (cardId: number) => {
    const card = giftCards.find(c => c.id === cardId);
    if (!card || upgradesRemaining <= 0) return;

    let adsWatched = 0;
    let adsFailed = 0;

    const handleReward = () => {
      adsWatched += 1;
      console.log(`Ad watched: ${adsWatched} of ${card.price}`);
    };

    const handleError = (result</antArtifact>
