import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram bot token and chat ID must be configured');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, order, oldStatus } = body;

    let message = '';

    if (type === 'new_order') {
      const orderItems = order.items.map((item: any) => 
        `• ${item.product.name} (Size: ${item.product.selectedSize || 'N/A'}) x${item.quantity}`
      ).join('\n');

      message = `
🛍️ <b>NEW ORDER RECEIVED!</b>

📋 <b>Order Details:</b>
• Order ID: <code>${order.orderNumber}</code>
• Status: <b>${order.status}</b>
• Total: <b>${order.total} DH</b>

👤 <b>Customer Information:</b>
• Name: ${order.customerInfo.fullName}
• Phone: <a href="tel:${order.customerInfo.phoneNumber}">${order.customerInfo.phoneNumber}</a>
• Email: ${order.customerInfo.email || 'Not provided'}
• Address: ${order.customerInfo.deliveryAddress}

🛒 <b>Items Ordered:</b>
${orderItems}

💰 <b>Order Summary:</b>
• Subtotal: ${order.subtotal} DH
• Shipping: ${order.shipping === 0 ? 'Free' : `${order.shipping} DH`}
• <b>Total: ${order.total} DH</b>

📅 <b>Order Date:</b> ${new Date(order.orderDate).toLocaleString()}
      `.trim();
    } else if (type === 'status_update') {
      const statusEmoji = {
        'Pending': '⏳',
        'Confirmed': '✅',
        'Shipped': '🚚',
        'Delivered': '📦',
        'Canceled': '❌'
      };

      message = `
📋 <b>ORDER STATUS UPDATED</b>

• Order ID: <code>${order.orderNumber}</code>
• Customer: ${order.customerInfo.fullName}
• Status: ${statusEmoji[oldStatus as keyof typeof statusEmoji] || '📋'} ${oldStatus} → ${statusEmoji[order.status as keyof typeof statusEmoji] || '📋'} <b>${order.status}</b>
• Total: <b>${order.total} DH</b>

📅 Updated: ${new Date().toLocaleString()}
      `.trim();
    } else if (type === 'test') {
      message = `
🤖 <b>Telegram Bot Test</b>

✅ Your Telegram bot is working correctly!
📅 Test sent at: ${new Date().toLocaleString()}

This message confirms that your order notifications will be delivered successfully.
      `.trim();
    }

    const success = await sendTelegramMessage(message);

    if (success) {
      return NextResponse.json({ success: true, message: 'Notification sent successfully' });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to send notification' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in Telegram API route:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  // Debug endpoint - check configuration
  const botToken = TELEGRAM_BOT_TOKEN;
  const chatId = TELEGRAM_CHAT_ID;

  console.log('Bot Token exists:', !!botToken);
  console.log('Chat ID exists:', !!chatId);
  console.log('Bot Token length:', botToken?.length || 0);
  console.log('Chat ID value:', chatId);

  if (!botToken || !chatId) {
    return NextResponse.json({
      success: false,
      message: 'Telegram bot token or chat ID not configured',
      debug: {
        hasToken: !!botToken,
        hasChatId: !!chatId,
        tokenLength: botToken?.length || 0,
        chatId: chatId
      }
    }, { status: 400 });
  }

  // Test endpoint
  const success = await sendTelegramMessage(`
🤖 <b>Telegram Bot Test</b>

✅ Your Telegram bot is working correctly!
📅 Test sent at: ${new Date().toLocaleString()}

This message confirms that your order notifications will be delivered successfully.
  `.trim());

  if (success) {
    return NextResponse.json({ success: true, message: 'Test notification sent successfully' });
  } else {
    return NextResponse.json({ success: false, message: 'Failed to send test notification' }, { status: 500 });
  }
}
