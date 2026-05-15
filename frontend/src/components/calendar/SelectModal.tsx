"use client";

type Props = {
  date: string;
  themeColor: string;
  hexToRgba: (hex: string, alpha: number) => string;
  onSelectEvent: () => void;
  onSelectDiary: () => void;
  onClose: () => void;
};

export default function SelectModal({
  date,
  themeColor,
  hexToRgba,
  onSelectEvent,
  onSelectDiary,
  onClose,
}: Props) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-2">{date}</h2>
      <p className="text-sm text-gray-500 mb-6">何をしますか？</p>
      <div className="flex flex-col gap-3">
        <button
          onClick={onSelectEvent}
          className="w-full text-white py-3 rounded-xl font-semibold"
          style={{ backgroundColor: themeColor }}
        >
          📅 予定を追加
        </button>
        <button
          onClick={onSelectDiary}
          className="w-full py-3 rounded-xl font-semibold border-2"
          style={{ color: themeColor, borderColor: themeColor }}
        >
          📝 日記を書く
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
