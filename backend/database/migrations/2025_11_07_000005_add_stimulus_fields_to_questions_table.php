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
        Schema::table('questions', function (Blueprint $table) {
            if (! Schema::hasColumn('questions', 'stimulus')) {
                $table->text('stimulus')->nullable()->after('stimulus_image');
            }
            if (! Schema::hasColumn('questions', 'stimulus_type')) {
                $table->string('stimulus_type')->nullable()->after('stimulus');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            if (Schema::hasColumn('questions', 'stimulus_type')) {
                $table->dropColumn('stimulus_type');
            }
            if (Schema::hasColumn('questions', 'stimulus')) {
                $table->dropColumn('stimulus');
            }
        });
    }
};
