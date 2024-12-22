import React, { useState, useEffect } from 'react';
import { initUtils } from '@telegram-apps/sdk';

interface ReferralSystemProps {
  initData: string;
  userId: string;
  startParam: string;
}

const ReferralSystem: React.FC<ReferralSystemProps> = ({ initData, userId, startParam }) => {
  const [referralCount, setReferralCount] = useState<number>(0);
  const INVITE_URL = "https://t.me/telemas_ai_bot/Farm";

  useEffect(() => {
    const checkReferral = async () => {
      if (startParam && userId) {
        try {
          const response = await fetch('/api/referrals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, referrerId: startParam }),
          });
          if (!response.ok) {
            console.error('Failed to save referral:', await response.text());
          }
        } catch (error) {
          console.error('Error saving referral:', error);
        }
      }
    };

    const fetchReferralCount = async () => {
      if (userId) {
        try {
          const response = await fetch(`/api/referrals/count?userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            setReferralCount(data.referralCount || 0);
          } else {
            console.error('Failed to fetch referral count:', await response.text());
          }
        } catch (error) {
          console.error('Error fetching referral count:', error);
        }
      }
    };

    checkReferral();
    fetchReferralCount();

    // Fetch referral count every minute
    const intervalId = setInterval(fetchReferralCount, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [userId, startParam]);

  const handleInviteFriend = () => {
    try {
      const utils = initUtils();
      const inviteLink = `${INVITE_URL}?startapp=${userId}`;
      const shareText = `Join me to accumulate coins for the first Christmas airdrop bot on Telegram.`;
      const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`;
      utils.openTelegramLink(fullUrl);
    } catch (error) {
      console.error('Error opening invite link:', error);
    }
  };

  const handleCopyLink = () => {
    const inviteLink = `${INVITE_URL}?startapp=${userId}`;
    navigator.clipboard.writeText(inviteLink)
      .then(() => alert('Invite link copied to clipboard!'))
      .catch(err => console.error('Failed to copy: ', err));
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col space-y-4">
        <button
          onClick={handleInviteFriend}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Invite Friend
        </button>
        <button
          onClick={handleCopyLink}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Copy Invite Link
        </button>
      </div>
    </div>
  );
};

export default ReferralSystem;
