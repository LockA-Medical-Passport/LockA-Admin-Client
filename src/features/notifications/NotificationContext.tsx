"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AppNotification, NewNotification } from "./types";

const MAX_NOTIFICATIONS = 50;

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: NewNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

function storageKeyFor(adminId: string) {
  return `locka-notifications:${adminId}`;
}

function isStoredNotification(value: unknown): value is AppNotification {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<AppNotification>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.message === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.read === "boolean"
  );
}

function loadNotifications(adminId: string): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKeyFor(adminId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(isStoredNotification).slice(0, MAX_NOTIFICATIONS)
      : [];
  } catch {
    // Corrupt or unavailable storage must never block the app shell.
    return [];
  }
}

/**
 * In-app notification center state, persisted per admin in localStorage so unread items
 * survive a refresh. Real-time producers (see `features/realtime/RealtimeProvider.tsx`)
 * call `addNotification`; the bell and its unread badge read from here.
 */
export function NotificationProvider({
  adminId,
  children,
}: {
  adminId: string;
  children: ReactNode;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    loadedRef.current = false;
    let cancelled = false;

    // Deferred until after hydration: localStorage isn't available during SSR, and reading it
    // in the effect body would make the first client render disagree with the server HTML.
    queueMicrotask(() => {
      if (cancelled) return;
      setNotifications(loadNotifications(adminId));
      loadedRef.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, [adminId]);

  useEffect(() => {
    if (!loadedRef.current || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKeyFor(adminId), JSON.stringify(notifications));
    } catch {
      // Storage can be full/disabled (private mode); notifications still work in memory.
    }
  }, [adminId, notifications]);

  const addNotification = useCallback((notification: NewNotification) => {
    setNotifications((current) => {
      if (current.some((item) => item.id === notification.id)) return current;
      const next: AppNotification = {
        ...notification,
        createdAt: notification.createdAt ?? new Date().toISOString(),
        read: notification.read ?? false,
      };
      return [next, ...current].slice(0, MAX_NOTIFICATIONS);
    });
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      addNotification,
      markRead,
      markAllRead,
      clearNotifications,
    }),
    [notifications, addNotification, markRead, markAllRead, clearNotifications],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
