"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { useTasks } from "@/hooks/useTask";

export default function TaskDetailPage() {
  const { themeColor } = useAuth();
  const params = useParams();
  const router = useRouter();
  const folderId = params.folderId as string;

  const { tasks, folder, loading, createTask, updateTask, deleteTask } =
    useTasks(folderId);

  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createTask(newTitle);
    setNewTitle("");
  };

  const handleUpdate = async (id: number) => {
    if (!editingTitle.trim()) return;
    await updateTask(id, { title: editingTitle });
    setEditingId(null);
    setEditingTitle("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("このタスクを削除しますか？")) return;
    await deleteTask(id);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "todo") return !task.is_done;
    if (filter === "done") return task.is_done;
    return true;
  });

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
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/tasks")}
          className="transition font-medium"
          style={{ color: themeColor }}
        >
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          📁 {folder?.name || "フォルダ"}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
          placeholder="新しいタスクを入力"
        />
        <button
          onClick={handleCreate}
          className="text-white px-4 py-2 rounded-lg transition opacity-90 hover:opacity-100"
          style={{ backgroundColor: themeColor }}
        >
          追加
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(["all", "todo", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1 rounded-full text-sm font-medium transition"
            style={{
              backgroundColor: filter === f ? themeColor : "#F3F4F6",
              color: filter === f ? "white" : "#6B7280",
            }}
          >
            {f === "all" ? "すべて" : f === "todo" ? "未完了" : "完了済み"}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-4xl mb-3">✅</p>
          <p>タスクがありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3"
            >
              {editingId === task.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleUpdate(task.id)
                    }
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdate(task.id)}
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
              ) : (
                <>
                  <button
                    onClick={() =>
                      updateTask(task.id, { is_done: !task.is_done })
                    }
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition flex-shrink-0"
                    style={{
                      borderColor: task.is_done ? themeColor : "#D1D5DB",
                      backgroundColor: task.is_done ? themeColor : "white",
                    }}
                  >
                    {task.is_done && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm ${task.is_done ? "line-through text-gray-400" : "text-gray-700"}`}
                  >
                    {task.title}
                  </span>
                  <button
                    onClick={() => {
                      setEditingId(task.id);
                      setEditingTitle(task.title);
                    }}
                    className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded transition"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-gray-400 hover:text-red-500 px-2 py-1 rounded transition"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
