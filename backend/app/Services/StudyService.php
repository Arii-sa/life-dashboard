<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\StudyRecord;
use App\Models\User;
use Carbon\Carbon;

class StudyService
{
    // 学習記録を保存
    public function storeRecord(User $user, int $duration, string $studyDate): StudyRecord
    {
        $record = StudyRecord::firstOrNew([
            'user_id'    => $user->id,
            'study_date' => $studyDate,
        ]);
        $record->duration = ($record->duration ?? 0) + $duration;
        $record->save();

        return $record;
    }

    // 今日・今週の学習時間を取得
    public function getWeeklyStats(User $user): array
    {
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek   = Carbon::now()->endOfWeek();

        $weeklyTotal = $user->studyRecords()
            ->whereBetween('study_date', [$startOfWeek, $endOfWeek])
            ->sum('duration');

        $today      = Carbon::today()->toDateString();
        $dailyTotal = $user->studyRecords()
            ->where('study_date', $today)
            ->sum('duration');

        return [
            'weekly_total' => $weeklyTotal,
            'daily_total'  => $dailyTotal,
        ];
    }

    // バッジチェック＆付与
    public function checkAndAwardBadges(User $user, string $studyDate): array
    {
        $newBadges  = [];
        $allBadges  = Badge::all();
        $earnedIds  = $user->badges()->pluck('badges.id')->toArray();

        $profile    = $user->profile;
        $dailyGoal  = $profile?->daily_goal  ?? 3600;
        $weeklyGoal = $profile?->weekly_goal ?? 18000;

        $dailyTotal = $user->studyRecords()
            ->where('study_date', $studyDate)
            ->sum('duration');

        $startOfWeek = Carbon::parse($studyDate)->startOfWeek();
        $endOfWeek   = Carbon::parse($studyDate)->endOfWeek();
        $weeklyTotal = $user->studyRecords()
            ->whereBetween('study_date', [$startOfWeek, $endOfWeek])
            ->sum('duration');

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
    public function calculateStreak(User $user, string $date, int $dailyGoal): int
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
    public function countWeeklyGoalAchievements(User $user, int $weeklyGoal): int
    {
        $records = $user->studyRecords()
            ->selectRaw('YEAR(study_date) as year, WEEK(study_date) as week, SUM(duration) as total')
            ->groupBy('year', 'week')
            ->get();

        return $records->where('total', '>=', $weeklyGoal)->count();
    }
}
