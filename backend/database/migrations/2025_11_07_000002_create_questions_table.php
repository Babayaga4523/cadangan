<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('questions', function (Blueprint $table) {
            // UUID primary key to match related foreign keys
            $table->uuid('id')->primary();
            // test_id references tests.id (uuid)
            $table->uuid('test_id');
            $table->text('question_text');
            $table->text('stimulus')->nullable();
            $table->string('stimulus_type')->nullable();
            $table->timestamps();
            
            $table->foreign('test_id')->references('id')->on('tests')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('questions');
    }
};
