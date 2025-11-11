<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('questions', function (Blueprint $table) {
            // Make sure all required columns exist and have correct names
            if (!Schema::hasColumn('questions', 'option_a')) {
                $table->string('option_a')->nullable();
            }
            if (!Schema::hasColumn('questions', 'option_b')) {
                $table->string('option_b')->nullable();
            }
            if (!Schema::hasColumn('questions', 'option_c')) {
                $table->string('option_c')->nullable();
            }
            if (!Schema::hasColumn('questions', 'option_d')) {
                $table->string('option_d')->nullable();
            }
            if (!Schema::hasColumn('questions', 'correct_answer')) {
                $table->string('correct_answer');
            }
            if (!Schema::hasColumn('questions', 'duration')) {
                $table->integer('duration')->default(60);
            }
            
            // Update question_text to question if needed
            if (Schema::hasColumn('questions', 'question_text') && !Schema::hasColumn('questions', 'question')) {
                $table->renameColumn('question_text', 'question');
            }
        });
    }

    public function down()
    {
        Schema::table('questions', function (Blueprint $table) {
            if (Schema::hasColumn('questions', 'question') && !Schema::hasColumn('questions', 'question_text')) {
                $table->renameColumn('question', 'question_text');
            }
        });
    }
};