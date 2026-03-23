<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiaryImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'diary_id',
        'image_path',
        'order',
    ];

    public function diary()
    {
        return $this->belongsTo(Diary::class);
    }
}
