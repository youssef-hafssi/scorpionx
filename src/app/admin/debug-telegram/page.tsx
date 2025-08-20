'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Send, Bug } from 'lucide-react';

export default function DebugTelegramPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');

  const checkConfiguration = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/telegram', {
        method: 'GET',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to check configuration: ' + (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testWithCustomCredentials = async () => {
    if (!botToken || !chatId) {
      setResult({
        success: false,
        message: 'Please enter both bot token and chat ID',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🤖 <b>Direct Test</b>\n\n✅ Direct API test successful!\n📅 ${new Date().toLocaleString()}`,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({
          success: true,
          message: 'Direct API test successful!',
          data: data
        });
      } else {
        setResult({
          success: false,
          message: 'Direct API test failed: ' + data.description,
          data: data
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Direct API test error: ' + (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Debug Telegram Integration</h1>
        <p className="text-gray-600">Troubleshoot your Telegram bot configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Configuration Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Check if your environment variables are properly configured.
          </p>

          <Button 
            onClick={checkConfiguration} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Checking...
              </>
            ) : (
              <>
                <Bug className="h-4 w-4 mr-2" />
                Check Configuration
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
              
              {result.debug && (
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded text-xs">
                  <p><strong>Debug Info:</strong></p>
                  <p>Has Token: {result.debug.hasToken ? 'Yes' : 'No'}</p>
                  <p>Has Chat ID: {result.debug.hasChatId ? 'Yes' : 'No'}</p>
                  <p>Token Length: {result.debug.tokenLength}</p>
                  <p>Chat ID: {result.debug.chatId || 'Not set'}</p>
                </div>
              )}
              
              {result.data && (
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded text-xs">
                  <p><strong>API Response:</strong></p>
                  <pre>{JSON.stringify(result.data, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Direct API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Test the Telegram API directly with your credentials.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="botToken">Bot Token</Label>
              <Input
                id="botToken"
                type="password"
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="chatId">Chat ID</Label>
              <Input
                id="chatId"
                placeholder="123456789 or -123456789"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={testWithCustomCredentials} 
            disabled={isLoading || !botToken || !chatId}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Test Direct API
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Get Your Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium text-gray-900">1. Create Bot with @BotFather</h4>
              <p className="text-gray-600">
                • Open Telegram and search for @BotFather<br/>
                • Send /newbot command<br/>
                • Follow the instructions to create your bot<br/>
                • Copy the bot token (format: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ)
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">2. Get Your Chat ID</h4>
              <p className="text-gray-600">
                • Start a conversation with your bot<br/>
                • Send any message to your bot<br/>
                • Visit: https://api.telegram.org/bot&lt;YOUR_BOT_TOKEN&gt;/getUpdates<br/>
                • Look for &quot;chat&quot;:&#123;&quot;id&quot;:123456789&#125; in the response<br/>
                • Copy the ID number
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">3. Update .env.local</h4>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs">
{`TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
