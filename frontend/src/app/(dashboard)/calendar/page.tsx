"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCalendar, CalendarEvent } from "@/hooks/useCalendar";
import { useDiary, Diary } from "@/hooks/useDiary";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from "@fullcalendar/core/locales/ja";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useRef } from "react";
import FullCalendarType from "@fullcalendar/react";

type ModalType =
  | "select"
  | "event_create"
  | "event_edit"
  | "diary_create"
  | "diary_list"
  | "diary_detail"
  | "diary_edit";

type ModalState = {
  open: boolean;
  type: ModalType;
  date: string;
  event: CalendarEvent | null;
  diary: Diary | null;
  diaries: Diary[];
};

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function CalendarPage() {
  const { themeColor } = useAuth();
  const calendarRef = useRef<FullCalendarType>(null);

  const { events, createEvent, updateEvent, deleteEvent } = useCalendar();

  const {
    diaryDates,
    fetchDiariesByDate,
    createDiary,
    updateDiary,
    deleteDiary,
    deleteDiaryImage,
    fetchDiaryDates,
  } = useDiary();

  const [modal, setModal] = useState<ModalState>({
    open: false,
    type: "select",
    date: "",
    event: null,
    diary: null,
    diaries: [],
  });

  // 予定フォーム
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isReminder, setIsReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState("");

  // 日記フォーム
  const [diaryTitle, setDiaryTitle] = useState("");
  const [diaryContent, setDiaryContent] = useState("");
  const [diaryImages, setDiaryImages] = useState<File[]>([]);
  const [diaryImagePreviews, setDiaryImagePreviews] = useState<string[]>([]);

  const closeModal = () => {
    setModal({
      open: false,
      type: "select",
      date: "",
      event: null,
      diary: null,
      diaries: [],
    });
    setTitle("");
    setMemo("");
    setStartDate("");
    setEndDate("");
    setIsReminder(false);
    setReminderTime("");
    setDiaryTitle("");
    setDiaryContent("");
    setDiaryImages([]);
    setDiaryImagePreviews([]);
  };

  const handleDateClick = (info: { dateStr: string }) => {
    setModal({
      open: true,
      type: "select",
      date: info.dateStr,
      event: null,
      diary: null,
      diaries: [],
    });
  };

  const handleEventClick = (info: {
    event: { id: string; extendedProps: Record<string, unknown> };
  }) => {
    if (info.event.extendedProps["type"] === "diary") {
      handleDiaryDateClick(info.event.extendedProps["date"] as string);
      return;
    }
    const event = events.find((e) => e.id === Number(info.event.id));
    if (!event) return;
    setModal({
      open: true,
      type: "event_edit",
      date: event.start_date,
      event,
      diary: null,
      diaries: [],
    });
    setTitle(event.title);
    setMemo(event.memo || "");
    setStartDate(event.start_date.slice(0, 10));
    setEndDate(event.end_date ? event.end_date.slice(0, 10) : "");
    setIsReminder(event.is_reminder);
    setReminderTime(event.reminder_time?.slice(0, 5) || "");
  };

  const handleDiaryDateClick = async (date: string) => {
    const diaries = await fetchDiariesByDate(date);
    setModal({
      open: true,
      type: "diary_list",
      date,
      event: null,
      diary: null,
      diaries,
    });
  };

  const handleSaveEvent = async () => {
    if (!title.trim()) return;
    const data = {
      title,
      memo: memo || null,
      start_date: startDate,
      end_date: endDate || null,
      is_reminder: isReminder,
      reminder_time: isReminder ? reminderTime : null,
    };

    if (modal.type === "event_create") {
      await createEvent(data);
    } else if (modal.event) {
      await updateEvent(modal.event.id, data);
    }
    closeModal();
  };

  const handleDeleteEvent = async () => {
    if (!modal.event) return;
    if (!confirm("この予定を削除しますか？")) return;
    await deleteEvent(modal.event.id);
    closeModal();
  };

  const handleDiaryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDiaryImages((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setDiaryImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleSaveDiary = async () => {
    const formData = new FormData();
    formData.append("diary_date", modal.date);
    if (diaryTitle) formData.append("title", diaryTitle);
    if (diaryContent) formData.append("content", diaryContent);
    diaryImages.forEach((img) => formData.append("images[]", img));

    if (modal.type === "diary_create") {
      await createDiary(formData);
    } else if (modal.diary) {
      await updateDiary(modal.diary.id, formData);
    }
    closeModal();
  };

  const handleDeleteDiary = async (diaryId: number) => {
    if (!confirm("この日記を削除しますか？")) return;
    await deleteDiary(diaryId);
    closeModal();
  };

  const handleDeleteDiaryImage = async (imageId: number) => {
    await deleteDiaryImage(imageId);
    if (modal.diary) {
      const updated = await fetchDiariesByDate(modal.date);
      const updatedDiary = updated.find((d) => d.id === modal.diary!.id);
      if (updatedDiary) setModal({ ...modal, diary: updatedDiary });
    }
    await fetchDiaryDates();
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
      extendedProps: { type: "event" },
    })),
    ...diaryDates.map((d) => ({
      id: `diary-${d.diary_date}`,
      title: `📝 ${d.count}件`,
      start: d.diary_date,
      allDay: true,
      backgroundColor: "transparent",
      borderColor: "transparent",
      textColor: themeColor,
      extendedProps: { type: "diary", date: d.diary_date },
    })),
  ];

  return (
    <div
      className="max-w-4xl mx-auto rounded-2xl p-4"
      style={{ backgroundColor: hexToRgba(themeColor, 0.07) }}
    >
      <h1
        className="text-4xl mb-6"
        style={{ fontFamily: "var(--font-dancing-script)", color: themeColor }}
      >
        My Calendar
      </h1>

      <style>{`
        .fc .fc-button {
          background-color: ${themeColor} !important;
          border-color: ${themeColor} !important;
          color: white !important;
        }
        .fc .fc-button:hover { opacity: 0.85; }
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
        .diary-swiper .swiper-button-next,
        .diary-swiper .swiper-button-prev {
          width: 24px !important;
          height: 24px !important;
          background: rgba(255,255,255,0.7);
          border-radius: 50%;
        }
        .diary-swiper .swiper-button-next::after,
        .diary-swiper .swiper-button-prev::after {
          font-size: 10px !important;
          color: #333;
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
            right: "",
          }}
          height="auto"
        />
      </div>

      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            {modal.type === "select" && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  {modal.date}
                </h2>
                <p className="text-sm text-gray-500 mb-6">何をしますか？</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setModal({ ...modal, type: "event_create" });
                      setStartDate(modal.date);
                    }}
                    className="w-full text-white py-3 rounded-xl font-semibold"
                    style={{ backgroundColor: themeColor }}
                  >
                    📅 予定を追加
                  </button>
                  <button
                    onClick={() => setModal({ ...modal, type: "diary_create" })}
                    className="w-full py-3 rounded-xl font-semibold border-2"
                    style={{ color: themeColor, borderColor: themeColor }}
                  >
                    📝 日記を書く
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg font-semibold"
                    style={{
                      backgroundColor: hexToRgba(themeColor, 0.15),
                      color: themeColor,
                    }}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}

            {(modal.type === "event_create" || modal.type === "event_edit") && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  {modal.type === "event_create" ? "予定を追加" : "予定を編集"}
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
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
                    onClick={handleSaveEvent}
                    className="flex-1 text-white font-semibold py-2 rounded-lg"
                    style={{ backgroundColor: themeColor }}
                  >
                    保存
                  </button>
                  {modal.type === "event_edit" && (
                    <button
                      onClick={handleDeleteEvent}
                      className="px-4 py-2 bg-red-50 text-red-500 rounded-lg"
                    >
                      削除
                    </button>
                  )}
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg font-semibold"
                    style={{
                      backgroundColor: hexToRgba(themeColor, 0.15),
                      color: themeColor,
                    }}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}

            {(modal.type === "diary_create" || modal.type === "diary_edit") && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  📝{" "}
                  {new Date(modal.date).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  の日記
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      タイトル（任意）
                    </label>
                    <input
                      type="text"
                      value={diaryTitle}
                      onChange={(e) => setDiaryTitle(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                      placeholder="今日のタイトル"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      内容
                    </label>
                    <textarea
                      value={diaryContent}
                      onChange={(e) => setDiaryContent(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                      placeholder="今日の出来事を書いてみよう..."
                      rows={5}
                      autoFocus
                    />
                  </div>
                  {modal.type === "diary_edit" &&
                    modal.diary &&
                    modal.diary.images.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          保存済み画像
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {modal.diary.images.map((img) => (
                            <div key={img.id} className="relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`http://localhost:8000/storage/${img.image_path}`}
                                alt="diary"
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => handleDeleteDiaryImage(img.id)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      画像を追加
                    </label>
                    <label className="cursor-pointer">
                      <div
                        className="border-2 border-dashed rounded-lg p-4 text-center"
                        style={{ borderColor: themeColor }}
                      >
                        <p className="text-sm" style={{ color: themeColor }}>
                          📷 画像を選択（複数可）
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleDiaryImageChange}
                          className="hidden"
                        />
                      </div>
                    </label>
                    {diaryImagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {diaryImagePreviews.map((preview, index) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={index}
                            src={preview}
                            alt="preview"
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveDiary}
                    className="flex-1 text-white font-semibold py-2 rounded-lg"
                    style={{ backgroundColor: themeColor }}
                  >
                    保存
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg font-semibold"
                    style={{
                      backgroundColor: hexToRgba(themeColor, 0.15),
                      color: themeColor,
                    }}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}

            {modal.type === "diary_list" && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  📝{" "}
                  {new Date(modal.date).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  の日記
                </h2>
                <div className="space-y-3 mb-4">
                  {modal.diaries.map((diary) => (
                    <button
                      key={diary.id}
                      onClick={() =>
                        setModal({ ...modal, type: "diary_detail", diary })
                      }
                      className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition"
                    >
                      <p className="font-semibold text-gray-800">
                        {diary.title || "無題"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {diary.content}
                      </p>
                      {diary.images.length > 0 && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: themeColor }}
                        >
                          📷 {diary.images.length}枚の画像
                        </p>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setModal({ ...modal, type: "diary_create" })}
                    className="flex-1 text-white py-2 rounded-lg font-semibold"
                    style={{ backgroundColor: themeColor }}
                  >
                    ＋ 新しく書く
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg font-semibold"
                    style={{
                      backgroundColor: hexToRgba(themeColor, 0.15),
                      color: themeColor,
                    }}
                  >
                    閉じる
                  </button>
                </div>
              </div>
            )}

            {modal.type === "diary_detail" && modal.diary && (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {modal.diary.title || "無題"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {new Date(modal.diary.diary_date).toLocaleDateString(
                        "ja-JP",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setDiaryTitle(modal.diary?.title || "");
                        setDiaryContent(modal.diary?.content || "");
                        setDiaryImages([]);
                        setDiaryImagePreviews([]);
                        setModal({ ...modal, type: "diary_edit" });
                      }}
                      className="text-sm px-3 py-1 rounded-lg text-white"
                      style={{ backgroundColor: themeColor }}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteDiary(modal.diary!.id)}
                      className="text-sm px-3 py-1 rounded-lg bg-red-50 text-red-500"
                    >
                      削除
                    </button>
                  </div>
                </div>
                {modal.diary.images.length > 0 && (
                  <div className="mb-4">
                    <Swiper
                      modules={[Pagination, Navigation]}
                      pagination={{ clickable: true }}
                      navigation={modal.diary.images.length > 1}
                      grabCursor={true}
                      className="rounded-xl overflow-hidden diary-swiper"
                      style={{ height: "250px" }}
                    >
                      {modal.diary.images.map((img) => (
                        <SwiperSlide key={img.id}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`http://localhost:8000/storage/${img.image_path}`}
                            alt="diary"
                            className="w-full h-full object-cover"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}
                <p className="text-gray-700 whitespace-pre-wrap">
                  {modal.diary.content}
                </p>
                <button
                  onClick={() => setModal({ ...modal, type: "diary_list" })}
                  className="mt-6 w-full py-2 rounded-lg text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  ← 一覧に戻る
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
