import { Order } from './order-context';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export interface TelegramMessage {
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
}

export class TelegramService {
  private static instance: TelegramService;
  private botToken: string;
  private chatId: string;

  private constructor() {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Telegram bot token and chat ID must be configured in environment variables');
    }
    this.botToken = TELEGRAM_BOT_TOKEN;
    this.chatId = TELEGRAM_CHAT_ID;
  }

  public static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  private async sendMessage(message: TelegramMessage): Promise<boolean> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message.text,
          parse_mode: message.parse_mode || 'HTML',
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

  public async sendNewOrderNotification(order: Order): Promise<boolean> {
    const orderItems = order.items.map(item => 
      `• ${item.product.name} (Size: ${item.product.selectedSize || 'N/A'}) x${item.quantity}`
    ).join('\n');

    const message: TelegramMessage = {
      text: `
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

🔗 <b>Admin Panel:</b> <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders/${order.id}">View Order Details</a>
      `.trim(),
      parse_mode: 'HTML'
    };

    return await this.sendMessage(message);
  }

  public async sendOrderStatusUpdate(order: Order, oldStatus: string): Promise<boolean> {
    const statusEmoji = {
      'Pending': '⏳',
      'Confirmed': '✅',
      'Shipped': '🚚',
      'Delivered': '📦',
      'Canceled': '❌'
    };

    const message: TelegramMessage = {
      text: `
📋 <b>ORDER STATUS UPDATED</b>

• Order ID: <code>${order.orderNumber}</code>
• Customer: ${order.customerInfo.fullName}
• Status: ${statusEmoji[oldStatus as keyof typeof statusEmoji] || '📋'} ${oldStatus} → ${statusEmoji[order.status as keyof typeof statusEmoji] || '📋'} <b>${order.status}</b>
• Total: <b>${order.total} DH</b>

📅 Updated: ${new Date().toLocaleString()}

🔗 <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders/${order.id}">View Order Details</a>
      `.trim(),
      parse_mode: 'HTML'
    };

    return await this.sendMessage(message);
  }

  public async sendTestMessage(): Promise<boolean> {
    const message: TelegramMessage = {
      text: `
🤖 <b>Telegram Bot Test</b>

✅ Your Telegram bot is working correctly!
📅 Test sent at: ${new Date().toLocaleString()}

This message confirms that your order notifications will be delivered successfully.
      `.trim(),
      parse_mode: 'HTML'
    };

    return await this.sendMessage(message);
  }
}

// Export a singleton instance
export const telegramService = TelegramService.getInstance();
