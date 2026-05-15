"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCalendar, CalendarEvent } from "@/hooks/useCalendar";
import { useDiary, Diary } from "@/hooks/useDiary";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from "@fullcalendar/core/locales/ja";
import SelectModal from "@/components/calendar/SelectModal";
import EventModal from "@/components/calendar/EventModal";
import DiaryFormModal from "@/components/calendar/DiaryFormModal";
import DiaryListModal from "@/components/calendar/DiaryListModal";
import DiaryDetailModal from "@/components/calendar/DiaryDetailModal";

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
  const calendarRef = useRef<FullCalendar>(null);

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
    setDiaryImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
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
              <SelectModal
                date={modal.date}
                themeColor={themeColor}
                hexToRgba={hexToRgba}
                onSelectEvent={() => {
                  setModal({ ...modal, type: "event_create" });
                  setStartDate(modal.date);
                }}
                onSelectDiary={() =>
                  setModal({ ...modal, type: "diary_create" })
                }
                onClose={closeModal}
              />
            )}

            {(modal.type === "event_create" || modal.type === "event_edit") && (
              <EventModal
                mode={modal.type === "event_create" ? "create" : "edit"}
                themeColor={themeColor}
                hexToRgba={hexToRgba}
                title={title}
                memo={memo}
                startDate={startDate}
                endDate={endDate}
                isReminder={isReminder}
                reminderTime={reminderTime}
                onChangeTitle={setTitle}
                onChangeMemo={setMemo}
                onChangeStartDate={setStartDate}
                onChangeEndDate={setEndDate}
                onChangeIsReminder={setIsReminder}
                onChangeReminderTime={setReminderTime}
                onSave={handleSaveEvent}
                onDelete={
                  modal.type === "event_edit" ? handleDeleteEvent : undefined
                }
                onClose={closeModal}
              />
            )}

            {(modal.type === "diary_create" || modal.type === "diary_edit") && (
              <DiaryFormModal
                mode={modal.type === "diary_create" ? "create" : "edit"}
                date={modal.date}
                themeColor={themeColor}
                hexToRgba={hexToRgba}
                diaryTitle={diaryTitle}
                diaryContent={diaryContent}
                diaryImagePreviews={diaryImagePreviews}
                existingImages={modal.diary?.images}
                onChangeTitle={setDiaryTitle}
                onChangeContent={setDiaryContent}
                onChangeImages={handleDiaryImageChange}
                onDeleteExistingImage={handleDeleteDiaryImage}
                onSave={handleSaveDiary}
                onClose={closeModal}
              />
            )}

            {modal.type === "diary_list" && (
              <DiaryListModal
                date={modal.date}
                diaries={modal.diaries}
                themeColor={themeColor}
                hexToRgba={hexToRgba}
                onSelectDiary={(diary) =>
                  setModal({ ...modal, type: "diary_detail", diary })
                }
                onCreateNew={() => setModal({ ...modal, type: "diary_create" })}
                onClose={closeModal}
              />
            )}

            {modal.type === "diary_detail" && modal.diary && (
              <DiaryDetailModal
                diary={modal.diary}
                themeColor={themeColor}
                onEdit={() => {
                  setDiaryTitle(modal.diary?.title || "");
                  setDiaryContent(modal.diary?.content || "");
                  setDiaryImages([]);
                  setDiaryImagePreviews([]);
                  setModal({ ...modal, type: "diary_edit" });
                }}
                onDelete={() => handleDeleteDiary(modal.diary!.id)}
                onBack={() => setModal({ ...modal, type: "diary_list" })}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
