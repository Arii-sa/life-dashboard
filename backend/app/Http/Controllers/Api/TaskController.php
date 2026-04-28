<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\CreateFolderRequest;
use App\Http\Requests\Task\UpdateFolderRequest;
use App\Http\Requests\Task\CreateTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Models\Task;
use App\Models\TaskFolder;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // フォルダ一覧取得
    public function getFolders(Request $request)
    {
        $folders = $request->user()->taskFolders()->latest()->get();
        return response()->json($folders);
    }

    // フォルダ作成
    public function createFolder(CreateFolderRequest $request)
    {
        $folder = $request->user()->taskFolders()->create([
            'name' => $request->name,
            'due_date' => $request->due_date,
        ]);

        return response()->json($folder, 201);
    }

    // フォルダ更新
    public function updateFolder(UpdateFolderRequest $request, TaskFolder $folder)
    {
        if ($folder->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $folder->update(['name' => $request->name,'due_date' => $request->due_date,]);
        return response()->json($folder);
    }

    // フォルダ削除
    public function deleteFolder(Request $request, TaskFolder $folder)
    {
        if ($folder->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $folder->delete();
        return response()->json(['message' => 'フォルダを削除しました']);
    }

    // タスク一覧取得
    public function getTasks(Request $request, TaskFolder $folder)
    {
        if ($folder->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $tasks = $folder->tasks()->latest()->get();
        return response()->json($tasks);
    }

    // タスク作成
    public function createTask(CreateTaskRequest $request, TaskFolder $folder)
    {
        if ($folder->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $task = $folder->tasks()->create([
            'user_id' => $request->user()->id,
            'title'   => $request->title,
            'is_done' => false,
        ]);

        return response()->json($task, 201);
    }

    // タスク更新（タイトル変更・完了切り替え）
    public function updateTask(UpdateTaskRequest $request, Task $task)
    {
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $task->update($request->only(['title', 'is_done']));
        return response()->json($task);
    }

    // タスク削除
    public function deleteTask(Request $request, Task $task)
    {
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $task->delete();
        return response()->json(['message' => 'タスクを削除しました']);
    }
}
