<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('gender')->nullable();
            $table->string('national_id')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('blood_type')->nullable();
            $table->text('allergies')->nullable();
            $table->text('medical_history')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['last_name', 'first_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
