# Gambar Stimulus untuk Soal CBT

## Daftar Gambar yang Diperlukan:

1. **gunung-stimulus.jpg** - Gambar gunung untuk soal IPS
2. **persegi-panjang.jpg** - Gambar persegi panjang dengan ukuran 8cm x 5cm untuk soal Matematika
3. **paragraf-sample.jpg** - Gambar paragraf tentang kebersihan lingkungan untuk soal Bahasa Indonesia
4. **bagian-tumbuhan.jpg** - Diagram bagian-bagian tumbuhan dengan label A, B, C untuk soal IPA
5. **pancasila-symbol.jpg** - Gambar lambang Pancasila dengan nomor untuk soal PKN

## Cara Menambahkan Gambar:

1. Siapkan gambar sesuai dengan deskripsi di atas
2. Upload gambar ke folder `/backend/public/images/`
3. Pastikan nama file sesuai dengan yang tertera di seeder
4. Gambar akan dapat diakses melalui URL: `http://127.0.0.1:8000/images/nama-file.jpg`

## Alternatif: Menggunakan Placeholder

Jika belum ada gambar asli, Anda dapat:
- Gunakan placeholder dari https://via.placeholder.com/
- Atau buat gambar sederhana menggunakan tools online
- Atau gunakan gambar bebas dari Unsplash/Pexels

## Contoh Penggunaan di Soal:

Pada seeder, stimulus image disimpan sebagai:
```php
'stimulus' => '/images/gunung-stimulus.jpg',
'stimulus_type' => 'image'
```

Frontend akan menampilkan gambar dengan URL lengkap:
```
http://127.0.0.1:8000/images/gunung-stimulus.jpg
```
