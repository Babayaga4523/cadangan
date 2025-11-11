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
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            // Find FK constraints that reference tests(id) from questions(test_id)
            $rows = DB::select("SELECT CONSTRAINT_NAME as name
                FROM information_schema.key_column_usage
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'questions'
                  AND COLUMN_NAME = 'test_id'
                  AND REFERENCED_TABLE_NAME = 'tests'");

            foreach ($rows as $r) {
                $name = $r->name;
                try {
                    DB::statement("ALTER TABLE `questions` DROP FOREIGN KEY `" . $name . "`");
                } catch (\Throwable $e) {
                    // ignore
                }
            }

            // Now alter column to varchar(36)
            DB::statement('ALTER TABLE `questions` MODIFY COLUMN `test_id` VARCHAR(36) NULL');

            // Recreate foreign key if tests.id exists
            // Try to add FK with conventional name
            try {
                DB::statement('ALTER TABLE `questions` ADD CONSTRAINT `questions_test_id_foreign` FOREIGN KEY (`test_id`) REFERENCES `tests`(`id`) ON DELETE CASCADE');
            } catch (\Throwable $e) {
                // ignore if cannot add
            }
        } elseif ($driver === 'pgsql') {
            // Drop constraint if exists
            DB::statement('DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu USING (constraint_name)
    WHERE tc.table_name = \'questions\' AND kcu.column_name = \'test_id\' AND tc.constraint_type = \'FOREIGN KEY\'
    LIMIT 1;
    IF constraint_name IS NOT NULL THEN
        EXECUTE \'ALTER TABLE "questions" DROP CONSTRAINT \' || constraint_name;
    END IF;
END $$;');
            DB::statement('ALTER TABLE "questions" ALTER COLUMN "test_id" TYPE VARCHAR(36)');
            DB::statement('ALTER TABLE "questions" ALTER COLUMN "test_id" DROP NOT NULL');
            try {
                DB::statement('ALTER TABLE "questions" ADD CONSTRAINT "questions_test_id_foreign" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE');
            } catch (\Throwable $e) {
            }
        } else {
            // SQLite or unknown - skip
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            try {
                DB::statement('ALTER TABLE `questions` DROP FOREIGN KEY `questions_test_id_foreign`');
            } catch (\Throwable $e) {}
            DB::statement('ALTER TABLE `questions` MODIFY COLUMN `test_id` BIGINT UNSIGNED NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "questions_test_id_foreign"');
            DB::statement('ALTER TABLE "questions" ALTER COLUMN "test_id" TYPE BIGINT');
        }
    }
};
