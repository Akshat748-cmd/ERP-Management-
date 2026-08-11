import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Info, AlertTriangle, Sparkles, X } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type?: 'info' | 'alert' | 'success';
}

const STATIC_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Mid-term Examinations Announced',
    description: 'Academic schedule for Class X & XII has been published.',
    time: '10 min ago',
    read: false,
    type: 'info',
  },
  {
    id: 'n2',
    title: 'Fee Due Date Reminder',
    description: 'Q3 Tuition fee deadline approaching on 5th Aug.',
    time: '2 hours ago',
    read: false,
    type: 'alert',
  },
  {
    id: 'n3',
    title: 'New Homework Submitted',
    description: 'Mathematics Assignment #4 submitted by 28 students.',
    time: 'Yesterday',
    read: true,
    type: 'success',
  },
];

const typeConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    dot: 'bg-blue-500',
  },
  alert: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    dot: 'bg-amber-500',
  },
  success: {
    icon: Sparkles,
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    dot: 'bg-emerald-500',
  },
};

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(STATIC_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-150 focus:outline-none"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1.5 ring-white ring-2" />
        )}
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 mt-2 w-[360px] bg-white rounded-2xl shadow-xl border border-slate-200/80 z-50 overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-semibold text-slate-900">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-600">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-[12px] text-slate-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map(item => {
                  const cfg = typeConfig[item.type ?? 'info'];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => markRead(item.id)}
                      className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors group ${
                        item.read ? 'hover:bg-slate-50' : 'bg-blue-50/30 hover:bg-blue-50/50'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg} ${cfg.text}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-[12px] font-semibold leading-snug ${item.read ? 'text-slate-700' : 'text-slate-900'}`}>
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!item.read && (
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${cfg.dot}`} />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 text-center">
              <button className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
