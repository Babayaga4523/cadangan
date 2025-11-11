<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CBTTest;
use App\Models\Question;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Answer;
use App\Models\Attempt;
use App\Models\AttemptAnswer;

class CBTSeeder extends Seeder
{
    public function run()
    {
    // Temporarily disable foreign key checks in a DB-agnostic way
    Schema::disableForeignKeyConstraints();

    // Clear old data
    AttemptAnswer::truncate();
    Attempt::truncate();
    Answer::truncate();
    Question::truncate();
    CBTTest::truncate();

    // Re-enable foreign key checks
    Schema::enableForeignKeyConstraints();

        // ========== TEST 1: IPS SD Kelas IV ==========
        $test1 = CBTTest::create([
            'id' => (string) Str::uuid(),
            'title' => 'ESPS IPS 4 SD KELAS IV',
            'description' => 'Kenampakan Alam dan Pemanfaatannya',
            'duration_minutes' => 30
        ]);

        $q1 = Question::create([
            'id' => (string) Str::uuid(),
            'test_id' => $test1->id,
            'question_text' => 'Permukaan bumi yang menjulang tinggi disebut?',
            'stimulus' => null,
            'stimulus_type' => null,
            'explanation' => 'Gunung adalah bentuk permukaan bumi yang menjulang tinggi dengan ketinggian lebih dari 600 meter di atas permukaan laut. Gunung terbentuk dari aktivitas tektonik lempeng bumi atau aktivitas vulkanik.'
        ]);
        foreach ([
            ['Laut', false],
            ['Selat', false],
            ['Gunung', true],
            ['Sungai', false]
        ] as [$text, $correct]) {
            Answer::create([
                'question_id' => $q1->id,
                'answer_text' => $text,
                'is_correct' => $correct
            ]);
        }

        $q2 = Question::create([
            'id' => (string) Str::uuid(),
            'test_id' => $test1->id,
            'question_text' => 'Berdasarkan gambar di atas, bentuk kenampakan alam apakah yang ditunjukkan?',
            'stimulus' => '/images/gunung-stimulus.svg',
            'stimulus_type' => 'image',
            'explanation' => 'Gambar menunjukkan gunung dengan puncak yang menjulang tinggi. Gunung merupakan kenampakan alam yang terbentuk dari proses geologis dalam waktu yang sangat lama. Indonesia memiliki banyak gunung karena terletak di jalur cincin api Pasifik.'
        ]);
        foreach ([
            ['Lembah', false],
            ['Dataran tinggi', false],
            ['Gunung', true],
            ['Bukit', false]
        ] as [$text, $correct]) {
            Answer::create([
                'question_id' => $q2->id,
                'answer_text' => $text,
                'is_correct' => $correct
            ]);
        }

        // ========== TEST 2: Matematika SD Kelas V ==========
        $test2 = CBTTest::create([
            'id' => (string) Str::uuid(),
            'title' => 'Matematika SD Kelas V',
            'description' => 'Operasi Hitung Bilangan Bulat dan Pecahan',
            'duration_minutes' => 45
        ]);

        $q3 = Question::create([
            'id' => (string) Str::uuid(),
            'test_id' => $test2->id,
            'question_text' => 'Hasil dari 125 + 75 - 50 adalah...',
            'stimulus' => null,
            'stimulus_type' => null,
            'explanation' => 'Langkah penyelesaian: 125 + 75 = 200, kemudian 200 - 50 = 150. Jadi hasilnya adalah 150.'
        ]);
        foreach ([
            ['100', false],
            ['150', true],
            ['200', false],
            ['250', false]
        ] as [$text, $correct]) {
            Answer::create([
                'question_id' => $q3->id,
                'answer_text' => $text,
                'is_correct' => $correct
            ]);
        }

        $q4 = Question::create([
            'id' => (string) Str::uuid(),
            'test_id' => $test2->id,
            'question_text' => 'Perhatikan gambar di atas! Berapakah luas bangun datar tersebut?',
            'stimulus' => '/images/persegi-panjang.svg',
            'stimulus_type' => 'image',
            'explanation' => 'Dari gambar terlihat persegi panjang dengan panjang 8 cm dan lebar 5 cm. Rumus luas persegi panjang = panjang × lebar = 8 × 5 = 40 cm². Jadi luas bangun datar tersebut adalah 40 cm².'
        ]);
        foreach ([
            ['30 cm²', false],
            ['35 cm²', false],
            ['40 cm²', true],
            ['45 cm²', false]
        ] as [$text, $correct]) {
            Answer::create([
                'question_id' => $q4->id,
                'answer_text' => $text,
                'is_correct' => $correct
            ]);
        }

        // ========== TEST 3: Bahasa Indonesia SD Kelas VI ==========
        $test3 = CBTTest::create([
            'id' => (string) Str::uuid(),
            'title' => 'Bahasa Indonesia SD Kelas VI',
            'description' => 'Memahami Teks Narasi dan Kalimat Efektif',
            'duration_minutes' => 40
        ]);

        $q5 = Question::create([
            'id' => (string) Str::uuid(),
            'test_id' => $test3->id,
            'question_text' => 'Berdasarkan cerita di atas, siapa tokoh utama dalam cerita?',
            'stimulus' => 'Andi adalah seorang anak yang rajin belajar. Setiap hari ia bangun pagi untuk membantu orang tuanya sebelum berangkat ke sekolah. Suatu hari, ia menemukan seekor anak burung yang terjatuh dari sarangnya.',
            'stimulus_type' => 'text',
            'explanation' => 'Tokoh utama adalah karakter yang paling sering muncul dan menjadi pusat cerita. Dalam cerita ini, Andi adalah tokoh utama karena seluruh cerita berpusat pada aktivitas dan pengalaman Andi.'
        ]);
        foreach ([
            ['Orang tua Andi', false],
            ['Andi', true],
            ['Burung', false],
            ['Guru Andi', false]
        ] as [$text, $correct]) {
            Answer::create([
                'question_id' => $q5->id,
                'answer_text' => $text,
                'is_correct' => $correct
            ]);
        }

        $q6 = Question::create([
            'id' => (string) Str::uuid(),
            'test_id' => $test3->id,
            'question_text' => 'Perhatikan gambar di atas! Apa gagasan utama dari paragraf tersebut?',
            'stimulus' => '/images/paragraf-sample.svg',
            'stimulus_type' => 'image',
            'explanation' => 'Gagasan utama biasanya terletak pada kalimat utama paragraf. Kalimat utama bisa berada di awal (deduktif), akhir (induktif), atau di awal dan akhir (campuran). Dalam paragraf ini, gagasan utamanya adalah tentang pentingnya menjaga kebersihan lingkungan.'
        ]);
        foreach ([
            ['Cara membuang sampah', false],
            ['Pentingnya menjaga kebersihan lingkungan', true],
            ['Jenis-jenis sampah', false],
            ['Tempat pembuangan sampah', false]
        ] as [$text, $correct]) {
            Answer::create([
                'question_id' => $q6->id,
                'answer_text' => $text,
                'is_correct' => $correct
            ]);
        }

        // ========== TEST 4: IPA SD Kelas IV ==========
        $test4 = CBTTest::create([
            'id' => (string) Str::uuid(),
            'title' => 'IPA SD Kelas IV',
            'description' => 'Bagian-bagian Tumbuhan dan Fungsinya',
            'duration_minutes' => 35
        ]);

        $q7 = Question::create([
            'id' => (string) Str::uuid(),
            'test_id' => $test4->id,
            'question_text' => 'Perhatikan gambar di atas! Bagian yang ditunjuk oleh huruf A berfungsi untuk...',
            'stimulus' => '/images/bagian-tumbuhan.svg',
            'stimulus_type' => 'image',
            'explanation' => 'Huruf A pada gambar menunjuk ke bagian akar tumbuhan. Akar berfungsi untuk menyerap air dan mineral dari tanah, serta sebagai penyokong tubuh tumbuhan agar berdiri tegak. Akar juga dapat menyimpan cadangan makanan pada beberapa jenis tumbuhan.'
        ]);
        foreach ([
            ['Tempat fotosintesis', false],
            ['Menyerap air dan mineral', true],
            ['Tempat perkembangbiakan', false],
            ['Penguapan air', false]
        ] as [$text, $correct]) {
            Answer::create([
                'question_id' => $q7->id,
                'answer_text' => $text,
                'is_correct' => $correct
            ]);
        }

        $q8 = Question::create([
            'id' => (string) Str::uuid(),
            'test_id' => $test4->id,
            'question_text' => 'Proses pembuatan makanan oleh tumbuhan hijau disebut...',
            'stimulus' => null,
            'stimulus_type' => null,
            'explanation' => 'Fotosintesis adalah proses pembuatan makanan oleh tumbuhan hijau dengan bantuan sinar matahari. Proses ini terjadi pada daun yang mengandung klorofil (zat hijau daun). Bahan yang diperlukan adalah air, karbon dioksida (CO₂), dan sinar matahari. Hasilnya adalah glukosa (makanan) dan oksigen (O₂).'
        ]);
        foreach ([
            ['Respirasi', false],
            ['Fotosintesis', true],
            ['Transpirasi', false],
            ['Evaporasi', false]
        ] as [$text, $correct]) {
            Answer::create([
                'question_id' => $q8->id,
                'answer_text' => $text,
                'is_correct' => $correct
            ]);
        }

        // ========== TEST 5: PKN SD Kelas V ==========
        $test5 = CBTTest::create([
            'id' => (string) Str::uuid(),
            'title' => 'PKN SD Kelas V',
            'description' => 'Pancasila dan Nilai-nilai Luhur Bangsa',
            'duration_minutes' => 30
        ]);

        $q9 = Question::create([
            'id' => (string) Str::uuid(),
            'test_id' => $test5->id,
            'question_text' => 'Perhatikan gambar Pancasila di atas! Sila yang ditunjuk oleh nomor 1 berbunyi...',
            'stimulus' => '/images/pancasila-symbol.svg',
            'stimulus_type' => 'image',
            'explanation' => 'Sila pertama Pancasila dilambangkan dengan bintang bersudut lima berwarna emas dengan latar belakang hitam. Sila ini berbunyi "Ketuhanan Yang Maha Esa" yang mengandung makna bahwa bangsa Indonesia percaya dan takwa kepada Tuhan Yang Maha Esa sesuai dengan agama dan kepercayaan masing-masing.'
        ]);
        foreach ([
            ['Kemanusiaan yang adil dan beradab', false],
            ['Ketuhanan Yang Maha Esa', true],
            ['Persatuan Indonesia', false],
            ['Kerakyatan yang dipimpin oleh hikmat kebijaksanaan', false]
        ] as [$text, $correct]) {
            Answer::create([
                'question_id' => $q9->id,
                'answer_text' => $text,
                'is_correct' => $correct
            ]);
        }

        $q10 = Question::create([
            'id' => (string) Str::uuid(),
            'test_id' => $test5->id,
            'question_text' => 'Lambang sila ke-3 Pancasila adalah...',
            'stimulus' => null,
            'stimulus_type' => null,
            'explanation' => 'Sila ketiga Pancasila "Persatuan Indonesia" dilambangkan dengan pohon beringin. Pohon beringin dipilih karena memiliki akar yang kuat dan rindang, melambangkan persatuan dan kesatuan bangsa Indonesia yang kokoh dan melindungi seluruh rakyatnya.'
        ]);
        foreach ([
            ['Bintang', false],
            ['Rantai', false],
            ['Pohon beringin', true],
            ['Kepala banteng', false]
        ] as [$text, $correct]) {
            Answer::create([
                'question_id' => $q10->id,
                'answer_text' => $text,
                'is_correct' => $correct
            ]);
        }
    }
}
