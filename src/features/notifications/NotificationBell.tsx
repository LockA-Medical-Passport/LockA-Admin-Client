"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useNotifications } from "./NotificationContext";

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, clearNotifications } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative rounded-lg border border-white/10 bg-navy-800/60 p-2 text-foreground/70 transition-colors hover:bg-white/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-locka-cyan/50 focus-visible:outline-none"
      >
        <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
          <path
            d="M5 8a5 5 0 0 1 10 0c0 4 1.5 5 1.5 5h-13S5 12 5 8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.2 15.5a2 2 0 0 0 3.6 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex min-w-4.5 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] leading-4 font-semibold text-white">
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="glass-bright animate-slide-up absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 shadow-2xl"
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="rounded text-xs text-locka-cyan hover:underline focus-visible:ring-2 focus-visible:ring-locka-cyan/50 focus-visible:outline-none"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearNotifications}
                  className="rounded text-xs text-foreground/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-locka-cyan/50 focus-visible:outline-none"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <EmptyState
              title="You're all caught up"
              description="New applications and important events will show up here."
            />
          ) : (
            <ul className="flex max-h-96 flex-col overflow-y-auto">
              {notifications.map((item) => {
                const content = (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          item.read ? "text-foreground/70" : "text-foreground",
                        )}
                      >
                        {item.title}
                      </span>
                      {!item.read && (
                        <span
                          className="mt-1.5 size-2 shrink-0 rounded-full bg-locka-cyan"
                          aria-label="Unread"
                        />
                      )}
                    </div>
                    <span className="text-sm text-foreground/60">{item.message}</span>
                    <span className="text-xs text-foreground/60">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                );

                return (
                  <li key={item.id} className="border-b border-white/5 last:border-b-0">
                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={() => {
                          markRead(item.id);
                          setOpen(false);
                        }}
                        className={cn(
                          "block rounded px-4 py-3 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-locka-cyan/50 focus-visible:outline-none",
                          !item.read && "bg-locka-cyan/5",
                        )}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markRead(item.id)}
                        className={cn(
                          "block w-full px-4 py-3 text-left hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-locka-cyan/50 focus-visible:outline-none",
                          !item.read && "bg-locka-cyan/5",
                        )}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
