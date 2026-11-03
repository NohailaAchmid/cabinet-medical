<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->dateTime('consulted_at');
            $table->string('reason')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('notes')->nullable();
            $table->string('blood_pressure')->nullable();
            $table->decimal('temperature', 4, 1)->nullable();
            $table->decimal('weight', 5, 1)->nullable();
            $table->unsignedSmallInteger('height')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
