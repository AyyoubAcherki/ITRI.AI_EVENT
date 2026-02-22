<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Reservation Model
 * Represents an attendee's reservation
 */
class Reservation extends Model
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
        'seat_numbers',
        'ticket_code',
        'qr_code',
        'is_used',
        'is_scanned',
        'scanned_at',
        'scan_count',
        'status',
        'confirmation_token',
        'notified_at_final',
        'notified_at_reminder',
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = [
        'days' => 'array',
        'seat_numbers' => 'array',
        'is_used' => 'boolean',
        'is_scanned' => 'boolean',
        'scanned_at' => 'datetime',
        'notified_at_final' => 'datetime',
        'notified_at_reminder' => 'datetime',
        'scan_count' => 'integer',
    ];

    /**
     * Get full name of the attendee
     */
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }
}
