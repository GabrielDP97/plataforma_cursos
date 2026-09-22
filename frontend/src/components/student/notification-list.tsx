import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationsApi } from '../../api/modules/notifications';
import type { Notification } from '../../api/types';
import { EmptyState } from '../ui/empty-state';
import { Button } from '../ui/button';

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  unreadCount: number;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Ahora mismo';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function NotificationList({
  notifications,
  onMarkRead,
  onMarkAllRead,
  unreadCount,
}: NotificationListProps) {
  const [markingId, setMarkingId] = useState<string | null>(null);

  const handleClick = async (notification: Notification) => {
    if (notification.read) return;
    setMarkingId(notification.id);
    try {
      await notificationsApi.markRead(notification.id);
      onMarkRead(notification.id);
    } finally {
      setMarkingId(null);
    }
  };

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="h-12 w-12" />}
        title="No tienes notificaciones nuevas"
      />
    );
  }

  return (
    <div className="space-y-2">
      {unreadCount > 1 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
            <CheckCheck className="h-4 w-4" />
            Marcar todas como leídas
          </Button>
        </div>
      )}

      {notifications.map((notification) => (
        <button
          key={notification.id}
          type="button"
          onClick={() => handleClick(notification)}
          disabled={markingId === notification.id}
          className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
            notification.read
              ? 'border-gray-100 bg-white hover:bg-gray-50'
              : 'border-blue-100 bg-blue-50/50 hover:bg-blue-50'
          } ${markingId === notification.id ? 'opacity-50' : ''}`}
        >
          {!notification.read && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          )}
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
              {notification.title}
            </p>
            <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">
              {notification.message}
            </p>
          </div>
          <span className="shrink-0 text-xs text-gray-400">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </button>
      ))}
    </div>
  );
}
