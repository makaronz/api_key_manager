import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useUiStore } from '../stores/uiStore';
import { Notification } from '../types';

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { removeNotification } = useUiStore();

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${getBgColor()} shadow-sm animate-slide-in`}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        {notification.title && (
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            {notification.title}
          </h4>
        )}
        <p className="text-sm text-gray-700">{notification.message}</p>
      </div>
      <button
        onClick={() => removeNotification(notification.id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-gray-200 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
};

export const NotificationContainer: React.FC = () => {
  const { notifications } = useUiStore();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default NotificationContainer;