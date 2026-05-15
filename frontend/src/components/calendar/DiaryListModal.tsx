"use client";

import { Diary } from "@/hooks/useDiary";

type Props = {
  date: string;
  diaries: Diary[];
  themeColor: string;
  hexToRgba: (hex: string, alpha: number) => string;
  onSelectDiary: (diary: Diary) => void;
  onCreateNew: () => void;
  onClose: () => void;
};

export default function DiaryListModal({
  date,
  diaries,
  themeColor,
  hexToRgba,
  onSelectDiary,
  onCreateNew,
  onClose,
}: Props) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        📝{" "}
        {new Date(date).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        の日記
      </h2>
      <div className="space-y-3 mb-4">
        {diaries.map((diary) => (
          <button
            key={diary.id}
            onClick={() => onSelectDiary(diary)}
            className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition"
          >
            <p className="font-semibold text-gray-800">
              {diary.title || "無題"}
            </p>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {diary.content}
            </p>
            {diary.images.length > 0 && (
              <p className="text-xs mt-1" style={{ color: themeColor }}>
                📷 {diary.images.length}枚の画像
              </p>
            )}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCreateNew}
          className="flex-1 text-white py-2 rounded-lg font-semibold"
          style={{ backgroundColor: themeColor }}
        >
          ＋ 新しく書く
        </button>
        <button
          onClick={onClose}
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
  );
}
