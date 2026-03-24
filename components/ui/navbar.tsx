// Navbar Component
// Top navigation bar + mobile bottom tab bar
// Desktop: single top bar with all items
// Mobile: top bar (logo + auth) + bottom tab bar (nav items)

"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  BookOpen,
  Bookmark,
  User,
  LogIn,
  LogOut,
  Sparkles,
  Compass,
  Sun,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/ui/logo";

const MOBILE_LABEL_WIDTH = 72;

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string; "aria-hidden"?: boolean }>;
  href: string;
  requiresAuth?: boolean;
  beta?: boolean;
}

// Main navigation items (shown in bottom bar on mobile, top bar on desktop)
const mainNavItems: NavItem[] = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Quran", icon: BookOpen, href: "/quran" },
  { label: "Today", icon: Sun, href: "/today" },
  { label: "Ask", icon: Sparkles, href: "/ask", beta: true },
  { label: "Topics", icon: Compass, href: "/topics", beta: true },
  { label: "Bookmarks", icon: Bookmark, href: "/bookmarks", requiresAuth: true },
];

// Auth items (shown in top bar on both mobile and desktop)
const authNavItems: NavItem[] = [
  { label: "Profile", icon: User, href: "/profile", requiresAuth: true },
  { label: "Sign In", icon: LogIn, href: "/sign-in", requiresAuth: false },
];

type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter main nav items based on auth
  const filteredMainItems = mainNavItems.filter((item) => {
    if (item.requiresAuth === true) return status === "authenticated";
    return true;
  });

  // Filter auth items
  const filteredAuthItems = authNavItems.filter((item) => {
    if (item.requiresAuth === true) return status === "authenticated";
    if (item.label === "Sign In") return status === "unauthenticated";
    return true;
  });

  // All items for desktop (main + auth)
  const allDesktopItems = [...filteredMainItems, ...filteredAuthItems];

  // Set active index based on current pathname
  useEffect(() => {
    const currentIndex = allDesktopItems.findIndex(
      (item) => item.href === pathname || pathname.startsWith(item.href + "/")
    );
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [pathname, allDesktopItems]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* ── Top Navbar ── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        role="navigation"
        aria-label="Main Navigation"
        className={cn(
          "bg-white/90 backdrop-blur-md border-b border-gray-200/40",
          "flex items-center justify-center px-3 md:px-4 py-2 md:py-3",
          "sticky top-0 z-50 w-full",
          "shadow-sm shadow-gray-100/50",
          "rounded-b-2xl md:rounded-b-3xl",
          className,
        )}
      >
        <div className="max-w-7xl w-full mx-auto">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Logo
                variant="full"
                className="h-7 md:h-9 w-auto"
                showText={true}
              />
            </div>

            {/* Desktop: all nav items */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-end">
              {allDesktopItems.map((item, idx) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setActiveIndex(idx)}
                    aria-label={item.label}
                    className="flex-shrink-0"
                  >
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "flex items-center px-4 py-2 rounded-full transition-all duration-300 ease-in-out relative h-10 min-w-[44px] min-h-[40px] max-h-[44px] cursor-pointer",
                        active
                          ? "bg-gray-100/60 text-black gap-2 shadow-sm"
                          : "bg-transparent text-gray-600 hover:bg-gray-100/60 hover:text-gray-900",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-full",
                      )}
                    >
                      <span className="relative inline-flex shrink-0">
                        <Icon size={20} strokeWidth={2} aria-hidden className="w-5 h-5" />
                        {item.beta && (
                          <span className="absolute -top-2 -right-3 rounded bg-violet-500 px-1 py-px text-[7px] font-bold text-white leading-none">
                            beta
                          </span>
                        )}
                      </span>
                      <motion.div
                        initial={false}
                        animate={{
                          width: active ? `${MOBILE_LABEL_WIDTH}px` : "0px",
                          opacity: active ? 1 : 0,
                          marginLeft: active ? "8px" : "0px",
                        }}
                        transition={{
                          width: { type: "spring", stiffness: 400, damping: 35 },
                          opacity: { duration: 0.25 },
                          marginLeft: { duration: 0.25 },
                        }}
                        className="overflow-hidden flex items-center max-w-[72px]"
                      >
                        <span
                          className={cn(
                            "font-medium text-xs whitespace-nowrap select-none",
                            active ? "text-black" : "opacity-0",
                          )}
                        >
                          {item.label}
                        </span>
                      </motion.div>
                    </motion.div>
                  </Link>
                );
              })}

              {/* Desktop Sign Out */}
              {status === "authenticated" && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => signOut({ callbackUrl: "/" })}
                  aria-label="Sign Out"
                  className={cn(
                    "flex items-center px-4 py-2 rounded-full transition-all duration-300 ease-in-out relative h-10 min-w-[44px] min-h-[40px] max-h-[44px] cursor-pointer",
                    "bg-transparent text-gray-600 hover:bg-red-50 hover:text-red-600",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-full",
                  )}
                >
                  <LogOut size={20} strokeWidth={2} aria-hidden className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {/* Mobile: only auth buttons (Profile/SignIn + SignOut) */}
            <div className="flex md:hidden items-center gap-1">
              {filteredAuthItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-full transition-colors",
                      active
                        ? "bg-gray-100 text-black"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <Icon size={18} strokeWidth={2} aria-hidden />
                  </Link>
                );
              })}

              {/* Mobile Sign Out */}
              {status === "authenticated" && (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  aria-label="Sign Out"
                  className="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut size={18} strokeWidth={2} aria-hidden />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav
        aria-label="Mobile Navigation"
        className={cn(
          "md:hidden fixed bottom-0 inset-x-0 z-50",
          "bg-white/95 backdrop-blur-md border-t border-gray-200/60",
          "pb-[env(safe-area-inset-bottom)]",
          "shadow-[0_-2px_10px_rgba(0,0,0,0.06)]",
        )}
      >
        <div className="flex items-center justify-around px-2 pt-1.5 pb-1.5">
          {filteredMainItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-colors min-w-[48px]",
                  active ? "text-black" : "text-gray-400",
                )}
              >
                <span className="relative">
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.5 : 1.8}
                    aria-hidden
                    className={cn(
                      "transition-all",
                      active && "text-black",
                    )}
                  />
                  {item.beta && (
                    <span className="absolute -top-1.5 -right-2.5 rounded bg-violet-500 px-0.5 py-px text-[6px] font-bold text-white leading-none">
                      beta
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-[10px] leading-tight font-medium",
                    active ? "text-black" : "text-gray-400",
                  )}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="bottomTabIndicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-black"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
