<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$reservations = \App\Models\Reservation::orderBy('id', 'desc')->take(5)->get(['id', 'email', 'status', 'ticket_code', 'days', 'scan_count', 'is_used']);

echo json_encode($reservations, JSON_PRETTY_PRINT);
