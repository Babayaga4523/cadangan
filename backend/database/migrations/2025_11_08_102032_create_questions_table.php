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
        if (!Schema::hasTable('questions')) {
            Schema::create('questions', function (Blueprint $table) {
                $table->id();
                $table->string('stimulus_type'); // jenis stimulus: none, text, image
                $table->text('stimulus')->nullable(); // teks atau URL gambar
                $table->text('question'); // teks pertanyaan
                $table->string('option_a'); // pilihan jawaban A
                $table->string('option_b'); // pilihan jawaban B
                $table->string('option_c'); // pilihan jawaban C
                $table->string('option_d'); // pilihan jawaban D
                $table->string('correct_answer'); // kunci jawaban (A, B, C, D)
                $table->text('explanation')->nullable(); // penjelasan/pembahasan
                $table->integer('duration')->nullable(); // durasi pengerjaan soal (detik)
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
