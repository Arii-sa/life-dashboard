import { useState, useEffect } from "react";
import api from "@/lib/axios";

export type TaskFolder = {
  id: number;
  name: string;
  due_date: string | null;
  created_at: string;
};

export type Task = {
  id: number;
  title: string;
  is_done: boolean;
};

export const useTaskFolders = () => {
  const [folders, setFolders] = useState<TaskFolder[]>([]);
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

  const createFolder = async (name: string, dueDate?: string) => {
    try {
      await api.post("/api/folders", { name, due_date: dueDate || null });
      await fetchFolders();
    } catch {
      console.error("フォルダ作成エラー");
    }
  };

  const updateFolder = async (id: number, name: string, dueDate?: string) => {
    try {
      await api.put(`/api/folders/${id}`, { name, due_date: dueDate || null });
      await fetchFolders();
    } catch {
      console.error("フォルダ更新エラー");
    }
  };

  const deleteFolder = async (id: number) => {
    try {
      await api.delete(`/api/folders/${id}`);
      await fetchFolders();
    } catch {
      console.error("フォルダ削除エラー");
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchFolders();
    };
    init();
  }, []);

  return {
    folders,
    loading,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
  };
};

export const useTasks = (folderId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [folder, setFolder] = useState<TaskFolder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const [folderRes, tasksRes] = await Promise.all([
        api.get("/api/folders"),
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

  const createTask = async (title: string) => {
    try {
      await api.post(`/api/folders/${folderId}/tasks`, { title });
      await fetchTasks();
    } catch {
      console.error("タスク作成エラー");
    }
  };

  const updateTask = async (id: number, data: Partial<Task>) => {
    try {
      await api.put(`/api/tasks/${id}`, data);
      await fetchTasks();
    } catch {
      console.error("タスク更新エラー");
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      await fetchTasks();
    } catch {
      console.error("タスク削除エラー");
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchTasks();
    };
    init();
  }, [folderId]);

  return {
    tasks,
    folder,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
};
