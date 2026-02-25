<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('test:email', function () {
    try {
        \Illuminate\Support\Facades\Mail::raw('Test email', function ($msg) {
            $msg->to('ayo.acher@gmail.com')->subject('Test Email from Artisan');
        });
        $this->info('Email sent successfully');
    } catch (\Exception $e) {
        $this->error('Error: ' . $e->getMessage());
    }
})->purpose('Test sending an email to verify SMTP configuration');
