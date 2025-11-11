<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('attempt_answers', function (Blueprint $table) {
            $table->id();
            // attempt_id is uuid to match attempts.id
            $table->uuid('attempt_id');
            // question_id is uuid to match questions.id
            $table->uuid('question_id');
            $table->string('answer');
            $table->timestamps();

            $table->foreign('attempt_id')->references('id')->on('attempts')->onDelete('cascade');
            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('attempt_answers');
    }
};
