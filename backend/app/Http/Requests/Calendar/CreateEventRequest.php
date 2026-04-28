<?php

namespace App\Http\Requests\Calendar;

use Illuminate\Foundation\Http\FormRequest;

class CreateEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title'         => 'required|string|max:100',
            'memo'          => 'nullable|string|max:500',
            'start_date'    => 'required|date',
            'end_date'      => 'nullable|date|after_or_equal:start_date',
            'is_reminder'   => 'boolean',
            'reminder_time' => 'nullable|date_format:H:i',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'          => 'タイトルは必須です',
            'title.max'               => 'タイトルは100文字以内で入力してください',
            'memo.max'                => 'メモは500文字以内で入力してください',
            'start_date.required'     => '開始日は必須です',
            'start_date.date'         => '開始日の形式が正しくありません',
            'end_date.date'           => '終了日の形式が正しくありません',
            'end_date.after_or_equal' => '終了日は開始日以降を指定してください',
            'reminder_time.date_format' => 'リマインダーの時刻はHH:MM形式で入力してください',
        ];
    }
}
