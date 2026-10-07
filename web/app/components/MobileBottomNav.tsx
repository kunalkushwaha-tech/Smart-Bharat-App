"use client";

type MobileBottomNavProps = {
  activeTab: "emergency" | "ai" | "complaints" | "security" | "academy";
  onNavigate: (tab: MobileBottomNavProps["activeTab"]) => void;
  isDark: boolean;
};

const tabs: Array<{ id: MobileBottomNavProps["activeTab"]; label: string; icon: string }> = [
  { id: "emergency", label: "Emergency", icon: "🚨" },
  { id: "ai", label: "AI", icon: "🤖" },
  { id: "complaints", label: "Complaints", icon: "📝" },
  { id: "security", label: "Security", icon: "🛡️" },
  { id: "academy", label: "Academy", icon: "🎓" },
];

export default function MobileBottomNav({ activeTab, onNavigate, isDark }: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Mobile section navigation"
      className={`fixed inset-x-0 bottom-0 z-50 flex h-16 border-t px-1 pb-[env(safe-area-inset-bottom)] md:hidden ${
        isDark ? "border-white/10 bg-[#0A1424]/95" : "border-[#0B1F3A]/10 bg-white/95"
      } backdrop-blur`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          aria-current={activeTab === tab.id ? "page" : undefined}
          onClick={() => onNavigate(tab.id)}
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
            activeTab === tab.id
              ? "text-[#FF9933]"
              : isDark
                ? "text-[#ECF2FA]/70"
                : "text-[#0B1F3A]/65"
          }`}
        >
          <span className="text-base leading-none">{tab.icon}</span>
          <span className="truncate">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
