<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpsertProfileRequest extends FormRequest
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
            'username'    => 'nullable|string|max:30',
            'goal'        => 'nullable|string|max:500',
            'memo'        => 'nullable|string|max:500',
            'theme_color' => 'nullable|string|max:7',
            'avatar'      => 'nullable|image|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'username.max' => 'ユーザー名は30文字以内で入力してください',
            'goal.max'     => '目標は500文字以内で入力してください',
            'memo.max'     => 'メモは500文字以内で入力してください',
            'avatar.image' => '画像ファイルを選択してください',
            'avatar.max'   => '画像サイズは2MB以内にしてください',
        ];
    }
}
