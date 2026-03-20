<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'username',
        'avatar',
        'goal',
        'memo',
        'theme_color',
        'daily_goal',
        'weekly_goal',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
