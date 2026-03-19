"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function Navigation() {
  const { user, logout, themeColor } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { href: "/calendar", label: "カレンダー", icon: "📅" },
    { href: "/tasks", label: "タスク", icon: "✅" },
    { href: "/study", label: "学習", icon: "⏱️" },
    { href: "/mypage", label: "マイページ", icon: "👤" },
  ];

  return (
    <nav
      className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between"
      style={{
        backgroundColor: hexToRgba(themeColor, 0.07), // ← 淡い色のバック
        borderColor: hexToRgba(themeColor, 0.2),
      }}
    >
      {/* ロゴ */}
      <Link
        href="/calendar"
        className="text-xl font-bold transition-colors"
        style={{ color: themeColor }}
      >
        🏠 Life Dashboard
      </Link>

      {/* ナビリンク */}
      <div className="flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-1 text-sm font-medium transition-colors"
            style={{
              color: themeColor, // ← 全部テーマカラーに変更
              borderBottom:
                pathname === item.href
                  ? `2px solid ${themeColor}`
                  : "2px solid transparent", // ← 開いてるページだけアンダーライン
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* ユーザー情報・ログアウト */}
      <div className="flex items-center gap-4">
        {user && (
          <span
            className="text-sm font-semibold" // ← 太文字に変更
            style={{ color: themeColor }} // ← テーマカラーに変更
          >
            {user.name}
          </span>
        )}
        <button
          onClick={logout}
          className="text-sm text-white px-4 py-2 rounded-lg transition opacity-90 hover:opacity-100"
          style={{ backgroundColor: themeColor }}
        >
          ログアウト
        </button>
      </div>
    </nav>
  );
}
