import { useState, useEffect } from "react";
import api from "@/lib/axios";

export type Badge = {
  id: number;
  name: string;
  description: string;
  icon: string;
};

export type WeeklyStats = {
  daily_total: number;
  weekly_total: number;
};

export type Goals = {
  daily_goal: number;
  weekly_goal: number;
};

export const useStudy = () => {
  const [stats, setStats] = useState<WeeklyStats>({
    daily_total: 0,
    weekly_total: 0,
  });
  const [goals, setGoals] = useState<Goals>({
    daily_goal: 3600,
    weekly_goal: 18000,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [statsRes, goalsRes] = await Promise.all([
        api.get("/api/study/stats"),
        api.get("/api/study/goals"),
      ]);
      setStats(statsRes.data);
      setGoals(goalsRes.data);
    } catch {
      console.error("統計取得エラー");
    } finally {
      setLoading(false);
    }
  };

  const saveRecord = async (
    duration: number,
    studyDate: string,
  ): Promise<Badge[]> => {
    try {
      const res = await api.post("/api/study", {
        duration,
        study_date: studyDate,
      });
      await fetchStats();
      return res.data.new_badges || [];
    } catch {
      console.error("記録保存エラー");
      return [];
    }
  };

  const updateGoals = async (dailyGoal: number, weeklyGoal: number) => {
    try {
      await api.put("/api/study/goals", {
        daily_goal: dailyGoal,
        weekly_goal: weeklyGoal,
      });
      await fetchStats();
    } catch {
      console.error("目標更新エラー");
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchStats();
    };
    init();
  }, []);

  return {
    stats,
    goals,
    loading,
    fetchStats,
    saveRecord,
    updateGoals,
  };
};
