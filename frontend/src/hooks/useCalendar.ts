import { useState, useEffect } from "react";
import api from "@/lib/axios";

export type CalendarEvent = {
  id: number;
  title: string;
  memo: string | null;
  start_date: string;
  end_date: string | null;
  is_reminder: boolean;
  reminder_time: string | null;
};

export const useCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/api/calendar");
      setEvents(res.data);
    } catch {
      console.error("イベント取得エラー");
    }
  };

  const createEvent = async (data: Partial<CalendarEvent>) => {
    try {
      await api.post("/api/calendar", data);
      await fetchEvents();
    } catch {
      console.error("イベント作成エラー");
    }
  };

  const updateEvent = async (id: number, data: Partial<CalendarEvent>) => {
    try {
      await api.put(`/api/calendar/${id}`, data);
      await fetchEvents();
    } catch {
      console.error("イベント更新エラー");
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      await api.delete(`/api/calendar/${id}`);
      await fetchEvents();
    } catch {
      console.error("イベント削除エラー");
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchEvents();
    };
    init();
  }, []);

  return {
    events,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
