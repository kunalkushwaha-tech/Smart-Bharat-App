"use client";

import { Bot, Home, Siren, ScanSearch } from "lucide-react";

type MobileBottomNavProps = {
  activeTab: "emergency" | "ai" | "complaints" | "security" | "academy";
  onNavigate: (tab: MobileBottomNavProps["activeTab"]) => void;
  onOpenAI: () => void;
  onOpenPanic: () => void;
  isDark: boolean;
};

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "scan", label: "Scan", icon: ScanSearch },
  { id: "ai", label: "AI", icon: Bot },
  { id: "panic", label: "Panic", icon: Siren },
];

export default function MobileBottomNav({ activeTab, onNavigate, onOpenAI, onOpenPanic, isDark }: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Mobile section navigation"
      className={`fixed inset-x-0 bottom-0 z-50 flex min-h-16 border-t px-1 pb-[env(safe-area-inset-bottom)] md:hidden backdrop-blur ${
        isDark ? "border-white/10 bg-[#0A1424]/95" : "border-[#0B1F3A]/10 bg-white/95"
      }`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          aria-label={tab.label}
          aria-current={activeTab === tab.id ? "page" : undefined}
          onClick={() => {
            if (tab.id === "ai") return onOpenAI();
            if (tab.id === "panic") return onOpenPanic();
            onNavigate(tab.id === "scan" ? "security" : "emergency");
          }}
          className={`relative flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
            tab.id === "panic"
              ? "mx-1 -mt-3 rounded-full bg-[#EF4444] text-white shadow-lg"
              : activeTab === tab.id
                ? "text-cyan-300"
              : isDark
                ? "text-[#ECF2FA]/70"
                : "text-[#0B1F3A]/65"
          }`}
        >
          <tab.icon className="h-5 w-5" aria-hidden="true" />
          <span className="truncate">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
