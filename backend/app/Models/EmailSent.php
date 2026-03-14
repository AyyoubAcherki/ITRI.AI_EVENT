<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailSent extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'email_to',
        'subject',
        'status',
        'error_message',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }
}
