<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_name')->nullable();
            $table->string('guest_email')->nullable();
            $table->string('guest_phone')->nullable();
            $table->date('date');
            $table->time('time');
            $table->unsignedTinyInteger('duration')->default(30);
            $table->string('reason')->nullable();
            $table->string('status')->default('scheduled');
            $table->string('source')->default('doctor');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['date', 'time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
