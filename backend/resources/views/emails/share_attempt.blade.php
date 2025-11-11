<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Hasil Ujian CBT</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Poppins', sans-serif; background: #f8fafc; margin: 0; padding: 20px; color: #374151; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #E8F0FE; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #1e40af; }
    .logo { font-size: 32px; margin-bottom: 8px; }
    .card { background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 20px; }
    .info { margin-bottom: 16px; }
    .label { font-weight: 600; color: #4b5563; display: block; margin-bottom: 4px; }
    .value { font-weight: 500; color: #111827; }
    .score { font-size: 24px; font-weight: 700; color: #FF7A00; text-align: center; margin: 20px 0; }
    .btn { display: inline-block; background: #FF7A00; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; text-align: center; transition: background 0.3s; }
    .btn:hover { background: #e66a00; }
    .footer { background: #E8F0FE; border-radius: 12px; padding: 16px; text-align: center; color: #6b7280; font-size: 14px; }
    @media (max-width: 600px) { .header h1 { font-size: 24px; } .card { padding: 16px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">📚</div>
      <h1>{{ $attempt->test->title ?? 'Ujian CBT' }}</h1>
    </div>

    <div class="card">
      <h2 style="margin-top: 0; color: #1e40af;">Hasil Ujian Berhasil Dibagikan!</h2>
      <p>Berikut ringkasan hasil ujian Anda.</p>

      <div class="info">
        <span class="label">Nama Siswa:</span>
        <span class="value">{{ $attempt->user->name ?? 'Siswa' }}</span>
      </div>

      <div class="info">
        <span class="label">Mata Pelajaran:</span>
        <span class="value">{{ $attempt->test->title ?? 'Ujian' }}</span>
      </div>

      <div class="score">
        Nilai: {{ $score }}%
      </div>

      <div style="text-align: center; margin: 20px 0;">
        <a href="{{ config('app.url') }}/history" class="btn">Lihat Riwayat</a>
      </div>
    </div>

    <div class="footer">
      © 2025 Sistem CBT Sekolah. Semoga sukses dan terus belajar!
    </div>
  </div>
</body>
</html>
