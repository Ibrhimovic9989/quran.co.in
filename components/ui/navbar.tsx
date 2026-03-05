// Navbar Component
// Top navigation bar with animated navigation items
// Follows Atomic Design - Organism component

"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  BookOpen,
  LayoutDashboard,
  User,
  LogIn,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils/cn";

const MOBILE_LABEL_WIDTH = 72;

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string; "aria-hidden"?: boolean }>;
  href: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Quran", icon: BookOpen, href: "/quran" },
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

  // Filter nav items based on authentication status
  const filteredNavItems = navItems.filter((item) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/52b67fd4-58b7-42fe-bb56-c406287f7fc9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navbar.tsx:47',message:'Filtering nav item',data:{label:item.label,href:item.href,requiresAuth:item.requiresAuth,authStatus:status,hasSession:!!session},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (item.requiresAuth === true) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/52b67fd4-58b7-42fe-bb56-c406287f7fc9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navbar.tsx:50',message:'Checking auth requirement',data:{label:item.label,status:status,willShow:status==="authenticated"},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return status === "authenticated";
    }
    if (item.label === "Sign In") {
      return status === "unauthenticated";
    }
    return true;
  });

  // Set active index based on current pathname
  useEffect(() => {
    const currentIndex = filteredNavItems.findIndex(
      (item) => item.href === pathname || pathname.startsWith(item.href + "/")
    );
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [pathname, filteredNavItems]);

  const handleNavClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
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
          {/* Logo/Brand - Mobile optimized */}
          <div className="flex items-center flex-shrink-0">
            <Link
              href="/"
              className="text-black text-base md:text-xl font-semibold hover:text-gray-700 transition-colors duration-300 ease-in-out whitespace-nowrap"
            >
              Quran.co.in
            </Link>
          </div>

          {/* Navigation Items - Mobile optimized */}
          <div className="flex items-center gap-0.5 md:gap-1 flex-1 justify-end">
            {filteredNavItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeIndex === idx || pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    // #region agent log
                    fetch('http://127.0.0.1:7244/ingest/52b67fd4-58b7-42fe-bb56-c406287f7fc9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navbar.tsx:106',message:'Nav item clicked',data:{label:item.label,href:item.href,index:idx},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                    handleNavClick(idx);
                  }}
                  aria-label={item.label}
                  className="flex-shrink-0"
                >
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "flex items-center gap-0 md:gap-0 px-2.5 md:px-4 py-1.5 md:py-2 rounded-full transition-all duration-300 ease-in-out relative h-9 md:h-10 min-w-[36px] md:min-w-[44px] min-h-[36px] md:min-h-[40px] max-h-[36px] md:max-h-[44px] cursor-pointer",
                      isActive
                        ? "bg-gray-100/80 md:bg-gray-100/60 text-black gap-1 md:gap-2 shadow-sm"
                        : "bg-transparent text-gray-600 hover:bg-gray-100/60 hover:text-gray-900",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-full",
                    )}
                  >
                  <Icon
                    size={18}
                    strokeWidth={2}
                    aria-hidden
                    className="transition-all duration-300 ease-in-out md:w-5 md:h-5"
                  />

                  {/* Label - Only shown on desktop */}
                  <motion.div
                    initial={false}
                    animate={{
                      width: isActive ? `${MOBILE_LABEL_WIDTH}px` : "0px",
                      opacity: isActive ? 1 : 0,
                      marginLeft: isActive ? "8px" : "0px",
                    }}
                    transition={{
                      width: { type: "spring", stiffness: 400, damping: 35 },
                      opacity: { duration: 0.25, ease: "easeInOut" },
                      marginLeft: { duration: 0.25, ease: "easeInOut" },
                    }}
                    className={cn("overflow-hidden items-center max-w-[72px] hidden md:flex")}
                  >
                    <span
                      className={cn(
                        "font-medium text-xs whitespace-nowrap select-none transition-opacity duration-300 ease-in-out overflow-hidden text-ellipsis",
                        isActive ? "text-black" : "opacity-0",
                      )}
                      title={item.label}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                </motion.div>
                </Link>
              );
            })}
            
            {/* Sign Out Button - Only for authenticated users */}
            {status === "authenticated" && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  // #region agent log
                  fetch('http://127.0.0.1:7244/ingest/52b67fd4-58b7-42fe-bb56-c406287f7fc9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navbar.tsx:170',message:'Sign out clicked',data:{},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                  // #endregion
                  signOut({ callbackUrl: '/' });
                }}
                aria-label="Sign Out"
                className={cn(
                  "flex items-center gap-0 md:gap-0 px-2.5 md:px-4 py-1.5 md:py-2 rounded-full transition-all duration-300 ease-in-out relative h-9 md:h-10 min-w-[36px] md:min-w-[44px] min-h-[36px] md:min-h-[40px] max-h-[36px] md:max-h-[44px] cursor-pointer",
                  "bg-transparent text-gray-600 hover:bg-red-50 hover:text-red-600",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-full",
                )}
              >
                <LogOut
                  size={18}
                  strokeWidth={2}
                  aria-hidden
                  className="transition-all duration-300 ease-in-out md:w-5 md:h-5"
                />
                {/* Label - Only shown on desktop when active */}
                <motion.div
                  initial={false}
                  animate={{
                    width: "0px",
                    opacity: 0,
                  }}
                  className={cn("overflow-hidden items-center max-w-[72px] hidden md:flex")}
                >
                  <span className="font-medium text-xs whitespace-nowrap select-none">
                    Sign Out
                  </span>
                </motion.div>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
