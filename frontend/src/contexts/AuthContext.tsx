"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
};

type Profile = {
  username: string | null;
  avatar: string | null;
  goal: string | null;
  memo: string | null;
  theme_color: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  themeColor: string;
  loading: boolean;
  // タイマー
  elapsed: number;
  isRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  // 認証
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const DEFAULT_COLOR = "#3B82F6";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const themeColor = profile?.theme_color || DEFAULT_COLOR;

  // タイマーの状態をlocalStorageから復元
  useEffect(() => {
    const savedElapsed = localStorage.getItem("timer_elapsed");
    const savedIsRunning = localStorage.getItem("timer_is_running");
    const savedStartedAt = localStorage.getItem("timer_started_at");

    if (savedElapsed) {
      let restoredElapsed = parseInt(savedElapsed);

      // 動いていた場合は経過時間を計算して加算
      if (savedIsRunning === "true" && savedStartedAt) {
        const startedAt = parseInt(savedStartedAt);
        const additionalSeconds = Math.floor((Date.now() - startedAt) / 1000);
        restoredElapsed += additionalSeconds;
        setIsRunning(true);
      }

      setElapsed(restoredElapsed);
    }
  }, []);

  // タイマーが動いているときlocalStorageに保存
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          localStorage.setItem("timer_elapsed", String(next));
          return next;
        });
      }, 1000);
      localStorage.setItem("timer_is_running", "true");
      localStorage.setItem("timer_started_at", String(Date.now()));
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      localStorage.setItem("timer_is_running", "false");
      localStorage.removeItem("timer_started_at");
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setElapsed(0);
    localStorage.removeItem("timer_elapsed");
    localStorage.removeItem("timer_is_running");
    localStorage.removeItem("timer_started_at");
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/profile");
      if (res.data) setProfile(res.data);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/api/me");
          setUser(res.data);
          await fetchProfile();
        } catch {
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
  ) => {
    const res = await api.post("/api/register", {
      name,
      email,
      password,
      password_confirmation,
    });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    router.push("/profile");
  };

  const login = async (email: string, password: string) => {
    const res = await api.post("/api/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    await fetchProfile();
    router.push("/calendar");
  };

  const logout = async () => {
    try {
      await api.post("/api/logout");
    } catch {
      // エラーでも無視してログアウト処理を続行
    }
    // タイマーもリセット
    setIsRunning(false);
    setElapsed(0);
    localStorage.removeItem("token");
    localStorage.removeItem("timer_elapsed");
    localStorage.removeItem("timer_is_running");
    localStorage.removeItem("timer_started_at");
    setUser(null);
    setProfile(null);
    router.push("/login");
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        themeColor,
        loading,
        elapsed,
        isRunning,
        startTimer,
        pauseTimer,
        resetTimer,
        register,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
