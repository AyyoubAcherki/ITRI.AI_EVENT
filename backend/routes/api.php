<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SpeakerController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\SeatController;
use App\Http\Controllers\ReservationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================

// Authentication
Route::post('/admin/login', [AuthController::class, 'login']);

// Speakers - Public access
Route::get('/speakers', [SpeakerController::class, 'index']);
Route::get('/speakers/{speaker}', [SpeakerController::class, 'show']);

// Programs - Public access
Route::get('/programs', [ProgramController::class, 'index']);
Route::get('/programs/{program}', [ProgramController::class, 'show']);

// Seats - Public access
Route::get('/seats', [SeatController::class, 'index']);
Route::get('/seats/availability', [SeatController::class, 'availability']);

// Reservations - Public
Route::post('/reservations', [ReservationController::class, 'store']);
Route::post('/reservations/confirm', [ReservationController::class, 'confirm']);
Route::post('/reservations/cancel', [ReservationController::class, 'cancel']);

// Waitlist - Public
Route::post('/waitlist', [\App\Http\Controllers\Api\WaitlistController::class, 'store']);

// Download ticket - Public
Route::get('/tickets/{ticketCode}/download', [ReservationController::class, 'downloadTicket']);


// ==========================================
// PROTECTED ROUTES (Admin authentication required)
// ==========================================

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/admin/logout', [AuthController::class, 'logout']);
    Route::get('/admin/me', [AuthController::class, 'me']);

    // Speakers CRUD (Admin)
    Route::post('/speakers', [SpeakerController::class, 'store']);
    Route::put('/speakers/{speaker}', [SpeakerController::class, 'update']);
    Route::delete('/speakers/{speaker}', [SpeakerController::class, 'destroy']);

    // Programs CRUD (Admin)
    Route::get('/admin/programs', [ProgramController::class, 'all']);
    Route::post('/programs', [ProgramController::class, 'store']);
    Route::put('/programs/{program}', [ProgramController::class, 'update']);
    Route::delete('/programs/{program}', [ProgramController::class, 'destroy']);

    // Reservations (Admin)
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::get('/reservations/{reservation}', [ReservationController::class, 'show']);
    Route::delete('/reservations/{reservation}', [ReservationController::class, 'destroy']);

    // QR Validation (Admin) - Higher rate limit for scanning
    Route::middleware('throttle:qr-scan')->group(function () {
        Route::post('/reservations/validate-qr', [ReservationController::class, 'validateQR']);
    });

    // Statistics (Admin)
    Route::get('/statistics', [ReservationController::class, 'statistics']);
    Route::get('/scan-statistics', [ReservationController::class, 'scanStatistics']);

    // Emails (Admin)
    Route::get('/admin/emails', [\App\Http\Controllers\EmailSentController::class, 'index']);
    Route::post('/admin/emails/{id}/retry', [\App\Http\Controllers\EmailSentController::class, 'retry']);

    // Export (Admin)
    Route::get('/reservations/export', [ReservationController::class, 'export']);
});
