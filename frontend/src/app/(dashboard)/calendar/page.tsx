"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from "@fullcalendar/core/locales/ja";
import api from "@/lib/axios";

type CalendarEvent = {
  id: number;
  title: string;
  memo: string | null;
  start_date: string;
  end_date: string | null;
  is_reminder: boolean;
  reminder_time: string | null;
};

type ModalState = {
  open: boolean;
  mode: "create" | "edit";
  date: string;
  event: CalendarEvent | null;
};

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function CalendarPage() {
  const { themeColor } = useAuth();
  const calendarRef = useRef<FullCalendar>(null);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: "create",
    date: "",
    event: null,
  });

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isReminder, setIsReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState("");

  const fetchEvents = async () => {
    try {
      const res = await api.get("/api/calendar");
      setEvents(res.data);
    } catch {
      console.error("イベント取得エラー");
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchEvents();
    };
    init();
  }, []);

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      events.forEach((event) => {
        if (
          event.is_reminder &&
          event.reminder_time &&
          event.start_date === today &&
          event.reminder_time.slice(0, 5) === currentTime
        ) {
          new Notification(`📅 ${event.title}`, {
            body: event.memo || "予定の時間になりました！",
          });
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [events]);

  const handleDateClick = (info: { dateStr: string }) => {
    setModal({ open: true, mode: "create", date: info.dateStr, event: null });
    setTitle("");
    setMemo("");
    setStartDate(info.dateStr);
    setEndDate("");
    setIsReminder(false);
    setReminderTime("");
  };

  const handleEventClick = (info: { event: { id: string } }) => {
    const event = events.find((e) => e.id === Number(info.event.id));
    if (!event) return;
    setModal({ open: true, mode: "edit", date: event.start_date, event });
    setTitle(event.title);
    setMemo(event.memo || "");
    setStartDate(event.start_date);
    setEndDate(event.end_date || "");
    setIsReminder(event.is_reminder);
    setReminderTime(event.reminder_time?.slice(0, 5) || "");
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    try {
      const data = {
        title,
        memo: memo || null,
        start_date: startDate,
        end_date: endDate || null,
        is_reminder: isReminder,
        reminder_time: isReminder ? reminderTime : null,
      };

      if (modal.mode === "create") {
        await api.post("/api/calendar", data);
      } else if (modal.event) {
        await api.put(`/api/calendar/${modal.event.id}`, data);
      }

      setModal({ ...modal, open: false });
      fetchEvents();
    } catch {
      console.error("保存エラー");
    }
  };

  const handleDelete = async () => {
    if (!modal.event) return;
    if (!confirm("この予定を削除しますか？")) return;
    try {
      await api.delete(`/api/calendar/${modal.event.id}`);
      setModal({ ...modal, open: false });
      fetchEvents();
    } catch {
      console.error("削除エラー");
    }
  };

  const calendarEvents = [
    ...events.map((e) => ({
      id: String(e.id),
      title: e.title,
      start: e.start_date,
      end: e.end_date || e.start_date,
      allDay: true,
      backgroundColor: themeColor,
      borderColor: themeColor,
    })),
  ];

  return (
    <div
      className="max-w-4xl mx-auto rounded-2xl p-4"
      style={{ backgroundColor: hexToRgba(themeColor, 0.07) }} // ← 淡い背景色
    >
      <h1
        className="text-4xl mb-6"
        style={{
          fontFamily: "var(--font-dancing-script)",
          color: themeColor,
        }}
      >
        My Calendar
      </h1>

      {/* FullCalendarのボタンカラーをCSSで上書き */}
      <style>{`
        .fc .fc-button {
          background-color: ${themeColor} !important;
          border-color: ${themeColor} !important;
          color: white !important;
        }
        .fc .fc-button:hover {
          opacity: 0.85;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: ${themeColor} !important;
          border-color: ${themeColor} !important;
          opacity: 0.75;
        }
        .fc .fc-today-button:disabled {
          background-color: ${themeColor} !important;
          border-color: ${themeColor} !important;
          opacity: 0.5;
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={jaLocale}
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "", // ← 「月」ボタンを非表示
          }}
          height="auto"
        />
      </div>

      {/* モーダル */}
      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {modal.mode === "create" ? "予定を追加" : "予定を編集"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                  placeholder="予定のタイトル"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メモ
                </label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                  placeholder="メモ（任意）"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    開始日
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    終了日（任意）
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isReminder}
                    onChange={(e) => setIsReminder(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    リマインダーを設定
                  </span>
                </label>
                {isReminder && (
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 text-white font-semibold py-2 rounded-lg transition"
                style={{ backgroundColor: themeColor }}
              >
                保存
              </button>
              {modal.mode === "edit" && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
                >
                  削除
                </button>
              )}
              <button
                onClick={() => setModal({ ...modal, open: false })}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
