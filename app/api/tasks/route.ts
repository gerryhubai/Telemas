import { NextResponse } from 'next/server';

const tasks = [
  {
    id: 7,
    title: "Join our Telegram Channel",
    description: "Join our Telegram channel for the latest updates!",
    link: "https://t.me/telemasgold",
    reward: 1000,
    emoji: "📢"
  },
  {
    id: 8,
    title: "Follow us on Twitter",
    description: "Follow us on Twitter for quick updates and news!",
    link: "https://twitter.com/@TelemasGold",
    reward: 1500,
    emoji: "🐦"
  },
  {
    id: 9,
    title: "Subscribe to our YouTube",
    description: "Subscribe to our YouTube channel for exciting videos!",
    link: "https://www.youtube.com/@telemasgold",
    reward: 1500,
    emoji: "🎥"
  },
  ];

export async function GET() {
  return NextResponse.json(tasks);
}
