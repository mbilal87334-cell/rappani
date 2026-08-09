import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Check, Loader, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { fetchWithAuth } from '../../api';

export default function NotificationHub() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetchWithAuth('/api/notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetchWithAuth('/api/notifications/mark-read', { method: 'PUT' });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case 'error': return <AlertCircle className="w-6 h-6 text-red-500" />;
      default: return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-primary">System Notifications</h2>
          <p className="text-neutral-500 text-sm mt-1">Recent alerts and activity in your store</p>
        </div>
        
        {notifications.some(n => !n.read) && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 bg-white text-neutral-700 border border-neutral-300 px-4 py-2 rounded-lg font-medium hover:bg-neutral-50 transition-all shadow-sm active:scale-95"
          >
            <Check className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 text-gold-500 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-16 text-center">
          <Bell className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-700 mb-2">You're all caught up!</h3>
          <p className="text-neutral-500">There are no new notifications to display right now.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
          {notifications.map((notif) => (
            <motion.div 
              key={notif._id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 flex gap-4 transition-colors ${notif.read ? 'bg-white opacity-75' : 'bg-blue-50/30'}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-base font-semibold ${notif.read ? 'text-neutral-700' : 'text-primary'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-xs text-neutral-400 whitespace-nowrap ml-4">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {notif.message}
                </p>
              </div>
              {!notif.read && (
                <div className="flex-shrink-0 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm shadow-blue-500/50"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
