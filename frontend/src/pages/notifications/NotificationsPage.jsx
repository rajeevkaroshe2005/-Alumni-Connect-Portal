import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, Check, CheckCheck, Clock, Calendar, 
  Briefcase, MessageSquare, AlertCircle, Sparkles, ChevronRight 
} from 'lucide-react';
import api from '../../services/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/notifications');
      if (res?.success) {
        setNotifications(res.data?.notifications || []);
        setUnreadCount(res.data?.unread_count || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      if (res?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      const res = await api.put('/notifications/read-all');
      if (res?.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      alert(err.message || 'Failed to mark all as read.');
    } finally {
      setActionLoading(false);
    }
  };

  const getNotificationIcon = (title) => {
    const t = (title || '').toLowerCase();
    if (t.includes('mentorship') || t.includes('booking')) {
      return <Clock className="w-5 h-5 text-indigo-500" />;
    }
    if (t.includes('job') || t.includes('application')) {
      return <Briefcase className="w-5 h-5 text-emerald-500" />;
    }
    if (t.includes('event') || t.includes('webinar')) {
      return <Calendar className="w-5 h-5 text-blue-500" />;
    }
    if (t.includes('message')) {
      return <MessageSquare className="w-5 h-5 text-purple-500" />;
    }
    return <Sparkles className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 px-2.5 py-0.5 rounded-full font-semibold">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Real-time updates on mentorship bookings, job applications, campus events, and administrative alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={actionLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <CheckCheck className="w-4 h-4 mr-1.5 text-blue-600 dark:text-blue-400" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 h-20" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">All caught up!</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You do not have any notifications at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                  n.is_read
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-gray-900 dark:text-white'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="mt-0.5 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    {getNotificationIcon(n.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold truncate">{n.title}</h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[11px] text-gray-400 mt-2 block">
                      {new Date(n.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    title="Mark as read"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
