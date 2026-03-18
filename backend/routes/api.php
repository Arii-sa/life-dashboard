<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
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
});
