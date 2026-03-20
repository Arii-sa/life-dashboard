<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->integer('daily_goal')->default(3600)->after('theme_color');   // 1時間
            $table->integer('weekly_goal')->default(18000)->after('daily_goal');  // 5時間
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn(['daily_goal', 'weekly_goal']);
        });
    }
};
