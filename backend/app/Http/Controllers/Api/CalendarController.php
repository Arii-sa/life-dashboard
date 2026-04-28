<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Calendar\CreateEventRequest;
use App\Http\Requests\Calendar\UpdateEventRequest;
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
    public function store(CreateEventRequest $request)
    {
        $event = $request->user()->calendarEvents()->create($request->all());
        return response()->json($event, 201);
    }

    // イベント更新
    public function update(UpdateEventRequest $request, CalendarEvent $calendarEvent)
    {
        if ($calendarEvent->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

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
