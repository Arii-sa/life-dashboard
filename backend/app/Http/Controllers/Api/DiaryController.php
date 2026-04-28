<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Diary\StoreDiaryRequest;
use App\Http\Requests\Diary\UpdateDiaryRequest;
use App\Models\Diary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DiaryController extends Controller
{
    // 日記一覧取得（日付ごと）
    public function index(Request $request)
    {
        $diaries = $request->user()
            ->diaries()
            ->with('images')
            ->orderBy('diary_date', 'desc')
            ->get();

        return response()->json($diaries);
    }

    // 特定の日付の日記一覧
    public function getByDate(Request $request, string $date)
    {
        $diaries = $request->user()
            ->diaries()
            ->with('images')
            ->where('diary_date', $date)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($diaries);
    }

    // 日記作成
    public function store(StoreDiaryRequest $request)
    {
        $diary = $request->user()->diaries()->create([
            'title'      => $request->title,
            'content'    => $request->content,
            'diary_date' => $request->diary_date,
        ]);

        // 画像の保存
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('diaries', 'public');
                $diary->images()->create([
                    'image_path' => $path,
                    'order'      => $index,
                ]);
            }
        }

        return response()->json($diary->load('images'), 201);
    }

    // 日記更新
    public function update(UpdateDiaryRequest $request, Diary $diary)
    {
        if ($diary->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $diary->update([
            'title'   => $request->title,
            'content' => $request->content,
        ]);

        // 新しい画像を追加
        if ($request->hasFile('images')) {
            $currentMax = $diary->images()->max('order') ?? -1;
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('diaries', 'public');
                $diary->images()->create([
                    'image_path' => $path,
                    'order'      => $currentMax + $index + 1,
                ]);
            }
        }

        return response()->json($diary->load('images'));
    }

    // 日記削除
    public function destroy(Request $request, Diary $diary)
    {
        if ($diary->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        // 画像ファイルも削除
        foreach ($diary->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $diary->delete();
        return response()->json(['message' => '日記を削除しました']);
    }

    // 画像削除
    public function destroyImage(Request $request, int $imageId)
    {
        $image = \App\Models\DiaryImage::findOrFail($imageId);

        if ($image->diary->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        return response()->json(['message' => '画像を削除しました']);
    }

    // 日記がある日付一覧（カレンダー表示用）
    public function getDates(Request $request)
    {
        $dates = $request->user()
            ->diaries()
            ->selectRaw('diary_date, COUNT(*) as count')
            ->groupBy('diary_date')
            ->get();

        return response()->json($dates);
    }
}

