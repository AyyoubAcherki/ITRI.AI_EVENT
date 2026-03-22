<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * HackathonRegistration Model
 */
class HackathonRegistration extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'cni',
        'email',
        'phone',
        'nom',
        'prenom',
        'fonctionnalite',
        'etablissement',
        'entreprise',
        'status',
        'ticket_code',
        'is_scanned',
        'scanned_at',
    ];

    /**
     * Get full name of the registrant
     */
    public function getFullNameAttribute()
    {
        return $this->prenom . ' ' . $this->nom;
    }
}
