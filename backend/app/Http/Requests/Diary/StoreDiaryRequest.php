<?php

namespace App\Http\Requests\Diary;

use Illuminate\Foundation\Http\FormRequest;

class StoreDiaryRequest extends FormRequest
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
            'title'      => 'nullable|string|max:100',
            'content'    => 'nullable|string',
            'diary_date' => 'required|date',
            'images.*'   => 'nullable|image|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'title.max'          => 'タイトルは100文字以内で入力してください',
            'diary_date.required'=> '日記の日付は必須です',
            'diary_date.date'    => '日付の形式が正しくありません',
            'images.*.image'     => '画像ファイルを選択してください',
            'images.*.max'       => '画像サイズは5MB以内にしてください',
        ];
    }
}
