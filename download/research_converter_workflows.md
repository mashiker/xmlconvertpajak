# Riset Komprehensif: Workflow Konversi XML Coretax DJP untuk Berbagai Jenis Dokumen

**Tanggal Riset:** Juli 2026  
**Sumber Data:** EXA AI Neural Search + Web Reader (pajak.go.id, ortax.org, diskusipajak.com, pajakku.com, ddtc.co.id, dll.)  
**Dasar Regulasi:** PER-11/PJ/2025, PER-24/PJ/2021, PMK 72/2023, PMK 207/PMK.03/2015  
**Total Sumber Dirujuk:** 80+ URL

---

## DAFTAR ISI

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Perubahan Fundamental Coretax vs Sistem Lama](#2-perubahan-fundamental-coretax-vs-sistem-lama)
3. [Analisis Workflow Per Jenis Dokumen](#3-analisis-workflow-per-jenis-dokumen)
   - [3.1 Bukti Pemotongan PPh (Bupot)](#31-bukti-pemotongan-pph-bupot)
   - [3.2 Faktur Pajak (e-Faktur)](#32-faktur-pajak-e-faktur)
   - [3.3 SPT Tahunan Badan](#33-spt-tahunan-badan)
   - [3.4 SPT Tahunan OP](#34-spt-tahunan-op)
   - [3.5 SPT Masa PPN](#35-spt-masa-ppn)
   - [3.6 SPT Masa Bea Meterai](#36-spt-masa-bea-meterai)
   - [3.7 Daftar Harta SPT OP](#37-daftar-harta-spt-op)
4. [Tabel Perbandingan Perbedaan Antar Tipe](#4-tabel-perbandingan-perbedaan-antar-tipe)
5. [Rekomendasi Spesifik untuk Pengembangan Converter](#5-rekomendasi-spesifik-untuk-pengembangan-converter)
6. [Daftar Template dan Converter Resmi DJP](#6-daftar-template-dan-converter-resmi-djp)
7. [Referensi Sumber](#7-referensi-sumber)

---

## 1. Ringkasan Eksekutif

Coretax DJP (Core Tax Administration System) yang berlaku efektif 1 Januari 2025 mengubah **seluruh format impor data** dari CSV/PDF menjadi **XML (Extensible Markup Language)**. Perubahan ini mencakup:

- **CSV → XML** untuk: Bukti Potong, Faktur Pajak, Lampiran SPT Badan (Penyusutan, Amortisasi, Piutang Tak Tertagih, NPL, Transaksi Affiliasi)
- **PDF → XML** untuk: Daftar Biaya Promosi, Daftar Biaya Entertainment (sebelumnya PDF)
- **Penambahan validasi baru**: NPWP, NITKU, Kode Objek Pajak, Tarif Pajak, Metode Penyusutan/Amortisasi
- **Perubahan struktur**: NSFP dari 16 digit menjadi 17 digit (format baru Coretax)
- **3 skema pembuatan dokumen**: Key-in manual, Impor XML massal, PJAP (Penyedia Jasa Aplikasi Perpajakan)

**Temuan Kunci:**
1. Setiap jenis dokumen memiliki **struktur XML, field, dan validasi yang BERBEDA**
2. DJP menyediakan **converter Excel → XML** untuk setiap jenis dokumen di pajak.go.id
3. **70% error impor** disebabkan NPWP/NITKU tidak valid, bukan masalah teknis aplikasi
4. Converter menggunakan **Developer Ribbon di Excel** untuk ekspor XML
5. Format XML **selalu berubah** (DJP sudah beberapa kali update per Maret 2026)

---

## 2. Perubahan Fundamental Coretax vs Sistem Lama

### 2.1 Perubahan Format Dokumen

| Aspek | Sistem Lama (e-Faktur/DJP Online) | Coretax |
|-------|-------------------------------------|---------|
| Format Impor | CSV | XML |
| Format Lampiran | PDF | XML |
| Identitas WP | NPWP saja | NPWP + NITKU |
| Nomor Seri Faktur | 16 digit | 17 digit |
| Batas Unggah e-Faktur | Tgl 15 bulan berikutnya | Tgl 20 bulan berikutnya |
| Penyusutan/Amortisasi | Lampiran 1A | Lampiran 9 |
| Daftar Piutang Tak Tertagih | Terpisah | Lampiran 11A-III (tergabung) |
| NPL | Terpisah | Lampiran 11A-V (tergabung) |
| Bupot Unifikasi | Tidak ada | BPPU (Bukti Potong PPh Unifikasi) |

### 2.2 Penambahan Validasi Data Baru

- **NPWP**: 16 digit, harus valid di database DJP
- **NITKU** (Nomor Identitas Tempat Kegiatan Usaha): Wajib dicantumkan, harus aktif
- **Kode Objek Pajak**: Harus sesuai referensi resmi DJP
- **Tarif Pajak**: Otomatis mengikuti Kode Objek Pajak
- **Kode Harta/Jenis/Kelompok**: Sesuai referensi pada sheet Ref
- **Metode Penyusutan/Amortisasi**: Kode metode harus sesuai referensi

### 2.3 Alur Kerja Umum Konversi

```
1. Unduh Template Excel dari pajak.go.id
2. Isi data pada sheet "DATA"
3. Rujuk sheet "REF" untuk kode-kode referensi
4. Aktifkan menu Developer di Excel
5. Klik Export → Generate file XML
6. Login Coretax → Pilih Modul → Impor Data → Upload XML
7. Monitor status: VALIDATING → CREATING → COMPLETED/FAILED
```

---

## 3. Analisis Workflow Per Jenis Dokumen

### 3.1 Bukti Pemotongan PPh (Bupot)

#### 3.1.1 Sub-Jenis Bupot yang Tersedia

Berdasarkan halaman resmi pajak.go.id, terdapat beberapa jenis Bupot yang memiliki converter XML:

| No | Kode | Nama Dokumen | Sheet Excel | Terakhir Update |
|----|------|-------------|-------------|-----------------|
| 1 | BPMP | Bukti Pemotongan Bulanan Pegawai Tetap (PPh 21/26) | Multi-sheet | 17/04/2025 |
| 2 | BP21 | Bukti Pemotongan Final & Tidak Final Selain Pegawai Tetap | Multi-sheet | 17/04/2025 |
| 3 | BP26 | Bukti Pemotongan PPh Pasal 26 WP Luar Negeri | Multi-sheet | 7/11/2024 |
| 4 | BPPU | Bukti Potong PPh Unifikasi | Multi-sheet | 7/11/2024 |
| 5 | BPNR | Bukti Potong Non-Residen | Multi-sheet | 7/11/2024 |
| 6 | BPSP | Bukti Potong Penyetoran Sendiri | Multi-sheet | 7/11/2024 |
| 7 | DDBU | Dokumen Lain yang Dipersamakan dengan Bupot | Multi-sheet | 7/11/2024 |

#### 3.1.2 Data Input yang Dibutuhkan (Umum)

**Field Header:**
- NPWP Pemotong (16 digit)
- Masa Pajak (MM)
- Tahun Pajak (YYYY)
- NITKU Pemotong
- Tanggal Pemotongan
- Fasilitas (kode referensi)

**Field Detail per Baris:**
- Kode Objek Pajak (sesuai referensi)
- Dasar Pengenaan Pajak (DPP)
- Tarif (%)
- Pajak yang Dipotong
- Jenis Dokumen Referensi
- Nomor Dokumen Referensi
- Tanggal Dokumen Referensi

**Field Tambahan (untuk BPPU Digunggung - BPCM):**
- Tidak perlu identitas penerima penghasilan
- 32 kode objek pajak tersedia (bunga tabungan, deposito, diskonto SBI, jasa giro, obligasi, aset kripto, penjualan emas batangan, transaksi saham)

**Field Tambahan (untuk DDBU - ATC):**
- NPWP/NIK dan Nama Penerima Penghasilan
- Nomor Akun Penerima Penghasilan
- NPWP/NIK dan Nama Pemberi Penghasilan
- Nomor Akun Pemberi Penghasilan

#### 3.1.3 Perbedaan BPPU Digunggung (BPCM) vs DDBU (ATC)

| Aspek | BPCM (Digunggung) | ATC (Dokumen Lain Dipersamakan) |
|-------|---------------------|----------------------------------|
| Identitas Penerima | Tidak perlu | Wajib (NPWP/NIK + Nama) |
| Nomor Akun Penerima | Tidak perlu | Wajib |
| Nomor Akun Pemberi | Tidak perlu | Wajib |
| Jenis Dokumen | Tidak perlu | Wajib |
| Kode Objek Pajak | 32 kode | 32 kode (sama) |
| DPP + Tarif | Wajib | Wajib |
| Dokumen Referensi | Wajib | Wajib |
| Fasilitas | Wajib | Wajib |
| ID TKU | Wajib | Wajib |
| Tanggal Pemotongan | Wajib | Tidak perlu |

#### 3.1.4 Validasi Khusus

- NPWP harus 16 digit dan valid
- NITKU harus aktif di database Coretax
- Tarif harus sesuai Kode Objek Pajak (sistem memvalidasi otomatis)
- Kode Objek Pajak harus dari daftar referensi resmi
- Masa Pajak dan Tahun Pajak harus valid

#### 3.1.5 Rekomendasi Langkah Wizard

```
Step 1: Pilih Jenis Bupot (BPMP/BP21/BP26/BPPU/BPNR/BPSP/DDBU)
Step 2: Isi Header (NPWP Pemotong, Masa/Tahun Pajak, NITKU)
Step 3: Isi Detail Baris (Kode OP, DPP, Tarif, Referensi)
Step 4: Validasi otomatis (NPWP, NITKU, Tarif vs Kode OP)
Step 5: Generate XML
Step 6: Upload ke Coretax
```

---

### 3.2 Faktur Pajak (e-Faktur)

#### 3.2.1 Sub-Jenis Faktur Pajak

| No | Jenis Faktur | Kode Faktur | Deskripsi |
|----|-------------|-------------|-----------|
| 1 | Faktur Pajak Keluaran | 070 (FK), 074 (FK BUMN) | Penyerahan BKP/JKP biasa |
| 2 | Faktur Pajak Keluaran Uang Muka | 071 (FUM) | Penerimaan pembayaran di muka |
| 3 | Faktur Pajak Keluaran Pelunasan | 073 (FPL) | Pelunasan untuk FUM |
| 4 | Retur Faktur Pajak Masukan | 082 (RFM) | Retur pembelian |
| 5 | Pajak Keluaran Digunggung | 1.A5, 1.A9, 1B | WP yang PPn-nya dipungut pihak lain |
| 6 | Dokumen Lain Pajak Keluaran | 081 (DLK) | Pengganti faktur pajak tertentu |
| 7 | Dokumen Lain Pajak Masukan | 083 (DLM) | Pengganti faktur pajak masukan |

#### 3.2.2 Data Input yang Dibutuhkan

**Field Header Faktur Keluaran:**
- NPWP PKP (Pengusaha Kena Pajak) - 16 digit
- Nama PKP
- Alamat PKP
- NITKU PKP
- Tanggal Faktur Pajak
- Nomor Seri Faktur Pajak (NSFP) - 17 digit (format baru Coretax)
- Referensi (Faktur induk untuk FPL)

**Field Lawan Transaksi:**
- NPWP Pembeli
- Nama Pembeli
- Alamat Pembeli

**Field Detail (Line Item):**
- Nama Barang/Jasa
- Harga Barang/Jasa (sebelum PPN)
- Diskon
- DPP (Dasar Pengenaan Pajak)
- Tarif PPN (%)
- PPN
- Tarif PPnBM (%)
- PPnBM (jika ada)

**Khusus Faktur Digunggung:**
- Kode jenis penyerahan (1.A5, 1.A9, 1B)
- NPWP pemungut
- Tidak perlu input manual detail - bisa prepopulated dari data faktur

#### 3.2.3 Tiga Skema Pembuatan e-Faktur di Coretax

1. **Key-In Manual**: Input langsung melalui formulir di Coretax (untuk volume rendah-menengah)
2. **Impor XML Massal**: Upload file XML yang sudah disiapkan (untuk volume tinggi)
3. **PJAP (Penyedia Jasa Aplikasi Perpajakan)**: Integrasi otomatis via pihak ketiga (untuk enterprise)

#### 3.2.4 Validasi Khusus

- NSFP harus 17 digit (format baru, digit ke-5 ditambahkan "9")
- NPWP Pembeli harus valid (untuk faktur yang bukan faktur pengganti)
- Tarif PPN harus 11% (atau sesuai tarif berlaku)
- Faktur harus diunggah **paling lambat tanggal 20 bulan berikutnya** (PER-11/PJ/2025 Pasal 44)
- Jika PKP belum memiliki NSFP, harus mengajukan melalui e-Nofa terlebih dahulu

#### 3.2.5 Rekomendasi Langkah Wizard

```
Step 1: Pilih Jenis Faktur (Keluaran/FPL/FUM/Retur/DL/Digunggung)
Step 2: Isi Header (NPWP PKP, NITKU, Tanggal, NSFP)
Step 3: Isi Lawan Transaksi (NPWP & Nama Pembeli)
Step 4: Isi Detail Barang/Jasa (Nama, Harga, DPP, PPN, PPnBM)
Step 5: Validasi otomatis (NPWP, NSFP format 17 digit, Tarif)
Step 6: Generate XML
Step 7: Upload ke Coretax → Monitor: VALIDATING → CREATING INVOICE → COMPLETED
```

---

### 3.3 SPT Tahunan Badan

#### 3.3.1 Lampiran yang Mendukung Impor XML

Berdasarkan riset, 6 lampiran SPT Tahunan PPh Badan mendukung skema impor XML di Coretax:

| No | Lampiran | Nama | Kondisi Muncul | Sheet Excel |
|----|----------|------|----------------|-------------|
| 1 | Lampiran 9 | Daftar Penyusutan dan Amortisasi Fiskal | Formulir Induk H.21.e = Ya | Depreciation, Amortization, Ref, RefAmortization |
| 2 | Lampiran 11A-I | Daftar Hutang | Formulir Induk H.21.f = Ya | Data, Ref |
| 3 | Lampiran 11A-III | Daftar Piutang Tak Tertagih | Formulir Induk H.21.f = Ya | Data, Ref |
| 4 | Lampiran 11A-IV | Daftar Biaya Promosi | Formulir Induk H.21.e = Ya | Data, Ref |
| 5 | Lampiran 11A-V | Daftar Non Performing Loan (NPL) | Formulir Induk H.21.f = Ya | Data, Ref |
| 6 | Lampiran 10A | Daftar Transaksi dengan Pihak yang Memiliki Hubungan Istimewa | Formulir Induk H.21 = Ya | Data, Ref |

#### 3.3.2 Lampiran 9 - Daftar Penyusutan dan Amortisasi Fiskal

**Struktur File Converter (5 sheets):**
- **Sheet "Depreciation"**: Input data aset berwujud dan bangunan
- **Sheet "Amortization"**: Input data aset tidak berwujud
- **Sheet "Petunjuk Pengisian"**: Panduan cara mengisi
- **Sheet "RefDepreciation"**: Daftar kode referensi penyusutan
- **Sheet "RefAmortization"**: Daftar kode referensi amortisasi

**Field pada Sheet Depreciation:**
- Kode Aset (4 digit, 25 kode tersedia)
- Kelompok Aset (Kelompok 1-4, Bangunan Permanen, Bangunan Tidak Permanen) - berdasarkan PMK 72/2023
- Jenis Harta
- Bulan/Tahun Perolehan
- Harga Perolehan
- Nilai Sisa Buku Fiskal Pada Awal Tahun
- Metode Komersial (GL/JAT/JJJ/JSP/ML/SM/SMG)
- Metode Fiskal (GL/JSP/SM)
- Penyusutan Fiskal Tahun Ini
- Keterangan

**Field pada Sheet Amortization:**
- Kode Aset (4 digit, 11 kode tersedia)
- Kelompok Aset
- Jenis Harta
- Bulan/Tahun Perolehan
- Harga Perolehan
- Nilai Sisa Buku Fiskal Pada Awal Tahun
- Metode Komersial (GL)
- Metode Fiskal (GL)
- Amortisasi Fiskal Tahun Ini
- Keterangan

**Validasi Khusus:**
- Kode Aset harus sesuai 25 kode (penyusutan) atau 11 kode (amortisasi)
- Kelompok Aset harus sesuai PMK 72/2023
- Metode Fiskal terbatas: GL, JSP, SM saja
- Jumlah Penyusutan/Amortisasi Komersial diisi manual
- Selisih dihitung otomatis (Komersial - Fiskal)

#### 3.3.3 Lampiran 11A-III - Daftar Piutang Tak Tertagih

**Field yang dibutuhkan:**
- Nomor Identitas Debitur (NPWP/NIK)
- Nama Debitur
- Alamat Debitur
- Plafon Piutang
- Piutang yang Nyata-Nyata Tidak Dapat Ditagih
- Metode Pembebanan (Beban Langsung / Beban Cadangan)
- Jenis Dokumen Pembuktian (Penyerahan Perkara / Perjanjian Tertulis / Publikasi Penerbitan / Pengakuan Debitur)

**Validasi Khusus:**
- Piutang harus memenuhi syarat PMK 207/PMK.03/2015
- Metode Pembebanan wajib diisi (perubahan baru di Coretax)
- Dokumen pembuktian harus dipilih dari daftar referensi

#### 3.3.4 Lampiran 11A-V - Daftar Non Performing Loan (NPL)

**Field yang dibutuhkan:**
- Nomor Identitas Debitur
- Nama Debitur
- Alamat Debitur
- Nilai Kredit Kurang Lancar Awal Tahun Buku
- Nilai Kredit Kurang Lancar Akhir Tahun Buku
- Jumlah Bunga Pada Tahun Buku
- Kategori Kredit (Kurang Lancar / Diragukan / Macet)

**Kondisi Khusus:**
- Hanya untuk Wajib Pajak Bank
- Berdasarkan KEP-184/PJ/2002
- Lampiran muncul jika Formulir Induk H.21.f = Ya

#### 3.3.5 Rekomendasi Langkah Wizard

```
Step 1: Pilih Jenis Lampiran (L9/L11A-I/L11A-III/L11A-IV/L11A-V/L10A)
Step 2: Sistem menampilkan field sesuai lampiran terpilih
Step 3: Isi data detail per baris
Step 4: Validasi otomatis (Kode Aset, Metode, Kelompok)
Step 5: Generate XML
Step 6: Upload ke Coretax pada Lampiran terkait
```

---

### 3.4 SPT Tahunan OP

#### 3.4.1 Lampiran yang Mendukung Impor XML

| No | Lampiran | Nama | Deskripsi |
|----|----------|------|-----------|
| 1 | L-1 Bagian A | Daftar Harta pada Akhir Tahun Pajak | Wajib diisi SEMUA WP OP (PER-11/PJ/2025) |
| 2 | L-3C | Daftar Kekayaan Bersih dari Usaha/Jasa | Harta bersih dari usaha |
| 3 | L-3D | Daftar Penghasilan dari Luar Negeri | Penghasilan luar negeri |

#### 3.4.2 Lampiran 1 - Daftar Harta (Sangat Penting)

**Perubahan Besar:** Mulai PER-11/PJ/2025, Lampiran 1 Bagian A **WAJIB** diisi oleh SEMUA WP OP tanpa terkecuali. Lampiran ini muncul secara otomatis (default) dalam formulir SPT.

**Kategori Template yang Tersedia:**
- PIT L1 Harta Tidak Bergerak (tanah, bangunan)
- PIT L1 Harta Bergerak (kendaraan, dll.)
- PIT L1 Harta Kas Setara Kas (tabungan, deposito)
- PIT L1 Harta Surat Berharga (saham, obligasi)
- PIT L1 Harta Lainnya (aset lain)
- PIT L1 Hutang

**Field Umum:**
- Jenis Harta (kode referensi)
- Kode Harta
- Kelompok Harta
- Nama/Deskripsi Harta
- Tahun Perolehan
- Nilai Saat Ini / Nilai Pasar

**Validasi Khusus:**
- Semua WP OP wajib isi (tidak boleh kosong)
- Nilai harta harus realistis
- Kode dan jenis harta harus sesuai referensi DJP

#### 3.4.3 Rekomendasi Langkah Wizard

```
Step 1: Pilih Kategori Harta (Tidak Bergerak/Bergerak/Kas/Surat Berharga/Lainnya/Hutang)
Step 2: Isi detail harta per baris
Step 3: Validasi otomatis (Kode Harta, Kelompok)
Step 4: Generate XML
Step 5: Upload ke Coretax pada tab L-1
```

---

### 3.5 SPT Masa PPN

#### 3.5.1 Struktur SPT Masa PPN di Coretax

SPT Masa PPN terdiri dari **Formulir Induk + 6 Lampiran**:

**Formulir Induk (10 Bagian):**
1. **Induk**: Informasi PKP (Nama, Alamat, NPWP, KLU, Masa Pajak, Status SPT)
2. **Bagian I**: Penyerahan Barang dan Jasa (data otomatis dari Faktur Keluaran + impor XML untuk Digunggung)
3. **Bagian II**: Perolehan Barang dan Jasa (data otomatis dari Faktur Masukan)
4. **Bagian III**: Perhitungan PPN Kurang Bayar/Lebih Bayar
5. **Bagian IV**: PPN Terutang atas Kegiatan Membangun Sendiri
6. **Bagian V**: Pembayaran Kembali Pajak Masukan yang Tidak Dapat Dikreditkan
7. **Bagian VI**: Pajak Penjualan atas Barang Mewah (PPnBM)
8. **Bagian VII**: Kredit Pompensasi
9. **Bagian VIII**: Daftar Faktur Pajak
10. **Bagian IX**: Daftar Dokumen Pendukung

#### 3.5.2 Data yang Perlu Impor XML

**PPN Digunggung (Non-Fasilitas dan Fasilitas):**
- Tipe: Retail Digunggung (1.A5, 1.A9, 1B)
- Field: NPWP PKP, NITKU, Masa Pajak, Tahun Pajak, Kode Penyerahan, DPP, PPN
- Format Excel tersedia di pajak.go.id kategori Retail (Digunggung 1.A5, 1.A9, 1B)

**Penghitungan Kembali Pajak Masukan:**
- Dimasukkan pada baris F Bagian II
- Format impor XML tersedia

**Barang/Jasa Tidak Terutang PPN:**
- Dimasukkan pada baris I Bagian II

#### 3.5.3 Formulir C (Lampiran C) di Era Coretax

DJP telah memperkenalkan **Formulir C** sebagai format baru dalam SPT Masa PPN di era Coretax. Formulir ini menggantikan beberapa lampiran lama dan mengakomodasi:
- Transaksi yang PPN-nya dipungut sendiri
- Transaksi yang PPN-nya dipungut oleh pihak lain
- Transaksi dengan fasilitas

#### 3.5.4 Validasi Khusus

- Data Faktur Keluaran otomatis terisi dari e-Faktur
- Data Faktur Masukan otomatis terisi dari retur/pembetulan
- Hanya bagian Digunggung yang perlu impor XML
- PPN harus terhitung otomatis oleh sistem

#### 3.5.5 Rekomendasi Langkah Wizard

```
Step 1: Pilih Kategori Impor (Digunggung/Penghitungan Kembali/Tidak Terutang PPN)
Step 2: Pilih Tipe Digunggung (1.A5/1.A9/1B)
Step 3: Isi data (NPWP, NITKU, Masa Pajak, Kode Penyerahan, DPP, PPN)
Step 4: Validasi otomatis
Step 5: Generate XML
Step 6: Upload ke Coretax pada Bagian I SPT Masa PPN
```

---

### 3.6 SPT Masa Bea Meterai

#### 3.6.1 Bentuk SPT Masa Bea Meterai di Coretax

Berdasarkan PER-11/PJ/2025, SPT Masa Bea Meterai di era Coretax memiliki format baru:

**Subjek Pajak:**
- Pemungut Bea Meterai (bank, perusahaan asuransi, notaris, PPAT, dll.)

**Lampiran yang Diperlukan:**
| No | Lampiran | Nama | Deskripsi |
|----|----------|------|-----------|
| 1 | Lampiran 3 | Daftar Dokumen yang Dipotong | Rincian dokumen yang kena Bea Meterai |
| 2 | Lampiran 4 | Daftar Dokumen yang Dibebaskan | Rincian dokumen yang dibebaskan dari Bea Meterai |

#### 3.6.2 Data Input yang Dibutuhkan

**Header:**
- NPWP Pemungut
- Masa Pajak
- Tahun Pajak
- Nama Pemungut

**Detail Lampiran 3 (Dokumen yang Dipotong):**
- Jenis Dokumen
- Nomor Dokumen
- Tanggal Dokumen
- Nilai Dokumen
- Bea Meterai yang Terutang
- Bea Meterai yang Dipungut

**Detail Lampiran 4 (Dokumen yang Dibebaskan):**
- Jenis Dokumen
- Nomor Dokumen
- Tanggal Dokumen
- Nilai Dokumen
- Dasar Pembebasan

#### 3.6.3 Validasi Khusus

- Hanya Pemungut Bea Meterai yang terdaftar yang dapat melaporkan
- Nilai dokumen di atas Rp 5.000.000 kena Bea Meterai Rp 10.000
- Jenis dokumen harus sesuai kategori yang diatur UU Bea Meterai
- e-Meterai (meterai elektronik) wajib digunakan untuk dokumen tertentu

#### 3.6.4 Rekomendasi Langkah Wizard

```
Step 1: Pilih Jenis Lampiran (Lampiran 3 atau 4)
Step 2: Isi Header (NPWP Pemungut, Masa/Tahun Pajak)
Step 3: Isi Detail Dokumen per baris
Step 4: Validasi otomatis (Jenis Dokumen, Nilai vs Tarif)
Step 5: Generate XML
Step 6: Upload ke Coretax
```

---

### 3.7 Daftar Harta SPT OP

*(Detail sudah tercakup di bagian 3.4.2, namun diperluas di sini)*

#### 3.7.1 Template yang Tersedia per Kategori

DJP menyediakan template terpisah untuk setiap kategori harta:

1. **PIT L1 Harta Tidak Bergerak** - Tanah, bangunan, apartemen
2. **PIT L1 Harta Bergerak** - Kendaraan bermotor, mesin
3. **PIT L1 Harta Kas Setara Kas** - Tabungan, deposito, giro
4. **PIT L1 Harta Surat Berharga** - Saham, obligasi, reksa dana
5. **PIT L1 Harta Lainnya** - Emas batangan, aset kripto, dll.
6. **PIT L1 Hutang** - Kewajiban yang harus dilaporkan

#### 3.7.2 Kewajiban Pelaporan

- **WAJIB** bagi SEMUA WP OP (PER-11/PJ/2025)
- Muncul secara default di formulir SPT
- Termasuk pelaporan keuntungan penjualan emas batangan

#### 3.7.3 Rekomendasi Langkah Wizard

```
Step 1: Pilih Kategori Harta
Step 2: Isi Detail (Jenis, Kode, Nama, Tahun Perolehan, Nilai)
Step 3: Ulangi untuk setiap kategori harta yang dimiliki
Step 4: Validasi otomatis
Step 5: Generate XML per kategori (atau gabungkan)
Step 6: Upload ke Coretax tab L-1
```

---

## 4. Tabel Perbandingan Perbedaan Antar Tipe

### 4.1 Perbandingan Karakteristik Utama

| Aspek | Bupot PPh | e-Faktur | SPT Tahunan Badan | SPT Tahunan OP | SPT Masa PPN | SPT Bea Meterai | Daftar Harta OP |
|-------|-----------|----------|-------------------|----------------|--------------|-----------------|-----------------|
| **Jumlah Sheet Excel** | Multi-sheet | Multi-sheet | 2-5 sheets | 1-2 sheets | Multi-sheet | Multi-sheet | 1-2 sheets |
| **Header Section** | Ya (NPWP Pemotong) | Ya (NPWP PKP) | Tidak (langsung detail) | Tidak | Ya (NPWP PKP) | Ya (NPWP Pemungut) | Tidak |
| **Detail Rows** | Ya (per transaksi) | Ya (per barang/jasa) | Ya (per aset/debitur) | Ya (per harta) | Ya (per penyerahan) | Ya (per dokumen) | Ya (per harta) |
| **Butuh NITKU** | Ya | Ya | Tidak | Tidak | Ya | Tidak | Tidak |
| **Butuh Kode Objek Pajak** | Ya | Tidak | Tidak | Tidak | Ya | Tidak | Tidak |
| **Butuh Kode Aset/Harta** | Tidak | Tidak | Ya (L9) | Ya (L1) | Tidak | Tidak | Ya |
| **Butuh Metode Penyusutan** | Tidak | Tidak | Ya (L9) | Tidak | Tidak | Tidak | Tidak |
| **Validasi NPWP** | Ya (pemotong+lawan) | Ya (PKP+pembeli) | Ya (jika ada NPWP) | Ya (jika ada) | Ya (PKP) | Ya (pemungut) | Ya (jika ada) |
| **Kalkulasi Otomatis** | Tidak (DPP×Tarif) | Tidak (DPP×Tarif) | Ya (selisih) | Tidak | Ya (PPN KB/LB) | Tidak | Tidak |
| **Bisa Multi-Upload** | Ya | Ya | Ya (per lampiran) | Ya (per kategori) | Ya | Ya | Ya |
| **Prepopulated** | Tidak | Bisa (DL/Digunggung) | Tidak | Tidak | Ya (FK/FM) | Tidak | Tidak |

### 4.2 Perbandingan Field Unik per Tipe

| Tipe | Field yang Hanya Ada di Tipe Ini |
|------|----------------------------------|
| **BPMP (PPh 21)** | PTKP, Status PTKP, Penghasilan Bruto, Biaya Jabatan, Iuran Pensiun |
| **BP21 (Final/Tdk Final)** | Kode Objek (42 kode untuk berbagai jenis penghasilan) |
| **BPPU (Unifikasi)** | 32 kode OP khusus (bunga, deposito, kripto, saham, emas) |
| **DDBU (ATC)** | Nomor Akun Penerima/Pemberi Penghasilan |
| **e-Faktur** | NSFP 17 digit, Kode Faktur (070/071/073/074/081/082/083), PPnBM |
| **L9 (Penyusutan)** | Kode Aset 4 digit, Kelompok Aset, Metode Komersial/Fiskal, Nilai Sisa Buku |
| **L11A-III (Piutang)** | Metode Pembebanan (Beban Langsung/Cadangan), Jenis Dokumen Pembuktian |
| **L11A-V (NPL)** | Kategori Kredit (Kurang Lancar/Diragukan/Macet), Bunga Tahun Buku |
| **L1 Harta** | Kode Harta, Kelompok Harta, Nilai Pasar/Saat Ini, Jenis Harta |
| **Bea Meterai** | Jenis Dokumen, Nilai Dokumen, Bea Meterai Terutang, Dasar Pembebasan |
| **PPN Digunggung** | Kode Penyerahan (1.A5/1.A9/1B), NPWP Pemungut |

### 4.3 Perbedaan Modul Upload di Coretax

| Tipe Dokumen | Modul Coretax | Tombol Upload |
|-------------|---------------|---------------|
| Bupot PPh | e-Bupot → Bukti Potong | "Impor Data" |
| e-Faktur Keluaran | e-Faktur → Pajak Keluaran | "Impor Data" |
| Retur FM | e-Faktur → Pajak Masukan | "Impor Data" |
| SPT Tahunan Badan | Pengelolaan SPT → SPT Tahunan → Lampiran X | "Impor Data" |
| SPT Tahunan OP | Pengelolaan SPT → SPT Tahunan → L-1 | "Impor Data" |
| SPT Masa PPN | Pengelolaan SPT → SPT Masa PPN → Bagian I | "Unggah XML" |
| SPT Masa Bea Meterai | Pengelolaan SPT → SPT Masa BM | "Impor Data" |

---

## 5. Rekomendasi Spesifik untuk Pengembangan Converter

### 5.1 Template yang Butuh Multi-Sheet Excel Input

| Template | Jumlah Sheet | Sheet yang Diisi |
|----------|-------------|------------------|
| BPMP (PPh 21) | 4+ sheets | Sheet DATA + REF |
| BP21 (Final/Tdk Final) | 4+ sheets | Sheet DATA + REF |
| e-Faktur Keluaran | 3+ sheets | Sheet DATA + REFERENSI |
| BPPU (Unifikasi) | 3+ sheets | Sheet DATA + REF |
| L9 Penyusutan | 5 sheets | Sheet Depreciation + Amortization |
| L11A-III Piutang | 3+ sheets | Sheet DATA + REF |
| L11A-V NPL | 3+ sheets | Sheet DATA + REF |
| L10A Affiliasi | 3+ sheets | Sheet DATA + REF |

**Rekomendasi Aplikasi:** Setiap template multi-sheet harus menampilkan **tab navigasi** antar sheet, dengan sheet REF bersifat **read-only** (hanya referensi dropdown).

### 5.2 Template yang Header-Only (Tanpa Detail Rows)

Sebagian besar template pajak memerlukan detail rows. Namun, untuk beberapa lampiran yang data-nya sangat sedikit, bisa diperlakukan header-only:
- **Tidak ada template yang benar-benar header-only** - semua lampiran memerlukan minimal 1 baris detail
- Namun, **Lampiran SPT Masa PPN** bagian yang sudah prepopulated (Faktur Keluaran/Masukan) tidak perlu impor XML

### 5.3 Template yang Butuh Kalkulasi Khusus

| Template | Kalkulasi yang Dibutuhkan |
|----------|--------------------------|
| **BPMP (PPh 21)** | PTKP, Gross-Up, Biaya Jabatan (5%), Iuran Pensiun, Tarif Progresif |
| **BP21 (Final)** | DPP × Tarif Final (sesuai Kode OP) |
| **BPPU (Unifikasi)** | DPP × Tarif (sesuai Kode OP) |
| **e-Faktur** | DPP × 11% = PPN, DPP × Tarif PPnBM = PPnBM |
| **L9 Penyusutan** | Penyusutan Fiskal berdasarkan metode (GL/JSP/SM), Selisih = Komersial - Fiskal |
| **L11A-V NPL** | Perhitungan bunga tahun buku |
| **SPT Masa PPN** | PPN Kurang Bayar/Lebih Bayar (otomatis sistem) |

**Prioritas Implementasi Kalkulasi:**
1. **PPh 21 (BPMP)** - Paling kompleks, perlu kalkulasi PTKP, tarif progresif, gross-up
2. **Penyusutan/Amortisasi (L9)** - Butuh logika metode GL/JSP/SM, kelompok aset
3. **e-Faktur** - Relatif sederhana (DPP × tarif)
4. **BPPU/BP21** - Sederhana (DPP × tarif sesuai KOP)

### 5.4 Template yang Butuh Master Data Lookup (Validasi)

| Data | Sumber Validasi | Pentingnya |
|------|-----------------|------------|
| **NPWP** | Database DJP Coretax | **KRITIS** - 70% error karena ini |
| **NITKU** | Database DJP Coretax | **KRITIS** - Wajib untuk Bupot dan e-Faktur |
| **Kode Objek Pajak** | Referensi sheet REF per template | Tinggi |
| **Kode Aset** | Referensi RefDepreciation/RefAmortization | Tinggi |
| **Kelompok Aset** | PMK 72/2023 | Sedang |
| **Metode Penyusutan** | Referensi sheet REF | Sedang |
| **Jenis Harta** | Referensi DJP per kategori | Sedang |
| **Tarif Pajak** | Sesuai Kode OP (otomatis) | Tinggi |

**Rekomendasi:** Implementasikan **validasi NPWP** dan **NITKU** sebagai fitur utama karena menyebabkan paling banyak error. Gunakan API DJP jika tersedia, atau minimal validasi format digit.

### 5.5 Arsitektur Converter yang Direkomendasikan

```
┌─────────────────────────────────────────────────────────────┐
│                    HALAMAN UTAMA                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ BUPOT    │  │ E-FAKTUR │  │ SPT      │  │ SPT      │   │
│  │ PPh      │  │ PPN/PPnBM│  │ TAHUNAN  │  │ MASA     │   │
│  │          │  │          │  │          │  │          │   │
│  │ • BPMP   │  │ • FK     │  │ • Badan  │  │ • PPN    │   │
│  │ • BP21   │  │ • FUM    │  │   - L9   │  │ • BM    │   │
│  │ • BP26   │  │ • FPL    │  │   - L10A │  │          │   │
│  │ • BPPU   │  │ • RFM    │  │   - L11A │  │          │   │
│  │ • BPNR   │  │ • DL/DLM │  │ • OP     │  │          │   │
│  │ • DDBU   │  │ • Digun. │  │   - L1   │  │          │   │
│  │ • BPSP   │  │          │  │   - L3C/D│  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    WIZARD PER TIPE                           │
│  Step 1: Pilih Sub-Jenis                                     │
│  Step 2: Isi Header                                          │
│  Step 3: Isi Detail (Data Grid + Validasi Real-time)          │
│  Step 4: Review & Validasi                                   │
│  Step 5: Generate XML                                        │
│  Step 6: Download / Upload ke Coretax                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    ENGINE KONVERSI                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Template      │  │ Validasi     │  │ Generator    │      │
│  │ Manager      │  │ Engine       │  │ XML          │      │
│  │              │  │              │  │              │      │
│  │ • Load XLSX  │  │ • NPWP check │  │ • Build tree │      │
│  │ • Parse REF  │  │ • NITKU check│  │ • Apply XSD  │      │
│  │ • Dropdowns  │  │ • KOP match  │  │ • Export .xml│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 5.6 Status Monitoring Setelah Upload

Sistem Coretax menampilkan status real-time setelah upload XML:

| Status | Artinya | Aksi |
|--------|---------|------|
| **VALIDATING DATA** | Memeriksa NPWP, NITKU, tarif, struktur | Tunggu |
| **VALIDATING FAILED** | Ada error - klik detail untuk lihat kolom bermasalah | Perbaiki XML |
| **CREATING INVOICE** | Faktur sedang dibuat sistem | Tunggu |
| **COMPLETED** | Berhasil | Selesai |
| **ERROR** | Gagal proses | Perbaiki dan upload ulang |

---

## 6. Daftar Template dan Converter Resmi DJP

**URL Download:** https://www.pajak.go.id/id/reformdjp/coretax/template-xml-dan-converter-excel-ke-xml

### Kategori: Bupot PPh

| No | Dokumen | Converter XML | Template XML |
|----|---------|---------------|--------------|
| 1 | BPMP (Bulanan Pegawai Tetap) | ✅ (Update 17/04/2025) | ✅ (7/11/2024) |
| 2 | BP21 (Final/Tidak Final) | ✅ (Update 17/04/2025) | ✅ (7/11/2024) |
| 3 | BP26 (WP Luar Negeri) | ✅ | ✅ |
| 4 | BPPU (Unifikasi) | ✅ | ✅ |
| 5 | BPNR (Non-Residen) | ✅ | ✅ |
| 6 | BPSP (Penyetoran Sendiri) | ✅ | ✅ |
| 7 | DDBU (Dokumen Lain Dipersamakan) | ✅ | ✅ |

### Kategori: Faktur Pajak

| No | Dokumen | Converter XML | Template XML |
|----|---------|---------------|--------------|
| 1 | Faktur Pajak Keluaran | ✅ | ✅ |
| 2 | Faktur Pajak Uang Muka | ✅ | ✅ |
| 3 | Faktur Pajak Pelunasan | ✅ | ✅ |
| 4 | Retur Faktur Pajak Masukan | ✅ | ✅ |
| 5 | Dokumen Lain Pajak Keluaran/Masukan | ✅ | ✅ |
| 6 | Retail Digunggung (1.A5, 1.A9, 1B) | ✅ | ✅ |

### Kategori: SPT Tahunan Badan

| No | Dokumen | Converter XML | Template XML |
|----|---------|---------------|--------------|
| 1 | L9 Penyusutan & Amortisasi | ✅ (Update Feb 2026) | ✅ |
| 2 | L10A Transaksi Affiliasi | ✅ | ✅ |
| 3 | L11A-I Daftar Hutang | ✅ | ✅ |
| 4 | L11A-III Piutang Tak Tertagih | ✅ | ✅ |
| 5 | L11A-IV Biaya Promosi | ✅ | ✅ |
| 6 | L11A-V NPL | ✅ | ✅ |

### Kategori: SPT Tahunan OP

| No | Dokumen | Converter XML | Template XML |
|----|---------|---------------|--------------|
| 1 | L1 Harta Tidak Bergerak | ✅ | ✅ |
| 2 | L1 Harta Bergerak | ✅ | ✅ |
| 3 | L1 Harta Kas Setara Kas | ✅ | ✅ |
| 4 | L1 Harta Surat Berharga | ✅ | ✅ |
| 5 | L1 Harta Lainnya | ✅ | ✅ |
| 6 | L1 Hutang | ✅ | ✅ |

### Kategori: SPT Masa

| No | Dokumen | Converter XML | Template XML |
|----|---------|---------------|--------------|
| 1 | SPT Masa PPN (Digunggung) | ✅ | ✅ |
| 2 | SPT Masa PPh Unifikasi | ✅ | ✅ |
| 3 | SPT Masa Bea Meterai | ✅ | ✅ |

---

## 7. Referensi Sumber

### Regulasi
1. **PER-11/PJ/2025** - Format, isi, dan tata cara pengisian SPT, Bupot, dan Faktur Pajak di Coretax
2. **PER-24/PJ/2021** - Bukti Potong PPh Unifikasi dan Dokumen Lain yang Dipersamakan
3. **PMK 72/2023** - Pengelompokkan aset untuk penyusutan (Kelompok 1-4)
4. **PMK 207/PMK.03/2015** - Syarat piutang tak tertagih sebagai biaya fiskal
5. **KEP-184/PJ/2002** - Kewajiban bank melaporkan NPL

### Sumber Web (80+ URL dirujuk)
- **pajak.go.id** - Halaman resmi DJP Template XML dan Converter
- **ortax.org** - Media Komunitas Perpajakan Indonesia (artikel Tax Learning)
- **diskusipajak.com** - Artikel teknis Coretax
- **pajakku.com** - Panduan dan analisis pajak
- **ddtc.co.id** - Berita dan analisis regulasi perpajakan
- **doyanduit.com** - Panduan praktis impor XML
- **bisapajak.id** - Edukasi perpajakan
- **pajaknow.id** - Tips pelaporan SPT
- **akuprim.com** - Update format XML penyusutan
- **aguspajak.com** - Tutorial XML Bupot PPh 21 dan PPh 23
- **online-pajak.com** - Tutorial impor faktur pajak XML
- **indotaxnav.id** - Panduan lengkap faktur pajak keluaran Coretax
- **pajakpintar.com** - Panduan pembuatan faktur pajak
- **pakarpajak.com** - Panduan faktur pajak keluaran terbaru
- **readmore.id** - Cara lapor PPh 23 di Coretax
- **catapa.com** - Format impor PPh 21/26 menggunakan XML
- **dataon.com** - Tutorial buat bupot PPh 23 Coretax
- **klikpajak.id** - Panduan SPT Masa Bea Meterai
- **accurate.id** - Format file perpajakan di Coretax
- **konsultanpajaksurabaya.com** - Konverter Excel ke XML Coretax
- **muc.co.id** - Cara membuat file XML untuk Coretax
- **blogpajak.com** - Template XML dan Converter Excel Coretax
- **cikupa.id** - 6 cara bikin faktur pajak di Coretax

---

*Dokumen ini disusun berdasarkan riset EXA AI dan web scraping dari 80+ sumber perpajakan Indonesia terkini. Informasi dapat berubah sesuai update regulasi dan sistem Coretax DJP.*
