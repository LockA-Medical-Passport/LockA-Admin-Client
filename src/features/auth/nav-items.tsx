import { DEFAULT_NAV_ITEMS, type NavItem } from "@/components/layout";
import type { AdminRole } from "./types";

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-full"
      aria-hidden="true"
    >
      <circle cx="7.5" cy="6.5" r="2.75" />
      <path d="M2.5 16.5c0-2.76 2.24-5 5-5s5 2.24 5 5" />
      <path d="M12.8 4.2a2.75 2.75 0 0 1 0 5.4" />
      <path d="M15.5 11.7c1.98.5 3.5 2.32 3.5 4.8" />
    </svg>
  );
}

export function getNavItemsForRole(role: AdminRole): NavItem[] {
  if (role !== "super_admin") return DEFAULT_NAV_ITEMS;
  return [
    ...DEFAULT_NAV_ITEMS,
    { href: "/admin-users", label: "Admin Users", icon: <UsersIcon /> },
  ];
}
