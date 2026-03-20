"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";

type Badge = {
  id: number;
  name: string;
  description: string;
  icon: string;
  pivot: {
    earned_at: string;
  };
};

const THEME_COLORS = [
  { label: "ブルー", value: "#3B82F6" },
  { label: "グリーン", value: "#10B981" },
  { label: "パープル", value: "#8B5CF6" },
  { label: "ピンク", value: "#EC4899" },
  { label: "オレンジ", value: "#F97316" },
  { label: "レッド", value: "#EF4444" },
];

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function MyPage() {
  const { user, profile, themeColor, refreshProfile } = useAuth();

  const [username, setUsername] = useState("");
  const [goal, setGoal] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (profile) {
        setUsername(profile.username || "");
        setGoal(profile.goal || "");
        setMemo(profile.memo || "");
        setSelectedColor(profile.theme_color || "#3B82F6");
        if (profile.avatar) {
          setAvatarPreview(`http://localhost:8000/storage/${profile.avatar}`);
        }
      }
      try {
        const res = await api.get("/api/study/badges");
        setBadges(res.data);
      } catch {
        console.error("バッジ取得エラー");
      }
    };
    init();
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("goal", goal);
      formData.append("memo", memo);
      formData.append("theme_color", selectedColor);
      if (avatar) formData.append("avatar", avatar);

      await api.post("/api/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshProfile();
      setIsEditing(false);
    } catch {
      console.error("保存エラー");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("プロフィールを削除しますか？")) return;
    try {
      await api.delete("/api/profile");
      await refreshProfile();
      setAvatarPreview(null);
      setUsername("");
      setGoal("");
      setMemo("");
      setSelectedColor("#3B82F6");
      setIsEditing(false);
    } catch {
      console.error("削除エラー");
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto rounded-2xl p-6 space-y-6"
      style={{ backgroundColor: hexToRgba(themeColor, 0.07) }}
    >
      <h1
        className="text-4xl"
        style={{ fontFamily: "var(--font-dancing-script)", color: themeColor }}
      >
        My Page
      </h1>

      {/* プロフィールカード */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-gray-800 text-lg">プロフィール</h2>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: themeColor }}
              >
                編集
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm px-4 py-2 rounded-lg text-white disabled:opacity-50"
                  style={{ backgroundColor: themeColor }}
                >
                  {saving ? "保存中..." : "保存"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-sm px-4 py-2 rounded-lg bg-gray-100 text-gray-600"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDelete}
                  className="text-sm px-4 py-2 rounded-lg bg-red-50 text-red-500"
                >
                  削除
                </button>
              </>
            )}
          </div>
        </div>

        {/* 上段：アイコン + ユーザー名 横並び */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center"
              style={{
                borderColor: themeColor,
                borderWidth: 3,
                borderStyle: "solid",
              }}
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-4xl">👤</span>
              )}
            </div>
            {isEditing && (
              <label
                className="cursor-pointer text-xs hover:underline"
                style={{ color: themeColor }}
              >
                画像を変更
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* ユーザー名（アイコンと同じ高さに合わせて大きく） */}
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-2xl font-bold focus:outline-none"
                placeholder="ユーザー名を入力"
              />
            ) : (
              <p className="text-5xl font-bold" style={{ color: themeColor }}>
                {username || user?.name || "未設定"}
              </p>
            )}
          </div>
        </div>

        {/* 下段：目標・一言メモ */}
        <div className="space-y-4">
          {/* 目標 */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: hexToRgba(themeColor, 0.07) }}
          >
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: themeColor }}
            >
              🎯 目標
            </label>
            {isEditing ? (
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-transparent border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                placeholder="目標を入力"
                rows={2}
              />
            ) : (
              <p className="text-gray-800">{goal || "未設定"}</p>
            )}
          </div>

          {/* 一言メモ */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: hexToRgba(themeColor, 0.07) }}
          >
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: themeColor }}
            >
              💬 一言メモ
            </label>
            {isEditing ? (
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full bg-transparent border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                placeholder="名言など"
                rows={2}
              />
            ) : (
              <p className="text-gray-800 italic text-lg">
                {memo ? `"${memo}"` : "未設定"}
              </p>
            )}
          </div>

          {/* テーマカラー */}
          {isEditing && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                テーマカラー
              </label>
              <div className="flex gap-2 flex-wrap">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color.value,
                      outline:
                        selectedColor === color.value
                          ? `3px solid ${color.value}`
                          : "none",
                      outlineOffset: "2px",
                    }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* バッジ一覧 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-800 text-lg mb-4">🏅 獲得バッジ</h2>
        {badges.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-4xl mb-2">🎯</p>
            <p>まだバッジがありません</p>
            <p className="text-sm mt-1">
              学習目標を達成するとバッジがもらえます！
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center p-4 rounded-xl text-center"
                style={{ backgroundColor: hexToRgba(themeColor, 0.07) }}
              >
                <span className="text-4xl mb-2">{badge.icon}</span>
                <p className="font-semibold text-sm text-gray-800">
                  {badge.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {badge.description}
                </p>
                <p className="text-xs mt-2" style={{ color: themeColor }}>
                  {new Date(badge.pivot.earned_at).toLocaleDateString("ja-JP")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
