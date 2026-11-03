<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_requests', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone');
            $table->date('requested_date');
            $table->time('requested_time');
            $table->string('reason')->nullable();
            $table->string('status')->default('pending');
            $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $table->text('doctor_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_requests');
    }
};
