"use client";

import { useRouter } from "next/navigation";
import { Bell, Briefcase, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/components/shared/NotificationsProvider";
import {
  formatNotificationTime,
  getStudentNotificationHref,
} from "@/lib/utils/notifications";
import { NotificationItem } from "@/lib/types/dashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function notificationIcon(type: string, title: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes("message") || title === "Interview invitation") return MessageSquare;
  if (normalized.includes("application")) return Briefcase;
  return Bell;
}

type StudentNotificationBellProps = {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  className?: string;
};

export default function StudentNotificationBell({
  align = "end",
  side = "bottom",
  sideOffset = 8,
  className,
}: StudentNotificationBellProps = {}) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    panelOpen,
    setPanelOpen,
    markAsRead,
  } = useNotifications();

  const handleSelect = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setPanelOpen(false);
    router.push(getStudentNotificationHref(notification));
  };

  return (
    <DropdownMenu open={panelOpen} onOpenChange={setPanelOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className={cn(
            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-violet-200 hover:text-violet-600 data-[state=open]:border-violet-200 data-[state=open]:text-violet-600",
            unreadCount > 0 && "border-violet-200 text-violet-600",
            className,
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={16}
        className="w-[min(calc(100vw-2rem),380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-lg"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-extrabold text-slate-800">Notifications</p>
          <p className="text-xs text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>

        <div className="max-h-[min(60vh,420px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Bell className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">No notifications yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Application updates, messages, and interview invites appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {notifications.map((notification) => {
                const Icon = notificationIcon(notification.type, notification.title);

                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => void handleSelect(notification)}
                      className="block w-full cursor-pointer text-left transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                    >
                      <div className="flex gap-3 px-4 py-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm leading-snug",
                                notification.isRead
                                  ? "font-semibold text-slate-600"
                                  : "font-bold text-slate-800",
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                            )}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                            {notification.body}
                          </p>
                          <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
