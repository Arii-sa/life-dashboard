<?php

namespace App\Http\Requests\Study;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGoalsRequest extends FormRequest
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
            'daily_goal'  => 'required|integer|min:60',
            'weekly_goal' => 'required|integer|min:60',
        ];
    }

    public function messages(): array
    {
        return [
            'daily_goal.required'  => '1日の目標は必須です',
            'daily_goal.integer'   => '1日の目標は整数で入力してください',
            'daily_goal.min'       => '1日の目標は60秒以上で設定してください',
            'weekly_goal.required' => '1週間の目標は必須です',
            'weekly_goal.integer'  => '1週間の目標は整数で入力してください',
            'weekly_goal.min'      => '1週間の目標は60秒以上で設定してください',
        ];
    }
}
