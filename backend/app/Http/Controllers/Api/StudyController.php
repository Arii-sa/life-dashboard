<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Study\StoreStudyRequest;
use App\Http\Requests\Study\UpdateGoalsRequest;
use App\Services\StudyService;
use Illuminate\Http\Request;


class StudyController extends Controller
{
    public function __construct(
        private StudyService $studyService
    ) {}

    // 学習記録を保存＆バッジチェック
    public function store(StoreStudyRequest $request)
    {
        $user = $request->user();
        $record = $this->studyService->storeRecord(
            $user,
            $request->duration,
            $request->study_date
        );

        // バッジチェック
        $newBadges = $this->studyService->checkAndAwardBadges(
            $user,
            $request->study_date
        );

        return response()->json([
            'record'     => $record,
            'new_badges' => $newBadges,
        ], 201);
    }

    // 学習記録一覧取得
    public function index(Request $request)
    {
        $records = $request->user()->studyRecords()->orderBy('study_date', 'desc')->get();
        return response()->json($records);
    }

    // 目標設定・取得
    public function getGoals(Request $request)
    {
        $profile = $request->user()->profile;
        return response()->json([
            'daily_goal'  => $profile?->daily_goal  ?? 3600,  // デフォルト1時間
            'weekly_goal' => $profile?->weekly_goal ?? 18000, // デフォルト5時間
        ]);
    }

    public function updateGoals(UpdateGoalsRequest $request)
    {
        $profile = $request->user()->profile;
        if ($profile) {
            $profile->update([
                'daily_goal'  => $request->daily_goal,
                'weekly_goal' => $request->weekly_goal,
            ]);
        }

        return response()->json(['message' => '目標を更新しました']);
    }

    // 今週の学習時間取得
    public function getWeeklyStats(Request $request)
    {
        $stats = $this->studyService->getWeeklyStats($request->user());
        return response()->json($stats);
    }

    // バッジ一覧取得
    public function getBadges(Request $request)
    {
        $userBadges = $request->user()->badges()->withPivot('earned_at')->get();
        return response()->json($userBadges);
    }

}