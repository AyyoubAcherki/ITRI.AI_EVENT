<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        // Ensure storage link exists in production
        $link = public_path('storage');
        $target = storage_path('app/public');
        
        if (!file_exists($link)) {
            if (is_link($link)) {
                @unlink($link);
            }
            try {
                @symlink($target, $link);
            } catch (\Exception $e) {
                // Silently fail
            }
        }
    }
}
