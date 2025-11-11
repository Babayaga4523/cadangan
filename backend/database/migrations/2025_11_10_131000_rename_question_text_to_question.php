<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('questions', function (Blueprint $table) {
            if (Schema::hasColumn('questions', 'question_text') && !Schema::hasColumn('questions', 'question')) {
                $table->renameColumn('question_text', 'question');
            }
            if (!Schema::hasColumn('questions', 'question_text') && !Schema::hasColumn('questions', 'question')) {
                $table->text('question');
            }
        });
    }

    public function down()
    {
        Schema::table('questions', function (Blueprint $table) {
            if (Schema::hasColumn('questions', 'question')) {
                $table->renameColumn('question', 'question_text');
            }
        });
    }
};