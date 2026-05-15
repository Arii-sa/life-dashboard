"use client";

import { DiaryImage } from "@/hooks/useDiary";

type Props = {
  mode: "create" | "edit";
  date: string;
  themeColor: string;
  hexToRgba: (hex: string, alpha: number) => string;
  diaryTitle: string;
  diaryContent: string;
  diaryImagePreviews: string[];
  existingImages?: DiaryImage[];
  onChangeTitle: (v: string) => void;
  onChangeContent: (v: string) => void;
  onChangeImages: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteExistingImage?: (id: number) => void;
  onSave: () => void;
  onClose: () => void;
};

export default function DiaryFormModal({
  mode,
  date,
  themeColor,
  hexToRgba,
  diaryTitle,
  diaryContent,
  diaryImagePreviews,
  existingImages,
  onChangeTitle,
  onChangeContent,
  onChangeImages,
  onDeleteExistingImage,
  onSave,
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
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル（任意）
          </label>
          <input
            type="text"
            value={diaryTitle}
            onChange={(e) => onChangeTitle(e.target.value)}
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
            onChange={(e) => onChangeContent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
            placeholder="今日の出来事を書いてみよう..."
            rows={5}
            autoFocus
          />
        </div>

        {mode === "edit" && existingImages && existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              保存済み画像
            </label>
            <div className="grid grid-cols-3 gap-2">
              {existingImages.map((img) => (
                <div key={img.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`http://localhost:8000/storage/${img.image_path}`}
                    alt="diary"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => onDeleteExistingImage?.(img.id)}
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
                onChange={onChangeImages}
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
          onClick={onSave}
          className="flex-1 text-white font-semibold py-2 rounded-lg"
          style={{ backgroundColor: themeColor }}
        >
          保存
        </button>
        <button
          onClick={onClose}
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
  );
}
