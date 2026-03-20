<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CalendarEvent;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    // イベント一覧取得
    public function index(Request $request)
    {
        $events = $request->user()->calendarEvents()->get();
        return response()->json($events);
    }

    // イベント作成
    public function store(Request $request)
    {
        $request->validate([
            'title'         => 'required|string|max:255',
            'memo'          => 'nullable|string',
            'start_date'    => 'required|date',
            'end_date'      => 'nullable|date',
            'is_reminder'   => 'boolean',
            'reminder_time' => 'nullable|date_format:H:i',
        ]);

        $event = $request->user()->calendarEvents()->create($request->all());
        return response()->json($event, 201);
    }

    // イベント更新
    public function update(Request $request, CalendarEvent $calendarEvent)
    {
        if ($calendarEvent->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $request->validate([
            'title'         => 'sometimes|string|max:255',
            'memo'          => 'nullable|string',
            'start_date'    => 'sometimes|date',
            'end_date'      => 'nullable|date',
            'is_reminder'   => 'sometimes|boolean',
            'reminder_time' => 'nullable|date_format:H:i',
        ]);

        $calendarEvent->update($request->all());
        return response()->json($calendarEvent);
    }

    // イベント削除
    public function destroy(Request $request, CalendarEvent $calendarEvent)
    {
        if ($calendarEvent->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $calendarEvent->delete();
        return response()->json(['message' => 'イベントを削除しました']);
    }
}
