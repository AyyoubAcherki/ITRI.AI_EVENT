<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('hackathon_registrations', function (Blueprint $table) {
            $table->boolean('is_scanned')->default(false);
            $table->timestamp('scanned_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hackathon_registrations', function (Blueprint $table) {
            $table->dropColumn(['is_scanned', 'scanned_at']);
        });
    }
};
