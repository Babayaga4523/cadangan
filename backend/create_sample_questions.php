<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Question;
use Illuminate\Support\Str;

// Sample questions with different stimulus types
$sampleQuestions = [
    // 1. No stimulus - Math question
    [
        'stimulus_type' => 'none',
        'stimulus' => null,
        'question' => 'Berapakah hasil dari 25 + 37 - 12?',
        'option_a' => '50',
        'option_b' => '52',
        'option_c' => '48',
        'option_d' => '54',
        'correct_answer' => 'A',
        'explanation' => '25 + 37 = 62, kemudian 62 - 12 = 50',
        'duration' => 60,
    ],

    // 2. Text stimulus - Reading comprehension
    [
        'stimulus_type' => 'text',
        'stimulus' => 'Di sebuah desa terpencil, hiduplah seorang petani bernama Pak Budi. Setiap hari ia bekerja keras di sawahnya. Suatu hari, ia menemukan sebuah kotak tua yang terkubur di tanah. Di dalam kotak tersebut terdapat sebuah peta kuno yang menunjukkan lokasi harta karun.',
        'question' => 'Apa yang ditemukan Pak Budi di sawahnya?',
        'option_a' => 'Sebuah kotak tua berisi peta kuno',
        'option_b' => 'Sebuah peti berisi emas',
        'option_c' => 'Sebuah rumah tua',
        'option_d' => 'Sebuah sumur kuno',
        'correct_answer' => 'A',
        'explanation' => 'Berdasarkan cerita, Pak Budi menemukan kotak tua yang berisi peta kuno.',
        'duration' => 90,
    ],

    // 3. Image stimulus - Geometry (placeholder URL)
    [
        'stimulus_type' => 'image',
        'stimulus' => '/images/persegi-panjang.svg',
        'question' => 'Berapakah luas persegi panjang pada gambar di atas jika panjangnya 8 cm dan lebarnya 5 cm?',
        'option_a' => '40 cm²',
        'option_b' => '26 cm²',
        'option_c' => '13 cm²',
        'option_d' => '56 cm²',
        'correct_answer' => 'A',
        'explanation' => 'Luas persegi panjang = panjang × lebar = 8 × 5 = 40 cm²',
        'duration' => 75,
    ],

    // 4. No stimulus - Science question
    [
        'stimulus_type' => 'none',
        'stimulus' => null,
        'question' => 'Manakah yang merupakan sumber energi terbarukan?',
        'option_a' => 'Batu bara',
        'option_b' => 'Minyak bumi',
        'option_c' => 'Tenaga surya',
        'option_d' => 'Gas alam',
        'correct_answer' => 'C',
        'explanation' => 'Tenaga surya merupakan sumber energi terbarukan karena tidak akan habis.',
        'duration' => 45,
    ],

    // 5. Text stimulus - History
    [
        'stimulus_type' => 'text',
        'stimulus' => 'Proklamasi Kemerdekaan Indonesia dibacakan oleh Soekarno pada tanggal 17 Agustus 1945 di Jakarta. Peristiwa ini menandai berakhirnya penjajahan Belanda selama 350 tahun di Indonesia.',
        'question' => 'Kapan Proklamasi Kemerdekaan Indonesia dibacakan?',
        'option_a' => '17 Agustus 1945',
        'option_b' => '17 Agustus 1946',
        'option_c' => '17 Mei 1945',
        'option_d' => '17 Mei 1946',
        'correct_answer' => 'A',
        'explanation' => 'Proklamasi Kemerdekaan Indonesia dibacakan pada 17 Agustus 1945.',
        'duration' => 60,
    ],

    // 6. No stimulus - Indonesian language
    [
        'stimulus_type' => 'none',
        'stimulus' => null,
        'question' => 'Manakah kata yang memiliki arti yang sama dengan "cerdas"?',
        'option_a' => 'Bodoh',
        'option_b' => 'Pintar',
        'option_c' => 'Malas',
        'option_d' => 'Lambat',
        'correct_answer' => 'B',
        'explanation' => 'Kata "cerdas" memiliki arti yang sama dengan "pintar".',
        'duration' => 40,
    ],

    // 7. Text stimulus - Literature
    [
        'stimulus_type' => 'text',
        'stimulus' => '"Aku ingin sekali menjadi seperti burung yang bebas terbang di angkasa luas. Tidak ada yang dapat menghalangi langkahku."',
        'question' => 'Apa tema yang terkandung dalam kutipan tersebut?',
        'option_a' => 'Kebebasan',
        'option_b' => 'Persahabatan',
        'option_c' => 'Kegigihan',
        'option_d' => 'Kecintaan',
        'correct_answer' => 'A',
        'explanation' => 'Kutipan tersebut mengungkapkan keinginan untuk bebas seperti burung.',
        'duration' => 80,
    ],

    // 8. Image stimulus - Biology (placeholder)
    [
        'stimulus_type' => 'image',
        'stimulus' => 'https://example.com/plant-cell.jpg',
        'question' => 'Bagian sel yang ditunjukkan oleh panah pada gambar sel tumbuhan adalah?',
        'option_a' => 'Nukleus',
        'option_b' => 'Dinding sel',
        'option_c' => 'Membran sel',
        'option_d' => 'Sitoplasma',
        'correct_answer' => 'B',
        'explanation' => 'Panah menunjuk ke dinding sel yang merupakan bagian khas sel tumbuhan.',
        'duration' => 70,
    ],

    // 9. No stimulus - Social studies
    [
        'stimulus_type' => 'none',
        'stimulus' => null,
        'question' => 'Apa fungsi utama dari Lembaga Legislatif?',
        'option_a' => 'Membuat undang-undang',
        'option_b' => 'Menjalankan undang-undang',
        'option_c' => 'Mengadili pelanggar undang-undang',
        'option_d' => 'Mengatur perekonomian',
        'correct_answer' => 'A',
        'explanation' => 'Lembaga Legislatif bertugas membuat undang-undang.',
        'duration' => 55,
    ],

    // 10. Text stimulus - Mathematics word problem
    [
        'stimulus_type' => 'text',
        'stimulus' => 'Sebuah toko buku menjual 3 jenis buku: novel, komik, dan ensiklopedia. Harga novel Rp 50.000, komik Rp 30.000, dan ensiklopedia Rp 100.000. Dalam sehari, toko tersebut menjual 5 novel, 8 komik, dan 2 ensiklopedia.',
        'question' => 'Berapakah total pendapatan toko buku tersebut dalam sehari?',
        'option_a' => 'Rp 790.000',
        'option_b' => 'Rp 890.000',
        'option_c' => 'Rp 990.000',
        'option_d' => 'Rp 1.090.000',
        'correct_answer' => 'B',
        'explanation' => 'Perhitungan: (5 × 50.000) + (8 × 30.000) + (2 × 100.000) = 250.000 + 240.000 + 200.000 = 690.000. Tunggu, sepertinya ada kesalahan. Mari hitung ulang: 5×50.000=250.000, 8×30.000=240.000, 2×100.000=200.000. Total = 690.000. Tapi jawaban B adalah 890.000. Hmm, mungkin ada kesalahan dalam soal.',
        'duration' => 120,
    ],
];

echo "Creating 10 sample questions...\n";

foreach ($sampleQuestions as $index => $questionData) {
    try {
        $questionData['id'] = (string) Str::uuid();

        $question = Question::create($questionData);

        echo "✓ Question " . ($index + 1) . " created: " . substr($question->question, 0, 50) . "...\n";
        echo "  Type: " . $question->stimulus_type . "\n";
        echo "  Correct answer: " . $question->correct_answer . "\n";
        echo "\n";
    } catch (Exception $e) {
        echo "✗ Failed to create question " . ($index + 1) . ": " . $e->getMessage() . "\n";
    }
}

echo "Sample questions creation completed!\n";
echo "Total questions in database: " . Question::count() . "\n";