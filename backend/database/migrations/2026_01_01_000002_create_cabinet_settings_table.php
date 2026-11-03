<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cabinet_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('doctor_name');
            $table->string('specialty')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('location_text')->nullable();
            $table->text('about')->nullable();
            $table->text('opening_hours')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cabinet_settings');
    }
};
