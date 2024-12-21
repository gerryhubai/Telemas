// update-wallet/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { telegram_id, wallet_address } = await request.json();

    if (!telegram_id || !wallet_address) {
      return NextResponse.json(
        { error: 'Telegram ID and wallet address are required' },
        { status: 400 }
      );
    }

    console.log('Updating wallet address for telegram_id:', telegram_id);

    const updateResult = await sql`
      UPDATE users
      SET 
        wallet_address = ${wallet_address},
        last_update = CURRENT_TIMESTAMP
      WHERE telegram_id = ${telegram_id}
      RETURNING *
    `;

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Update result:', updateResult.rows[0]);
    return NextResponse.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Error updating database' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegram_id = searchParams.get('telegram_id');

    if (!telegram_id) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT wallet_address 
      FROM users 
      WHERE telegram_id = ${telegram_id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ wallet_address: result.rows[0].wallet_address });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Error querying database' },
      { status: 500 }
    );
  }
}
