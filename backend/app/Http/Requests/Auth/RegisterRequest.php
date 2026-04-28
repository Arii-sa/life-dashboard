<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
            'name'     => 'required|string|max:30',
            'email'    => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'     => '名前は必須です',
            'email.required'    => 'メールアドレスは必須です',
            'email.email'       => 'メールアドレスはメール形式で入力してください',
            'email.unique'      => 'このメールアドレスは既に使用されています',
            'password.required' => 'パスワードは必須です',
            'password.min'      => 'パスワードは8文字以上で入力してください',
            'password.confirmed'=> 'パスワードが一致しません',
        ];
    }
}
