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
        Schema::table('reservations', function (Blueprint $table) {
            $table->enum('status', ['pending', 'confirmed', 'waiting_list'])->after('role')->default('pending');
            $table->string('confirmation_token')->after('status')->nullable();
            $table->timestamp('notified_at_final')->after('is_used')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['status', 'confirmation_token', 'notified_at_final']);
        });
    }
};
