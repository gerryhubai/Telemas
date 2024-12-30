import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Query to fetch all telegram IDs
    const result = await sql`
      SELECT telegram_id
      FROM users WHERE airdropped_value > 0;
    `;

    // Extract telegram IDs and join them into a comma-separated string
    const telegramIds = result.rows.map(row => row.telegram_id).join(',');

    return NextResponse.json({
      success: true,
      telegramIds,
    });
  } catch (error) {
    console.error('Error fetching Telegram IDs:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    });
  }
}
