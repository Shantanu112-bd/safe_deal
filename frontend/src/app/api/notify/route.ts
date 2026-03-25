export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { action, dealId, amount, merchantId } = await req.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Build the message
    let message = `🔔 *SafeDeal Alert*\n`;
    if (action === 'locked') {
      message += `💰 *New Payment Locked!*\n`;
      message += `Deal ID: \`${dealId}\`\n`;
      message += `Amount: ${amount} USDC\n`;
      message += `Merchant: \`${merchantId}\`\n`;
      message += `_Funds are now safely secured in escrow._`;
    } else if (action === 'released') {
      message += `✅ *Payment Released!*\n`;
      message += `Deal ID: \`${dealId}\`\n`;
      message += `Amount: ${amount} USDC\n`;
      message += `Merchant: \`${merchantId}\`\n`;
      message += `_The buyer has confirmed delivery._`;
    }

    // Always log to the server console for easy monitoring during demo
    console.log('\n======================================');
    console.log(message);
    console.log('======================================\n');

    // If configured, forward to Telegram directly
    if (botToken && chatId) {
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
          }),
        });
      } catch (err) {
        console.error('Failed to dispatch telegram notification', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Notification error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
