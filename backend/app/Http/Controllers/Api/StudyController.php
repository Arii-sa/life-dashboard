<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\StudyRecord;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StudyController extends Controller
{
    // 学習記録を保存＆バッジチェック
    public function store(Request $request)
    {
        $request->validate([
            'duration'   => 'required|integer|min:1',
            'study_date' => 'required|date',
        ]);

        $user = $request->user();

        // 同じ日の記録があれば加算、なければ新規作成
        $record = StudyRecord::firstOrNew([
            'user_id'    => $user->id,
            'study_date' => $request->study_date,
        ]);
        $record->duration = ($record->duration ?? 0) + $request->duration;
        $record->save();

        // バッジチェック
        $newBadges = $this->checkAndAwardBadges($user, $request->study_date);

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

    public function updateGoals(Request $request)
    {
        $request->validate([
            'daily_goal'  => 'required|integer|min:60',
            'weekly_goal' => 'required|integer|min:60',
        ]);

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
        $user      = $request->user();
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek   = Carbon::now()->endOfWeek();

        $records = $user->studyRecords()
            ->whereBetween('study_date', [$startOfWeek, $endOfWeek])
            ->get();

        $weeklyTotal = $records->sum('duration');

        // 今日の学習時間
        $today       = Carbon::today()->toDateString();
        $dailyTotal  = $user->studyRecords()
            ->where('study_date', $today)
            ->sum('duration');

        return response()->json([
            'weekly_total' => $weeklyTotal,
            'daily_total'  => $dailyTotal,
        ]);
    }

    // バッジ一覧取得
    public function getBadges(Request $request)
    {
        $userBadges = $request->user()->badges()->withPivot('earned_at')->get();
        return response()->json($userBadges);
    }

    // バッジチェック＆付与
    private function checkAndAwardBadges($user, $studyDate)
    {
        $newBadges   = [];
        $allBadges   = Badge::all();
        $earnedIds   = $user->badges()->pluck('badges.id')->toArray();

        $profile     = $user->profile;
        $dailyGoal   = $profile?->daily_goal  ?? 3600;
        $weeklyGoal  = $profile?->weekly_goal ?? 18000;

        // 今日の学習時間
        $dailyTotal  = $user->studyRecords()
            ->where('study_date', $studyDate)
            ->sum('duration');

        // 今週の学習時間
        $startOfWeek = Carbon::parse($studyDate)->startOfWeek();
        $endOfWeek   = Carbon::parse($studyDate)->endOfWeek();
        $weeklyTotal = $user->studyRecords()
            ->whereBetween('study_date', [$startOfWeek, $endOfWeek])
            ->sum('duration');

        // 連続達成日数
        $streak = $this->calculateStreak($user, $studyDate, $dailyGoal);

        foreach ($allBadges as $badge) {
            if (in_array($badge->id, $earnedIds)) continue;

            $earned = false;

            if ($badge->condition_type === 'daily_goal' && $dailyTotal >= $dailyGoal) {
                $earned = true;
            } elseif ($badge->condition_type === 'weekly_goal') {
                $weeklyGoalCount = $this->countWeeklyGoalAchievements($user, $weeklyGoal);
                if ($weeklyGoalCount >= $badge->condition_value) $earned = true;
            } elseif ($badge->condition_type === 'streak' && $streak >= $badge->condition_value) {
                $earned = true;
            }

            if ($earned) {
                $user->badges()->attach($badge->id, ['earned_at' => now()]);
                $newBadges[] = $badge;
            }
        }

        return $newBadges;
    }

    // 連続達成日数を計算
    private function calculateStreak($user, $date, $dailyGoal)
    {
        $streak  = 0;
        $current = Carbon::parse($date);

        while (true) {
            $total = $user->studyRecords()
                ->where('study_date', $current->toDateString())
                ->sum('duration');

            if ($total < $dailyGoal) break;

            $streak++;
            $current->subDay();
        }

        return $streak;
    }

    // 週間目標達成回数を計算
    private function countWeeklyGoalAchievements($user, $weeklyGoal)
    {
        $records = $user->studyRecords()
            ->selectRaw('YEAR(study_date) as year, WEEK(study_date) as week, SUM(duration) as total')
            ->groupBy('year', 'week')
            ->get();

        return $records->where('total', '>=', $weeklyGoal)->count();
    }
}
