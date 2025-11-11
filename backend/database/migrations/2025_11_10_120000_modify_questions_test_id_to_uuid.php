<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // If 'test_id' doesn't exist, add it as a nullable UUID string.
        if (!Schema::hasColumn('questions', 'test_id')) {
            Schema::table('questions', function (Blueprint $table) {
                $table->string('test_id', 36)->nullable()->after('id');
            });
            return;
        }

        // If it exists, we need to drop any foreign key constraint first (MySQL will
        // refuse to modify a column used by a FK). We'll attempt to drop the FK by
        // conventional name and ignore errors if it doesn't exist.
        $driver = DB::getDriverName();
        try {
            if ($driver === 'mysql') {
                // Drop FK if present
                DB::statement('ALTER TABLE `questions` DROP FOREIGN KEY `questions_test_id_foreign`');
                // Modify column
                DB::statement('ALTER TABLE `questions` MODIFY COLUMN `test_id` VARCHAR(36) NULL');
                // Recreate FK to tests(id)
                DB::statement('ALTER TABLE `questions` ADD CONSTRAINT `questions_test_id_foreign` FOREIGN KEY (`test_id`) REFERENCES `tests`(`id`) ON DELETE CASCADE');
            } elseif ($driver === 'pgsql') {
                DB::statement('ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "questions_test_id_foreign"');
                DB::statement('ALTER TABLE "questions" ALTER COLUMN "test_id" TYPE VARCHAR(36)');
                DB::statement('ALTER TABLE "questions" ALTER COLUMN "test_id" DROP NOT NULL');
                DB::statement('ALTER TABLE "questions" ADD CONSTRAINT "questions_test_id_foreign" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE');
            } else {
                // For sqlite and others, altering column types is more involved; skip here.
            }
        } catch (\Throwable $e) {
            // If anything fails, rethrow so migrations surface the error.
            throw $e;
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            // Convert back to integer unsigned nullable (best-effort). Existing UUIDs may be truncated.
            DB::statement('ALTER TABLE `questions` MODIFY COLUMN `test_id` BIGINT UNSIGNED NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE "questions" ALTER COLUMN "test_id" TYPE BIGINT');
        }
    }
};
