<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends Model
{
    use HasFactory;

    protected $fillable = ['task_folder_id', 'user_id', 'title', 'is_done'];

    protected $casts = [
        'is_done' => 'boolean',
    ];

    public function folder()
    {
        return $this->belongsTo(TaskFolder::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
