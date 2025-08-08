'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Send } from 'lucide-react';

export default function TestTelegramPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const testTelegram = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'test',
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to send test message: ' + (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Test Telegram Integration</h1>
        <p className="text-gray-600">Test your Telegram bot configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Telegram Bot Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Click the button below to send a test message to your Telegram bot. 
            Make sure you have configured your bot token and chat ID in the environment variables.
          </p>

          <div className="space-y-4">
            <Button 
              onClick={testTelegram} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Test Message...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Message
                </>
              )}
            </Button>

            {result && (
              <div className={`p-4 rounded-lg border ${
                result.success 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2" />
                  )}
                  <span className="font-medium">
                    {result.success ? 'Success!' : 'Error'}
                  </span>
                </div>
                <p className="mt-1 text-sm">{result.message}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium text-gray-900">1. Create a Telegram Bot</h4>
              <p className="text-gray-600">Message @BotFather on Telegram and create a new bot</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">2. Get Bot Token</h4>
              <p className="text-gray-600">Copy the bot token from BotFather</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">3. Get Chat ID</h4>
              <p className="text-gray-600">
                Start a chat with your bot, then visit: 
                <code className="ml-1 px-1 py-0.5 bg-gray-100 rounded text-xs">
                  https://api.telegram.org/bot&lt;YOUR_BOT_TOKEN&gt;/getUpdates
                </code>
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">4. Update Environment Variables</h4>
              <p className="text-gray-600">Add your bot token and chat ID to .env.local</p>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs">
{`TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">5. Restart Development Server</h4>
              <p className="text-gray-600">Restart your Next.js development server to load the new environment variables</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
