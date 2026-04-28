import { useState, useEffect } from "react";
import api from "@/lib/axios";

export type Badge = {
  id: number;
  name: string;
  description: string;
  icon: string;
  pivot: {
    earned_at: string;
  };
};

export const useProfile = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBadges = async () => {
    try {
      const res = await api.get("/api/study/badges");
      setBadges(res.data);
    } catch {
      console.error("バッジ取得エラー");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (formData: FormData) => {
    try {
      await api.post("/api/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch {
      console.error("プロフィール保存エラー");
    }
  };

  const deleteProfile = async () => {
    try {
      await api.delete("/api/profile");
    } catch {
      console.error("プロフィール削除エラー");
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchBadges();
    };
    init();
  }, []);

  return {
    badges,
    loading,
    fetchBadges,
    saveProfile,
    deleteProfile,
  };
};
