"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Home, Compass, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "explore", label: "Explore", icon: Compass, href: "/explore" },
  { id: "chat", label: "Chat", icon: MessageCircle, href: "/chat" },
  { id: "profile", label: "Profile", icon: User, href: "/profile" },
];

export function JellyTabs() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const current = TABS.find((tab) => pathname === tab.href);
    if (current) {
      setActiveTab(current.id);
    }
  }, [pathname]);

  const activeIndex = TABS.findIndex((tab) => tab.id === activeTab);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <div className="bottom-3 left-1/2 z-50 fixed -translate-x-1/2">
      <div className="relative flex items-center gap-2 bg-surface/60 shadow-sm backdrop-blur-md p-1 rounded-full">
        <motion.div
          className="absolute inset-y-1 bg-white shadow-sm rounded-full w-20"
          animate={{ x: safeIndex * 88 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex flex-col justify-center items-center py-1 rounded-full w-20 transition-colors duration-300",
                isActive
                  ? "text-white dark:text-neutral-950"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={{
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span className="z-10 relative flex flex-col items-center gap-1">
                <Icon size={24} strokeWidth={2} />
                <span className="font-semibold text-xs leading-none tracking-wide">
                  {tab.label}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
    );
}
