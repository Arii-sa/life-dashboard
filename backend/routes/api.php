<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\CalendarController;
use Illuminate\Support\Facades\Route;

// 認証不要
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// 認証必要
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // プロフィール
    Route::get('/profile',    [ProfileController::class, 'show']);
    Route::post('/profile',   [ProfileController::class, 'upsert']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);

    // フォルダ
    Route::get('/folders',              [TaskController::class, 'getFolders']);
    Route::post('/folders',             [TaskController::class, 'createFolder']);
    Route::put('/folders/{folder}',     [TaskController::class, 'updateFolder']);
    Route::delete('/folders/{folder}',  [TaskController::class, 'deleteFolder']);

    // タスク
    Route::get('/folders/{folder}/tasks',    [TaskController::class, 'getTasks']);
    Route::post('/folders/{folder}/tasks',   [TaskController::class, 'createTask']);
    Route::put('/tasks/{task}',              [TaskController::class, 'updateTask']);
    Route::delete('/tasks/{task}',           [TaskController::class, 'deleteTask']);

    // カレンダー
    Route::get('/calendar',                    [CalendarController::class, 'index']);
    Route::post('/calendar',                   [CalendarController::class, 'store']);
    Route::put('/calendar/{calendarEvent}',    [CalendarController::class, 'update']);
    Route::delete('/calendar/{calendarEvent}', [CalendarController::class, 'destroy']);
});
