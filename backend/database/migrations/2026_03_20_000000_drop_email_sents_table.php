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
        Schema::dropIfExists('email_sents');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('email_sents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained()->onDelete('cascade');
            $table->string('email_to');
            $table->string('subject');
            $table->string('status');
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }
};
