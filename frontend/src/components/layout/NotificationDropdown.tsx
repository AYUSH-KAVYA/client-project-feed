import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead } = useSocket();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadNotificationCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-rose-500 rounded-full animate-pulse">
            {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white">Notifications</h3>
              {unreadNotificationCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-brand-500/20 text-brand-400 font-medium rounded-full">
                  {unreadNotificationCount} new
                </span>
              )}
            </div>
            {unreadNotificationCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No notifications yet</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 hover:bg-slate-700/40 transition-colors flex items-start justify-between gap-3 ${
                    !item.isRead ? 'bg-slate-800/80' : 'opacity-75'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold ${!item.isRead ? 'text-white' : 'text-slate-300'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.message}</p>
                  </div>
                  {!item.isRead && (
                    <button
                      onClick={() => markNotificationRead(item.id)}
                      className="p-1 text-slate-400 hover:text-brand-400 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
