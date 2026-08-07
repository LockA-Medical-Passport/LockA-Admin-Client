"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: <GridIcon /> },
  { href: "/applications", label: "Applications", icon: <InboxIcon /> },
  { href: "/providers", label: "Providers", icon: <BuildingIcon /> },
  { href: "/audit-log", label: "Audit Log", icon: <ClipboardIcon /> },
  { href: "/settings", label: "Settings", icon: <GearIcon /> },
];

export interface SidebarProps {
  navItems?: NavItem[];
  mobileOpen?: boolean;
  onClose?: () => void;
}

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar({
  navItems = DEFAULT_NAV_ITEMS,
  mobileOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm md:hidden"
        />
      )}
      <aside
        className={cn(
          "glass-bright fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-1 border-r border-white/10 p-4",
          "transition-transform duration-200 ease-out md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-4 flex items-center gap-2 px-2 py-2">
          <span className="glow-cyan flex size-8 items-center justify-center rounded-lg bg-locka-cyan/10 text-sm font-bold text-locka-cyan">
            L
          </span>
          <span className="text-sm font-semibold tracking-wide text-foreground">LockA Admin</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-locka-cyan/10 text-locka-cyan"
                    : "text-foreground/60 hover:bg-white/5 hover:text-foreground",
                )}
              >
                <span className="size-4.5 shrink-0">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function iconProps() {
  return {
    viewBox: "0 0 20 20",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "size-full",
    "aria-hidden": true as const,
  };
}

function GridIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="2.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M2.5 11l2.2-6.3A1.5 1.5 0 0 1 6.1 3.7h7.8a1.5 1.5 0 0 1 1.4 1L17.5 11" />
      <path d="M2.5 11v4a1.5 1.5 0 0 0 1.5 1.5h12A1.5 1.5 0 0 0 17.5 15v-4h-4.2a2.3 2.3 0 0 1-4.6 0H2.5Z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3.5" y="2.5" width="9" height="15" rx="1" />
      <path d="M12.5 8h4v9.5h-4" />
      <path d="M6.5 6h1M9.5 6h1M6.5 9h1M9.5 9h1M6.5 12h1M9.5 12h1" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="4" y="3.5" width="12" height="14" rx="1.5" />
      <path d="M7.5 2.5h5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5Z" />
      <path d="M7 9h6M7 12h6M7 15h3.5" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="10" cy="10" r="2.75" />
      <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1 4.7 4.7" />
    </svg>
  );
}
