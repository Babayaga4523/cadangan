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
        Schema::table('tests', function (Blueprint $table) {
            $table->timestamp('start_date')->nullable()->after('duration_minutes');
            $table->timestamp('end_date')->nullable()->after('start_date');
            $table->boolean('is_active')->default(true)->after('end_date');
            $table->boolean('randomize_questions')->default(false)->after('is_active');
            $table->boolean('show_results_immediately')->default(false)->after('randomize_questions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'end_date', 'is_active', 'randomize_questions', 'show_results_immediately']);
        });
    }
};
