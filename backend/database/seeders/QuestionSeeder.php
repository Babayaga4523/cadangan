<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Question;
use App\Models\Answer;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Hapus soal yang sudah ada untuk test 'latihan-1'
        Question::where('test_id', 'latihan-1')->delete();

        // Soal 1: Tanpa stimulus (teks)
        $q1 = Question::create([
            'id' => Str::uuid(),
            'test_id' => 'latihan-1',
            'question_text' => 'Berapakah hasil dari 2 + 3?',
            'stimulus_type' => 'none',
            'stimulus' => null,
            'explanation' => 'Penjumlahan dasar: 2 + 3 = 5'
        ]);
        $q1->answers()->createMany([
            ['answer_text' => '4', 'is_correct' => false],
            ['answer_text' => '5', 'is_correct' => true],
            ['answer_text' => '6', 'is_correct' => false],
            ['answer_text' => '7', 'is_correct' => false]
        ]);

        // Soal 2: Dengan stimulus teks
        $q2 = Question::create([
            'id' => Str::uuid(),
            'test_id' => 'latihan-1',
            'question_text' => 'Berdasarkan teks berikut, siapakah yang menulis puisi tersebut?',
            'stimulus_type' => 'text',
            'stimulus' => 'Aku ingin hidup seribu tahun lagi. Aku ingin melihat dunia berubah. - Chairil Anwar',
            'explanation' => 'Teks tersebut adalah kutipan dari puisi Chairil Anwar'
        ]);
        $q2->answers()->createMany([
            ['answer_text' => 'Chairil Anwar', 'is_correct' => true],
            ['answer_text' => 'Sapardi Djoko Damono', 'is_correct' => false],
            ['answer_text' => 'W.S. Rendra', 'is_correct' => false],
            ['answer_text' => 'Goenawan Mohamad', 'is_correct' => false]
        ]);

                // Soal 3: Tanpa stimulus
        $q3 = Question::create([
            'id' => Str::uuid(),
            'test_id' => 'latihan-1',
            'question_text' => 'Apa ibukota Indonesia?',
            'stimulus_type' => 'none',
            'stimulus' => null,
            'explanation' => 'Jakarta adalah ibukota Indonesia'
        ]);
        $q3->answers()->createMany([
            ['answer_text' => 'Jakarta', 'is_correct' => true],
            ['answer_text' => 'Surabaya', 'is_correct' => false],
            ['answer_text' => 'Bandung', 'is_correct' => false],
            ['answer_text' => 'Medan', 'is_correct' => false]
        ]);

        // Soal 4: Dengan stimulus gambar
        $q4 = Question::create([
            'id' => Str::uuid(),
            'test_id' => 'latihan-1',
            'question_text' => 'Berdasarkan gambar berikut, apa yang ditampilkan?',
            'stimulus_type' => 'image',
            'stimulus' => 'images/sample1.svg',
            'explanation' => 'Gambar menampilkan contoh SVG'
        ]);
        $q4->answers()->createMany([
            ['answer_text' => 'Asia', 'is_correct' => true],
            ['answer_text' => 'Afrika', 'is_correct' => false],
            ['answer_text' => 'Eropa', 'is_correct' => false],
            ['answer_text' => 'Amerika', 'is_correct' => false]
        ]);

        // Soal 5: Dengan stimulus teks
        $q5 = Question::create([
            'id' => Str::uuid(),
            'test_id' => 'latihan-1',
            'question_text' => 'Menurut teks berita, kapan peristiwa tersebut terjadi?',
            'stimulus_type' => 'text',
            'stimulus' => 'Jakarta, 15 Agustus 2023 - Presiden Joko Widodo menyampaikan pidato kemerdekaan di Istana Negara.',
            'explanation' => 'Teks menyebutkan tanggal 15 Agustus 2023'
        ]);
        $q5->answers()->createMany([
            ['answer_text' => '15 Agustus 2023', 'is_correct' => true],
            ['answer_text' => '17 Agustus 2023', 'is_correct' => false],
            ['answer_text' => '15 Agustus 2022', 'is_correct' => false],
            ['answer_text' => '17 Agustus 2022', 'is_correct' => false]
        ]);

                // Soal 6: Tanpa stimulus
        $q6 = Question::create([
            'id' => Str::uuid(),
            'test_id' => 'latihan-1',
            'question_text' => 'Berapakah 10 x 8?',
            'stimulus_type' => 'none',
            'stimulus' => null,
            'explanation' => 'Perkalian: 10 x 8 = 80'
        ]);
        $q6->answers()->createMany([
            ['answer_text' => '70', 'is_correct' => false],
            ['answer_text' => '80', 'is_correct' => true],
            ['answer_text' => '90', 'is_correct' => false],
            ['answer_text' => '100', 'is_correct' => false]
        ]);

        // Soal 7: Dengan stimulus gambar
        $q7 = Question::create([
            'id' => Str::uuid(),
            'test_id' => 'latihan-1',
            'question_text' => 'Berdasarkan gambar berikut, apa yang ditampilkan?',
            'stimulus_type' => 'image',
            'stimulus' => 'images/sample1.svg',
            'explanation' => 'Gambar menampilkan contoh SVG'
        ]);
        $q7->answers()->createMany([
            ['answer_text' => 'Makanan', 'is_correct' => true],
            ['answer_text' => 'Transportasi', 'is_correct' => false],
            ['answer_text' => 'Pendidikan', 'is_correct' => false],
            ['answer_text' => 'Rekreasi', 'is_correct' => false]
        ]);

        // Soal 8: Dengan stimulus teks
        $q8 = Question::create([
            'id' => Str::uuid(),
            'test_id' => 'latihan-1',
            'question_text' => 'Apa tema utama dari cerita pendek tersebut?',
            'stimulus_type' => 'text',
            'stimulus' => 'Dalam sebuah desa kecil, hidup seorang pemuda miskin bernama Amir. Ia bekerja keras setiap hari untuk membantu keluarganya. Suatu hari, Amir menemukan sebuah cincin ajaib yang memberikan keberuntungan. Namun, Amir tetap rendah hati dan menggunakan keberuntungannya untuk membantu orang lain.',
            'explanation' => 'Cerita menekankan pentingnya kerendahan hati dan membantu sesama'
        ]);
        $q8->answers()->createMany([
            ['answer_text' => 'Kerendahan hati', 'is_correct' => true],
            ['answer_text' => 'Kekayaan', 'is_correct' => false],
            ['answer_text' => 'Keberuntungan', 'is_correct' => false],
            ['answer_text' => 'Kemandirian', 'is_correct' => false]
        ]);

                // Soal 9: Tanpa stimulus
        $q9 = Question::create([
            'id' => Str::uuid(),
            'test_id' => 'latihan-1',
            'question_text' => 'Planet manakah yang terdekat dengan Matahari?',
            'stimulus_type' => 'none',
            'stimulus' => null,
            'explanation' => 'Merkurius adalah planet terdekat dengan Matahari'
        ]);
        $q9->answers()->createMany([
            ['answer_text' => 'Merkurius', 'is_correct' => true],
            ['answer_text' => 'Venus', 'is_correct' => false],
            ['answer_text' => 'Bumi', 'is_correct' => false],
            ['answer_text' => 'Mars', 'is_correct' => false]
        ]);

        // Soal 10: Dengan stimulus gambar
        $q10 = Question::create([
            'id' => Str::uuid(),
            'test_id' => 'latihan-1',
            'question_text' => 'Berdasarkan gambar berikut, apa yang ditampilkan?',
            'stimulus_type' => 'image',
            'stimulus' => 'images/sample1.svg',
            'explanation' => 'Gambar menampilkan contoh SVG'
        ]);
        $q10->answers()->createMany([
            ['answer_text' => 'Desember', 'is_correct' => true],
            ['answer_text' => 'November', 'is_correct' => false],
            ['answer_text' => 'Januari', 'is_correct' => false],
            ['answer_text' => 'Februari', 'is_correct' => false]
        ]);

        $this->command->info('Berhasil membuat 10 soal dengan berbagai tipe stimulus untuk test latihan-1');
    }
}
