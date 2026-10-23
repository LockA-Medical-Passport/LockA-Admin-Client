export type NotificationKind = "application" | "transaction" | "system";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  /** In-app destination, e.g. the provider detail page. */
  href?: string;
  /** ISO-8601 creation time. */
  createdAt: string;
  read: boolean;
}

export type NewNotification = Omit<AppNotification, "createdAt" | "read"> &
  Partial<Pick<AppNotification, "createdAt" | "read">>;
