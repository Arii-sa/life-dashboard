"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function CalendarPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">カレンダー</h1>
      <p className="text-gray-500">ようこそ、{user?.name}さん！</p>
      <p className="text-gray-400 mt-4">カレンダー機能は近日実装予定です</p>
    </div>
  );
}
