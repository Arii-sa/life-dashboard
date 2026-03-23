"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";

type Badge = {
  id: number;
  name: string;
  description: string;
  icon: string;
};

type WeeklyStats = {
  daily_total: number;
  weekly_total: number;
};

type Goals = {
  daily_goal: number;
  weekly_goal: number;
};

// 秒を時間・分・秒に変換
const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// 秒を時間・分で表示
const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}時間${m > 0 ? `${m}分` : ""}`;
  return `${m}分`;
};

export default function StudyPage() {
  const { themeColor, elapsed, isRunning, startTimer, pauseTimer, resetTimer } =
    useAuth(); // ← 変更

  const [stats, setStats] = useState<WeeklyStats>({
    daily_total: 0,
    weekly_total: 0,
  });
  const [goals, setGoals] = useState<Goals>({
    daily_goal: 3600,
    weekly_goal: 18000,
  });
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [dailyGoalInput, setDailyGoalInput] = useState("60");
  const [weeklyGoalInput, setWeeklyGoalInput] = useState("300");

  const fetchStats = async () => {
    try {
      const [statsRes, goalsRes] = await Promise.all([
        api.get("/api/study/stats"),
        api.get("/api/study/goals"),
      ]);
      setStats(statsRes.data);
      setGoals(goalsRes.data);
      setDailyGoalInput(String(goalsRes.data.daily_goal / 60));
      setWeeklyGoalInput(String(goalsRes.data.weekly_goal / 60));
    } catch {
      console.error("統計取得エラー");
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchStats();
    };
    init();
  }, []);

  // タイマー停止＆記録保存
  const handleStop = async () => {
    if (elapsed < 60) {
      alert("1分以上学習してから記録してください！");
      return;
    }
    pauseTimer(); // ← 変更

    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await api.post("/api/study", {
        duration: elapsed,
        study_date: today,
      });

      resetTimer(); // ← 変更
      await fetchStats();

      if (res.data.new_badges?.length > 0) {
        setNewBadges(res.data.new_badges);
      }
    } catch {
      console.error("記録保存エラー");
    }
  };

  // 目標更新
  const handleUpdateGoals = async () => {
    try {
      await api.put("/api/study/goals", {
        daily_goal: Number(dailyGoalInput) * 60,
        weekly_goal: Number(weeklyGoalInput) * 60,
      });
      setShowGoalForm(false);
      await fetchStats();
    } catch {
      console.error("目標更新エラー");
    }
  };

  const dailyProgress = Math.min(
    (stats.daily_total / goals.daily_goal) * 100,
    100,
  );
  const weeklyProgress = Math.min(
    (stats.weekly_total / goals.weekly_goal) * 100,
    100,
  );

  return (
    <div
      className="max-w-4xl mx-auto rounded-2xl p-6 space-y-6"
      style={{
        backgroundColor: `rgba(${parseInt(themeColor.slice(1, 3), 16)}, ${parseInt(themeColor.slice(3, 5), 16)}, ${parseInt(themeColor.slice(5, 7), 16)}, 0.07)`,
      }}
    >
      <h1
        className="text-4xl mb-4"
        style={{ fontFamily: "var(--font-dancing-script)", color: themeColor }}
      >
        Study Timer
      </h1>

      {/* バッジ獲得通知 */}
      {newBadges.length > 0 && (
        <div
          className="rounded-2xl p-4 text-white text-center mb-4"
          style={{ backgroundColor: themeColor }}
        >
          <p className="text-lg font-bold mb-2">🎉 バッジを獲得しました！</p>
          <div className="flex gap-3 justify-center flex-wrap">
            {newBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white bg-opacity-20 rounded-xl px-4 py-2"
              >
                <p className="text-2xl">{badge.icon}</p>
                <p className="text-sm font-semibold">{badge.name}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setNewBadges([])}
            className="mt-3 text-sm underline opacity-80"
          >
            閉じる
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* 目標設定（左半分） */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-1/2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">目標設定</h2>
            <button
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="text-sm px-3 py-1 rounded-lg"
              style={{ color: themeColor }}
            >
              {showGoalForm ? "閉じる" : "編集"}
            </button>
          </div>

          {showGoalForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1日の目標（分）
                </label>
                <input
                  type="number"
                  value={dailyGoalInput}
                  onChange={(e) => setDailyGoalInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1週間の目標（分）
                </label>
                <input
                  type="number"
                  value={weeklyGoalInput}
                  onChange={(e) => setWeeklyGoalInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                  min="1"
                />
              </div>
              <button
                onClick={handleUpdateGoals}
                className="w-full text-white py-2 rounded-lg font-semibold"
                style={{ backgroundColor: themeColor }}
              >
                保存
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">1日の目標</p>
                <p className="font-bold text-gray-800">
                  {formatDuration(goals.daily_goal)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">1週間の目標</p>
                <p className="font-bold text-gray-800">
                  {formatDuration(goals.weekly_goal)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* タイマー（右半分） */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-1/2 flex flex-col items-center justify-center text-center">
          <div
            className="text-5xl font-mono font-bold mb-6"
            style={{ color: themeColor }}
          >
            {formatTime(elapsed)}
          </div>

          <div className="flex flex-col gap-3 w-full">
            {!isRunning ? (
              <button
                onClick={startTimer} // ← 変更
                className="text-white px-6 py-2 rounded-xl font-semibold transition opacity-90 hover:opacity-100"
                style={{ backgroundColor: themeColor }}
              >
                ▶ スタート
              </button>
            ) : (
              <button
                onClick={pauseTimer} // ← 変更
                className="bg-yellow-400 text-white px-6 py-2 rounded-xl font-semibold transition hover:bg-yellow-500"
              >
                ⏸ 一時停止
              </button>
            )}
            {elapsed > 0 && !isRunning && (
              <>
                <button
                  onClick={handleStop}
                  className="text-white px-6 py-2 rounded-xl font-semibold transition"
                  style={{ backgroundColor: themeColor }}
                >
                  💾 記録する
                </button>
                <button
                  onClick={resetTimer} // ← 変更
                  className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl font-semibold transition hover:bg-gray-200"
                >
                  リセット
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 今日の進捗 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-800">今日の学習</h2>
          <span className="text-sm text-gray-500">
            {formatDuration(stats.daily_total)} /{" "}
            {formatDuration(goals.daily_goal)}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4">
          <div
            className="h-4 rounded-full transition-all duration-500"
            style={{
              width: `${dailyProgress}%`,
              backgroundColor: themeColor,
            }}
          />
        </div>
        {dailyProgress >= 100 && (
          <p
            className="text-sm mt-2 font-semibold"
            style={{ color: themeColor }}
          >
            🎉 今日の目標達成！
          </p>
        )}
      </div>

      {/* 今週の進捗 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-800">今週の学習</h2>
          <span className="text-sm text-gray-500">
            {formatDuration(stats.weekly_total)} /{" "}
            {formatDuration(goals.weekly_goal)}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4">
          <div
            className="h-4 rounded-full transition-all duration-500"
            style={{
              width: `${weeklyProgress}%`,
              backgroundColor: themeColor,
            }}
          />
        </div>
        {weeklyProgress >= 100 && (
          <p
            className="text-sm mt-2 font-semibold"
            style={{ color: themeColor }}
          >
            🏆 今週の目標達成！
          </p>
        )}
      </div>
    </div>
  );
}
