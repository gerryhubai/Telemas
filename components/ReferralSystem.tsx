import React, { useState, useEffect } from 'react'
import { initUtils } from '@telegram-apps/sdk'

interface ReferralSystemProps {
  initData: string
  userId: string
  startParam: string
}

const ReferralSystem: React.FC<ReferralSystemProps> = ({ initData, userId, startParam }) => {
  const [referralCount, setReferralCount] = useState<number>(0)
  const INVITE_URL = "https://t.me/telemas_ai_bot/Farm"

  useEffect(() => {
    const checkReferral = async () => {
      if (startParam && userId) {
        try {
          const response = await fetch('/api/referrals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, referrerId: startParam }),
          });
          if (!response.ok) throw new Error('Failed to save referral');
        } catch (error) {
          console.error('Error saving referral:', error);
        }
      }
    }

    const fetchReferralCount = async () => {
      if (userId) {
        try {
          const response = await fetch(`/api/referrals/count?userId=${userId}`);
          if (!response.ok) throw new Error('Failed to fetch referral count');
          const data = await response.json();
          setReferralCount(data.referralCount);
        } catch (error) {
          console.error('Error fetching referral count:', error);
        }
      }
    }

    checkReferral();
    fetchReferralCount();

    // Set up an interval to periodically fetch the referral count
    const intervalId = setInterval(fetchReferralCount, 60000); // Fetch every minute

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [userId, startParam])

  const handleInviteFriend = () => {
    const utils = initUtils()
    const inviteLink = `${INVITE_URL}?startapp=${userId}`
    const shareText = `Join me accumulate coins for the first christmas airdrop bot on Telegram.`
    const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`
    utils.openTelegramLink(fullUrl)
  }

  const handleCopyLink = () => {
    const inviteLink = `${INVITE_URL}?startapp=${userId}`
    navigator.clipboard.writeText(inviteLink)
      .then(() => alert('Invite link copied to clipboard!'))
      .catch(err => console.error('Failed to copy: ', err));
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-red-100 rounded-lg p-4 mb-6">
        <p className="text-center text-red-800 font-semibold">
          Your Invited Friends: <span className="text-2xl">{referralCount}</span>
        </p>
      </div>
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
  )
}

export default ReferralSystem
