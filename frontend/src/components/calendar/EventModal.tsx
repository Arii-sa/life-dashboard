"use client";

type Props = {
  mode: "create" | "edit";
  themeColor: string;
  hexToRgba: (hex: string, alpha: number) => string;
  title: string;
  memo: string;
  startDate: string;
  endDate: string;
  isReminder: boolean;
  reminderTime: string;
  onChangeTitle: (v: string) => void;
  onChangeMemo: (v: string) => void;
  onChangeStartDate: (v: string) => void;
  onChangeEndDate: (v: string) => void;
  onChangeIsReminder: (v: boolean) => void;
  onChangeReminderTime: (v: string) => void;
  onSave: () => void;
  onDelete?: () => void;
  onClose: () => void;
};

export default function EventModal({
  mode,
  themeColor,
  hexToRgba,
  title,
  memo,
  startDate,
  endDate,
  isReminder,
  reminderTime,
  onChangeTitle,
  onChangeMemo,
  onChangeStartDate,
  onChangeEndDate,
  onChangeIsReminder,
  onChangeReminderTime,
  onSave,
  onDelete,
  onClose,
}: Props) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        {mode === "create" ? "予定を追加" : "予定を編集"}
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
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
            onChange={(e) => onChangeMemo(e.target.value)}
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
              onChange={(e) => onChangeStartDate(e.target.value)}
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
              onChange={(e) => onChangeEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isReminder}
              onChange={(e) => onChangeIsReminder(e.target.checked)}
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
              onChange={(e) => onChangeReminderTime(e.target.value)}
              className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
            />
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
        {mode === "edit" && onDelete && (
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-50 text-red-500 rounded-lg"
          >
            削除
          </button>
        )}
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
