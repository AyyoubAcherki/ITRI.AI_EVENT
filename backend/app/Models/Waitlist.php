<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Waitlist Model
 * Represents a person waiting for a ticket cancellation
 */
class Waitlist extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'role',
        'institution_name',
        'days',
        'status',          // 'waiting', 'notified', 'expired', 'claimed'
        'notified_at',
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = [
        'days' => 'array',
        'notified_at' => 'datetime',
    ];
}
