"use client";

import { Diary } from "@/hooks/useDiary";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

type Props = {
  diary: Diary;
  themeColor: string;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
};

export default function DiaryDetailModal({
  diary,
  themeColor,
  onEdit,
  onDelete,
  onBack,
}: Props) {
  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            {diary.title || "無題"}
          </h2>
          <p className="text-sm text-gray-500">
            {new Date(diary.diary_date).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-sm px-3 py-1 rounded-lg text-white"
            style={{ backgroundColor: themeColor }}
          >
            編集
          </button>
          <button
            onClick={onDelete}
            className="text-sm px-3 py-1 rounded-lg bg-red-50 text-red-500"
          >
            削除
          </button>
        </div>
      </div>

      {diary.images.length > 0 && (
        <div className="mb-4">
          <Swiper
            modules={[Pagination, Navigation]}
            pagination={{ clickable: true }}
            navigation={diary.images.length > 1}
            grabCursor={true}
            className="rounded-xl overflow-hidden diary-swiper"
            style={{ height: "250px" }}
          >
            {diary.images.map((img) => (
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

      <p className="text-gray-700 whitespace-pre-wrap">{diary.content}</p>

      <button
        onClick={onBack}
        className="mt-6 w-full py-2 rounded-lg text-white"
        style={{ backgroundColor: themeColor }}
      >
        ← 一覧に戻る
      </button>
    </div>
  );
}
