const TELEGRAM_API = "https://api.telegram.org/bot7398992403:AAFHYjZlqu45VDbAc7Mqb4rK80j25CbI7zY";

async function GET() {
  try {
    // Get all telegram IDs from database
    const dbResult = await fetch(`${process.env.POSTGRES_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'SELECT DISTINCT telegram_id FROM users WHERE telegram_id IS NOT NULL'
      })
    });
    
    const rows = await dbResult.json();

    // Message text and inline keyboard
    const message = `🎉 Your token allocation is now ready for checking!\n\n📢 Make sure to follow our channel to stay updated on next steps.`;
    
    const inlineKeyboard = {
      inline_keyboard: [
        [{ text: "Join Our Channel", url: "https://t.me/telemasgold" }]
      ]
    };

    // Send messages concurrently
    const sendPromises = rows.map(({ telegram_id }) => {
      return fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegram_id,
          text: message,
          reply_markup: inlineKeyboard,
          parse_mode: "HTML"
        })
      }).catch(error => {
        console.error(`Failed to send to ${telegram_id}:`, error);
        return null;
      });
    });

    await Promise.all(sendPromises);

    return new Response(JSON.stringify({
      success: true,
      message: `Messages sent to ${rows.length} users`
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in snapshot message route:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to send messages"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export { GET };
