<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('answers', function (Blueprint $table) {
            $table->id();
            // question_id should match questions.id (uuid)
            $table->uuid('question_id');
            $table->text('answer_text');
            $table->boolean('is_correct')->default(false);
            $table->timestamps();
            
        $table->foreign('question_id')
            ->references('id')
            ->on('questions')
            ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('answers');
    }
};