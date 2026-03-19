"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
  const router = useRouter();

  const themeColor = profile?.theme_color || DEFAULT_COLOR;

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
      // エラーでも無視してログアウト処理を続行 ← ここがポイント
    }
    localStorage.removeItem("token"); // トークン削除
    setUser(null); // ユーザー情報をリセット
    setProfile(null); // プロフィールをリセット
    router.push("/login"); // ログイン画面へ
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
