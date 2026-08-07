"use client";

import { type ReactNode, useState } from "react";
import { Navbar, type NavbarProps } from "./Navbar";
import { DEFAULT_NAV_ITEMS, Sidebar, type NavItem } from "./Sidebar";

export interface AppShellProps extends NavbarProps {
  navItems?: NavItem[];
  children: ReactNode;
}

export function AppShell({
  navItems = DEFAULT_NAV_ITEMS,
  children,
  ...navbarProps
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        navItems={navItems}
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMobileNavOpen(true)} {...navbarProps} />
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
