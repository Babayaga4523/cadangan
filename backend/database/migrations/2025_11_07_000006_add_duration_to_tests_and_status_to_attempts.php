<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            if (! Schema::hasColumn('tests', 'duration_minutes')) {
                $table->integer('duration_minutes')->nullable()->after('description');
            }
        });

        Schema::table('attempts', function (Blueprint $table) {
            if (! Schema::hasColumn('attempts', 'status')) {
                $table->string('status')->default('in_progress')->after('started_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            if (Schema::hasColumn('tests', 'duration_minutes')) {
                $table->dropColumn('duration_minutes');
            }
        });

        Schema::table('attempts', function (Blueprint $table) {
            if (Schema::hasColumn('attempts', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
