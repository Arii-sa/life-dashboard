<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $profile = $request->user()->profile;
        return response()->json($profile);
    }

    // プロフィール作成・更新
    public function upsert(Request $request)
    {
        $request->validate([
            'username'    => 'nullable|string|max:255',
            'goal'        => 'nullable|string|max:500',
            'memo'        => 'nullable|string|max:500',
            'theme_color' => 'nullable|string|max:7',
            'avatar'      => 'nullable|image|max:2048',
        ]);

        $data = $request->only(['username', 'goal', 'memo', 'theme_color']);

        // アイコン画像のアップロード処理
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $path;
        }

        $profile = Profile::updateOrCreate(
            ['user_id' => $request->user()->id],
            $data
        );

        return response()->json($profile);
    }

    // プロフィール削除
    public function destroy(Request $request)
    {
        $profile = $request->user()->profile;
        if ($profile) {
            if ($profile->avatar) {
                Storage::disk('public')->delete($profile->avatar);
            }
            $profile->delete();
        }
        return response()->json(['message' => 'プロフィールを削除しました。']);
    }
}
