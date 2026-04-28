import { useState, useEffect } from "react";
import api from "@/lib/axios";

export type DiaryImage = {
  id: number;
  image_path: string;
  order: number;
};

export type Diary = {
  id: number;
  title: string | null;
  content: string | null;
  diary_date: string;
  images: DiaryImage[];
};

export type DiaryDate = {
  diary_date: string;
  count: number;
};

export const useDiary = () => {
  const [diaryDates, setDiaryDates] = useState<DiaryDate[]>([]);

  const fetchDiaryDates = async () => {
    try {
      const res = await api.get("/api/diaries/dates");
      setDiaryDates(res.data);
    } catch {
      console.error("日記日付取得エラー");
    }
  };

  const fetchDiariesByDate = async (date: string): Promise<Diary[]> => {
    try {
      const res = await api.get(`/api/diaries/date/${date}`);
      return res.data;
    } catch {
      console.error("日記取得エラー");
      return [];
    }
  };

  const createDiary = async (formData: FormData) => {
    try {
      await api.post("/api/diaries", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchDiaryDates();
    } catch {
      console.error("日記作成エラー");
    }
  };

  const updateDiary = async (id: number, formData: FormData) => {
    try {
      await api.put(`/api/diaries/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchDiaryDates();
    } catch {
      console.error("日記更新エラー");
    }
  };

  const deleteDiary = async (id: number) => {
    try {
      await api.delete(`/api/diaries/${id}`);
      await fetchDiaryDates();
    } catch {
      console.error("日記削除エラー");
    }
  };

  const deleteDiaryImage = async (imageId: number) => {
    try {
      await api.delete(`/api/diary-images/${imageId}`);
    } catch {
      console.error("画像削除エラー");
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchDiaryDates();
    };
    init();
  }, []);

  return {
    diaryDates,
    fetchDiaryDates,
    fetchDiariesByDate,
    createDiary,
    updateDiary,
    deleteDiary,
    deleteDiaryImage,
  };
};
