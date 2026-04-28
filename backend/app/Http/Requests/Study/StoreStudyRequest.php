<?php

namespace App\Http\Requests\Study;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudyRequest extends FormRequest
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
            'duration'   => 'required|integer|min:1',
            'study_date' => 'required|date',
        ];
    }

    public function messages(): array
    {
        return [
            'duration.required'   => '学習時間は必須です',
            'duration.integer'    => '学習時間は整数で入力してください',
            'duration.min'        => '学習時間は1秒以上である必要があります',
            'study_date.required' => '学習日は必須です',
            'study_date.date'     => '学習日の形式が正しくありません',
        ];
    }
}
