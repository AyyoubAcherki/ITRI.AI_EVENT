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
        Schema::create('hackathon_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('cni')->unique();
            $table->string('email')->unique();
            $table->string('phone')->unique();
            $table->string('nom');
            $table->string('prenom');
            $table->enum('fonctionnalite', ['etudiant', 'employer']);
            $table->string('etablissement')->nullable();
            $table->string('entreprise')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hackathon_registrations');
    }
};
