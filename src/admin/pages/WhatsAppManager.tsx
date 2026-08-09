import React, { useEffect, useState } from 'react';
import { MessageSquare, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE } from '../../App';

export default function WhatsAppManager() {
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/admin/whatsapp/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setIsConnected(data.connected);
      setQrCode(data.qr);
    } catch (err) {
      console.error('Failed to fetch WhatsApp status:', err);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 5 seconds to update QR code or connection status
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-primary flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-green-500" />
          WhatsApp Bot Setup
        </h1>
        <button 
          onClick={() => { setLoading(true); fetchStatus(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-neutral-200 text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 max-w-2xl">
        <div className="flex flex-col items-center justify-center text-center">
          
          {isConnected ? (
            <div className="flex flex-col items-center space-y-4 py-12">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4 border-8 border-green-100">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-800">WhatsApp is Connected!</h2>
              <p className="text-neutral-500 max-w-md">
                Your WhatsApp number is successfully linked. The automated bot will now send order confirmations directly from your phone number.
              </p>
            </div>
          ) : qrCode ? (
            <div className="flex flex-col items-center space-y-6">
              <h2 className="text-2xl font-bold text-neutral-800">Scan QR to Link WhatsApp</h2>
              <p className="text-neutral-500">
                Open WhatsApp on your phone, go to <b>Linked Devices</b>, and scan this QR code to activate the bot.
              </p>
              <div className="bg-white p-4 rounded-2xl shadow-md border border-neutral-100">
                <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
              </div>
              <p className="text-xs text-neutral-400 font-medium">QR Code refreshes automatically every 20 seconds.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 py-12">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 border-4 border-orange-100">
                <XCircle className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-xl font-bold text-neutral-800">Initializing WhatsApp...</h2>
              <p className="text-neutral-500">
                Please wait while the server generates a new QR code. If this takes too long, check the server logs.
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-neutral-100 w-full text-left">
            <h3 className="font-bold text-neutral-800 mb-2">How does this work?</h3>
            <ul className="list-disc list-inside text-sm text-neutral-600 space-y-2">
              <li>It uses your existing WhatsApp number as a 'Linked Device'.</li>
              <li>When a customer places an order, an automated receipt is sent instantly.</li>
              <li>You can view all automated messages directly in your phone's WhatsApp app.</li>
              <li>Your phone must be connected to the internet occasionally to keep the session alive.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
