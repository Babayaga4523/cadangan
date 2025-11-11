<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('attempts', function (Blueprint $table) {
            // UUID primary for attempts
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            // test_id references tests.id (uuid)
            $table->uuid('test_id');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->float('score')->nullable();
            $table->string('status')->default('in_progress');
            $table->timestamps();

            $table->foreign('test_id')->references('id')->on('tests')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('attempts');
    }
};
