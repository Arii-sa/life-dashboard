"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";

type Task = {
  id: number;
  title: string;
  is_done: boolean;
};

type TaskFolder = {
  id: number;
  name: string;
};

export default function TaskDetailPage() {
  const { themeColor } = useAuth();
  const params = useParams();
  const router = useRouter();
  const folderId = params.folderId as string;

  const [folder, setFolder] = useState<TaskFolder | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");
  const [loading, setLoading] = useState(true);

  // タスク一覧取得
  const fetchTasks = async () => {
    try {
      const [folderRes, tasksRes] = await Promise.all([
        api.get(`/api/folders`),
        api.get(`/api/folders/${folderId}/tasks`),
      ]);
      const currentFolder = folderRes.data.find(
        (f: TaskFolder) => f.id === Number(folderId),
      );
      setFolder(currentFolder || null);
      setTasks(tasksRes.data);
    } catch {
      console.error("タスク取得エラー");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [folderId]);

  // タスク作成
  const handleCreateTask = async () => {
    if (!newTitle.trim()) return;
    try {
      await api.post(`/api/folders/${folderId}/tasks`, { title: newTitle });
      setNewTitle("");
      fetchTasks();
    } catch {
      console.error("タスク作成エラー");
    }
  };

  // 完了切り替え
  const handleToggleDone = async (task: Task) => {
    try {
      await api.put(`/api/tasks/${task.id}`, { is_done: !task.is_done });
      fetchTasks();
    } catch {
      console.error("タスク更新エラー");
    }
  };

  // タスク名編集
  const handleUpdateTask = async (id: number) => {
    if (!editingTitle.trim()) return;
    try {
      await api.put(`/api/tasks/${id}`, { title: editingTitle });
      setEditingId(null);
      setEditingTitle("");
      fetchTasks();
    } catch {
      console.error("タスク更新エラー");
    }
  };

  // タスク削除
  const handleDeleteTask = async (id: number) => {
    if (!confirm("このタスクを削除しますか？")) return;
    try {
      await api.delete(`/api/tasks/${id}`);
      fetchTasks();
    } catch {
      console.error("タスク削除エラー");
    }
  };

  // フィルター
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
    <div className="max-w-2xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/tasks")}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          📁 {folder?.name || "フォルダ"}
        </h1>
      </div>

      {/* タスク作成 */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
          placeholder="新しいタスクを入力"
        />
        <button
          onClick={handleCreateTask}
          className="text-white px-4 py-2 rounded-lg transition opacity-90 hover:opacity-100"
          style={{ backgroundColor: themeColor }}
        >
          追加
        </button>
      </div>

      {/* フィルタータグ */}
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

      {/* タスク一覧 */}
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
                // 編集モード
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleUpdateTask(task.id)
                    }
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdateTask(task.id)}
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
                // 通常モード
                <>
                  {/* 完了チェックボックス */}
                  <button
                    onClick={() => handleToggleDone(task)}
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

                  {/* タスク名 */}
                  <span
                    className={`flex-1 text-sm ${task.is_done ? "line-through text-gray-400" : "text-gray-700"}`}
                  >
                    {task.title}
                  </span>

                  {/* 編集・削除 */}
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
                    onClick={() => handleDeleteTask(task.id)}
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
