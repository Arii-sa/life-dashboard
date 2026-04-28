<?php

namespace App\Http\Requests\Diary;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDiaryRequest extends FormRequest
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
            'title'    => 'nullable|string|max:100',
            'content'  => 'nullable|string',
            'images.*' => 'nullable|image|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'title.max'      => 'タイトルは100文字以内で入力してください',
            'images.*.image' => '画像ファイルを選択してください',
            'images.*.max'   => '画像サイズは5MB以内にしてください',
        ];
    }
}
