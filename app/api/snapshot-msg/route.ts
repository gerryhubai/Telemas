import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot("7398992403:AAFHYjZlqu45VDbAc7Mqb4rK80j25CbI7zY", { polling: false });

export async function GET() {
  try {
    // Fetch all telegram IDs from the users table
    const { rows } = await sql`
      SELECT DISTINCT telegram_id 
      FROM users 
      WHERE telegram_id IS NOT NULL
    `;

    // Create inline keyboard with channel link
    const keyboard = {
      inline_keyboard: [
        [{ text: "Join Our Channel", url: "https://t.me/telemasgold" }]
      ]
    };

    const message = `🎉 Your token allocation is now ready for checking!\n\n📢 Make sure to follow our channel to stay updated on next steps.`;

    // Send messages concurrently using Promise.all
    const messagePromises = rows.map(({ telegram_id }) => {
      return bot.sendMessage(telegram_id, message, {
        reply_markup: keyboard,
        parse_mode: "HTML"
      }).catch(error => {
        console.error(`Failed to send message to ${telegram_id}:`, error);
        return null; // Continue with other messages even if one fails
      });
    });

    await Promise.all(messagePromises);

    return NextResponse.json({ 
      success: true, 
      message: `Messages sent to ${rows.length} users`
    });

  } catch (error) {
    console.error("Error in snapshot message route:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to send messages" 
    }, { status: 500 });
  }
}
