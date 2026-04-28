"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useTaskFolders } from "@/hooks/useTask";

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
  const { folders, loading, createFolder, updateFolder, deleteFolder } =
    useTaskFolders();

  const [newFolderName, setNewFolderName] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");

  const handleCreate = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName, newDueDate);
    setNewFolderName("");
    setNewDueDate("");
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    await updateFolder(id, editingName, editingDueDate);
    setEditingId(null);
    setEditingName("");
    setEditingDueDate("");
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm("このフォルダを削除しますか？\n中のタスクも全て削除されます。")
    )
      return;
    await deleteFolder(id);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">読み込み中...</div>
    );

  return (
    <div
      className="max-w-4xl mx-auto rounded-2xl p-6"
      style={{
        backgroundColor: `rgba(${parseInt(themeColor.slice(1, 3), 16)}, ${parseInt(themeColor.slice(3, 5), 16)}, ${parseInt(themeColor.slice(5, 7), 16)}, 0.07)`,
      }}
    >
      <h1
        className="text-4xl mb-4"
        style={{ fontFamily: "var(--font-dancing-script)", color: themeColor }}
      >
        My Tasks
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 space-y-3">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
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
            onClick={handleCreate}
            className="text-white px-4 py-2 rounded-lg transition opacity-90 hover:opacity-100 whitespace-nowrap"
            style={{ backgroundColor: themeColor }}
          >
            作成
          </button>
        </div>
      </div>

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
                        onClick={() => handleUpdate(folder.id)}
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
                      onClick={() => handleDelete(folder.id)}
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
