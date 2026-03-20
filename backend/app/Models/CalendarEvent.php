<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendarEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'memo',
        'start_date',
        'end_date',
        'is_reminder',
        'reminder_time',
    ];

    protected $casts = [
        'start_date'  => 'date',
        'end_date'    => 'date',
        'is_reminder' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
