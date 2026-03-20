<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            // 1日の目標達成
            [
                'name'            => 'はじめの一歩',
                'description'     => '1日の学習目標を初めて達成！',
                'icon'            => '🎯',
                'condition_type'  => 'daily_goal',
                'condition_value' => 1,
            ],
            [
                'name'            => '3日連続達成',
                'description'     => '3日連続で1日の学習目標を達成！',
                'icon'            => '🔥',
                'condition_type'  => 'streak',
                'condition_value' => 3,
            ],
            [
                'name'            => '1週間連続達成',
                'description'     => '7日連続で1日の学習目標を達成！',
                'icon'            => '⚡',
                'condition_type'  => 'streak',
                'condition_value' => 7,
            ],
            [
                'name'            => '1ヶ月連続達成',
                'description'     => '30日連続で1日の学習目標を達成！',
                'icon'            => '👑',
                'condition_type'  => 'streak',
                'condition_value' => 30,
            ],
            // 週間目標達成
            [
                'name'            => '週間マスター',
                'description'     => '1週間の学習目標を初めて達成！',
                'icon'            => '📚',
                'condition_type'  => 'weekly_goal',
                'condition_value' => 1,
            ],
            [
                'name'            => '週間マスターⅡ',
                'description'     => '週間学習目標を5回達成！',
                'icon'            => '🏆',
                'condition_type'  => 'weekly_goal',
                'condition_value' => 5,
            ],
            [
                'name'            => '週間マスターⅢ',
                'description'     => '週間学習目標を10回達成！',
                'icon'            => '💎',
                'condition_type'  => 'weekly_goal',
                'condition_value' => 10,
            ],
        ];

        foreach ($badges as $badge) {
            Badge::firstOrCreate(
                ['name' => $badge['name']],
                $badge
            );
        }
    }
}

