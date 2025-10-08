import { useState, useEffect } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  GET_NOTIFICATIONS,
  GET_UNREAD_COUNT,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from "@/graphql/queries/notifications";
import { NOTIFICATION_RECEIVED } from "@/graphql/subscriptions/notifications";
import { useToast } from "@/components/ui/toast";
import {
  GetNotificationsQuery,
  GetUnreadNotificationCountQuery,
  NotificationReceivedSubscription,
} from "@/graphql/__generated__/graphql";

type Notification = NonNullable<GetNotificationsQuery["notifications"]>[number];

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { push: toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Query for unread count
  const { data: countData, refetch: refetchCount } = useQuery<GetUnreadNotificationCountQuery>(GET_UNREAD_COUNT, {
    skip: !user?.id,
    fetchPolicy: "cache-and-network",
  });

  // Query for notifications
  const { data: notificationsData, refetch: refetchNotifications } = useQuery<GetNotificationsQuery>(
    GET_NOTIFICATIONS,
    {
      variables: { limit: 20, unreadOnly: false },
      skip: !user?.id,
      fetchPolicy: "cache-and-network",
    }
  );

  // Subscribe to new notifications
  const { data: subscriptionData } = useSubscription<NotificationReceivedSubscription>(NOTIFICATION_RECEIVED, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  // Mark notification as read mutation
  const [markAsRead] = useMutation(MARK_NOTIFICATION_READ, {
    onCompleted: () => {
      refetchCount();
      refetchNotifications();
    },
  });

  // Mark all as read mutation
  const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ, {
    onCompleted: () => {
      toast({ title: "All notifications marked as read" });
      refetchCount();
      refetchNotifications();
    },
  });

  // Handle new notification from subscription
  useEffect(() => {
    if (subscriptionData?.notificationReceived) {
      refetchCount();
      refetchNotifications();
      // Show toast for new notification
      const notification = subscriptionData.notificationReceived;
      toast({
        title: notification.title,
        description: notification.message,
      });
    }
  }, [subscriptionData, refetchCount, refetchNotifications, toast]);

  const unreadCount = countData?.unreadNotificationCount || 0;
  const notifications: Notification[] =
    notificationsData?.notifications || [];

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await markAsRead({ variables: { id: notification.id } });
    }

    // Navigate to the related entity
    if (notification.relatedType === "PayRequest" && notification.relatedId) {
      navigate(`/requests`);
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "PAY_REQUEST_SUBMITTED":
        return "📝";
      case "PAY_REQUEST_APPROVED":
        return "✅";
      case "PAY_REQUEST_DENIED":
        return "❌";
      case "PAY_REQUEST_REBUKED":
        return "⚠️";
      case "PAY_REQUEST_PAID":
        return "💰";
      default:
        return "🔔";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Notifications</DialogTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead()}
              >
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                  !notification.isRead
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                    : "bg-background"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-sm">
                        {notification.title}
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {formatTimeAgo(notification.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
