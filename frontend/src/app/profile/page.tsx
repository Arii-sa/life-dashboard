"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

const THEME_COLORS = [
  { label: "ブルー", value: "#3B82F6" },
  { label: "グリーン", value: "#10B981" },
  { label: "パープル", value: "#8B5CF6" },
  { label: "ピンク", value: "#EC4899" },
  { label: "オレンジ", value: "#F97316" },
  { label: "レッド", value: "#EF4444" },
];
export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [goal, setGoal] = useState("");
  const [memo, setMemo] = useState("");
  const [themeColor, setThemeColor] = useState("#3B82F6");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    // 既存プロフィールを取得
    if (user) {
      api
        .get("/api/profile")
        .then((res) => {
          if (res.data) {
            setUsername(res.data.username || "");
            setGoal(res.data.goal || "");
            setMemo(res.data.memo || "");
            setThemeColor(res.data.theme_color || "#3B82F6");
            if (res.data.avatar) {
              setAvatarPreview(
                `http://localhost:8000/storage/${res.data.avatar}`,
              );
            }
          }
        })
        .catch(() => {});
    }
  }, [user, loading, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("goal", goal);
      formData.append("memo", memo);
      formData.append("theme_color", themeColor);
      if (avatar) formData.append("avatar", avatar);

      await api.post("/api/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/calendar");
    } catch {
      setError("保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        読み込み中...
      </div>
    );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          プロフィール設定
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          後からマイページで変更できます
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* アイコン画像 */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center"
              style={{
                borderColor: themeColor,
                borderWidth: 3,
                borderStyle: "solid",
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-4xl">👤</span>
              )}
            </div>
            <label className="cursor-pointer text-sm text-blue-500 hover:underline">
              画像を選択
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          {/* ユーザー名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ユーザー名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: アリサ"
            />
          </div>

          {/* 目標 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目標
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 毎日1時間勉強する"
              rows={3}
            />
          </div>

          {/* 一言メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              一言メモ（名言など）
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 継続は力なり"
              rows={2}
            />
          </div>

          {/* テーマカラー */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              テーマカラー
            </label>
            <div className="flex gap-3 flex-wrap">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setThemeColor(color.value)}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color.value,
                    outline:
                      themeColor === color.value
                        ? `3px solid ${color.value}`
                        : "none",
                    outlineOffset: "2px",
                  }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
              style={{ backgroundColor: themeColor }}
            >
              {saving ? "保存中..." : "保存してはじめる"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/calendar")}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2 rounded-lg transition"
            >
              スキップ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
