"use client";
import { FileText, Grid } from 'lucide-react';

export default function SoalCBT() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      {/* Header */}
      <div className="w-[900px] bg-blue-100 border border-blue-200 rounded-2xl p-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 text-orange-500 rounded-full p-3">
            <FileText size={28} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              ESPS IPS 4 SD KELAS IV
            </h2>
            <p className="text-sm text-gray-600">
              Kenampakan Alam dan Pemanfaatannya
            </p>
          </div>
        </div>

        <button className="bg-orange-100 text-orange-600 font-medium px-4 py-2 rounded-full flex items-center gap-1 hover:bg-orange-200 transition text-sm">
          Daftar Soal <Grid size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="w-[900px] bg-white rounded-2xl shadow mt-8 p-8">
        {/* Soal */}
        <div className="mb-6">
          <div className="inline-block bg-blue-100 text-blue-800 font-semibold px-4 py-1 rounded-full text-sm mb-4">
            Soal No. 1
          </div>
          <p className="text-gray-800 text-base font-medium">
            Permukaan bumi yang menjulang tinggi ....
          </p>
        </div>

        {/* Pilihan Jawaban */}
        <div className="space-y-4">
          {['A. Laut', 'B. Selat', 'C. Gunung', 'D. Sungai'].map((item, index) => (
            <label
              key={index}
              className="block border border-blue-200 rounded-md px-4 py-3 cursor-pointer hover:bg-blue-50 transition"
            >
              <input type="radio" name="soal1" className="mr-3 accent-blue-500" />
              {item}
            </label>
          ))}
        </div>

        {/* Tombol Navigasi */}
        <div className="flex justify-between mt-10">
          <button className="bg-gray-100 text-gray-500 px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition">
            ‹ Sebelum
          </button>

          <button className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-orange-600 transition">
            Selanjutnya ›
          </button>
        </div>
      </div>
    </div>
  );
}
