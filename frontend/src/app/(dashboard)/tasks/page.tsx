"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

type TaskFolder = {
  id: number;
  name: string;
  due_date: string | null;
  created_at: string;
};

// 期限の状態を返す関数
const getDueDateStatus = (dueDate: string | null) => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  const diffDays = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) return { label: "期限切れ", color: "#EF4444" };
  if (diffDays === 0) return { label: "今日が期限！", color: "#F97316" };
  if (diffDays <= 3) return { label: `あと${diffDays}日`, color: "#F97316" };
  return { label: `あと${diffDays}日`, color: "#6B7280" };
};

export default function TasksPage() {
  const { themeColor } = useAuth();
  const router = useRouter();

  const [folders, setFolders] = useState<TaskFolder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFolders = async () => {
    try {
      const res = await api.get("/api/folders");
      setFolders(res.data);
    } catch {
      console.error("フォルダ取得エラー");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await api.post("/api/folders", {
        name: newFolderName,
        due_date: newDueDate || null,
      });
      setNewFolderName("");
      setNewDueDate("");
      fetchFolders();
    } catch {
      console.error("フォルダ作成エラー");
    }
  };

  const handleDeleteFolder = async (id: number) => {
    if (
      !confirm("このフォルダを削除しますか？\n中のタスクも全て削除されます。")
    )
      return;
    try {
      await api.delete(`/api/folders/${id}`);
      fetchFolders();
    } catch {
      console.error("フォルダ削除エラー");
    }
  };

  const handleUpdateFolder = async (id: number) => {
    if (!editingName.trim()) return;
    try {
      await api.put(`/api/folders/${id}`, {
        name: editingName,
        due_date: editingDueDate || null,
      });
      setEditingId(null);
      setEditingName("");
      setEditingDueDate("");
      fetchFolders();
    } catch {
      console.error("フォルダ更新エラー");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">読み込み中...</div>
    );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">タスク</h1>

      {/* フォルダ作成 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 space-y-3">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
          placeholder="新しいフォルダ名を入力"
        />
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-500 whitespace-nowrap">
            期限日（任意）
          </label>
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
          />
          <button
            onClick={handleCreateFolder}
            className="text-white px-4 py-2 rounded-lg transition opacity-90 hover:opacity-100 whitespace-nowrap"
            style={{ backgroundColor: themeColor }}
          >
            作成
          </button>
        </div>
      </div>

      {/* フォルダ一覧 */}
      {folders.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-4xl mb-3">📂</p>
          <p>フォルダがありません</p>
          <p className="text-sm mt-1">
            上のフォームからフォルダを作成してください
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {folders.map((folder) => {
            const status = getDueDateStatus(folder.due_date);
            return (
              <div
                key={folder.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
              >
                {editingId === folder.id ? (
                  // 編集モード
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                      autoFocus
                    />
                    <div className="flex gap-2 items-center">
                      <label className="text-sm text-gray-500 whitespace-nowrap">
                        期限日
                      </label>
                      <input
                        type="date"
                        value={editingDueDate}
                        onChange={(e) => setEditingDueDate(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateFolder(folder.id)}
                        className="text-white px-3 py-1 rounded-lg text-sm"
                        style={{ backgroundColor: themeColor }}
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  // 通常モード
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push(`/tasks/${folder.id}`)}
                      className="flex-1 flex items-center gap-3 text-left"
                    >
                      <span className="text-2xl">📁</span>
                      <div>
                        <p className="font-medium text-gray-700">
                          {folder.name}
                        </p>
                        {folder.due_date && status && (
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: status.color }}
                          >
                            📅 期限:{" "}
                            {new Date(folder.due_date).toLocaleDateString(
                              "ja-JP",
                            )}
                            　{status.label}
                          </p>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(folder.id);
                        setEditingName(folder.name);
                        setEditingDueDate(folder.due_date || "");
                      }}
                      className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded transition"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="text-gray-400 hover:text-red-500 px-2 py-1 rounded transition"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
