# Per-Template Workflow Analysis
## XML Converter Coretax DJP — Perbedaan Langkah per Jenis Template

**Tanggal:** 1 April 2026  
**Status:** Deep research selesai  

---

## Overview: Kenapa Setiap Template Berbeda?

Setiap jenis converter XML di Coretax punya **flow berbeda** karena:

1. **Struktur XML berbeda** — root element, child element, field wajib berbeda per jenis
2. **Menu Coretax berbeda** — eBupot vs eFaktur vs SPT, masing-masing punya submenu sendiri
3. **Validasi berbeda** — NPWP vs NIK, format tanggal, kode transaksi spesifik
4. **Jumlah sheet Excel berbeda** — ada yang 2 sheet (DATA + REF), ada yang 5+ sheet
5. **Proses signing berbeda** — Bupot perlu signer, Faktur perlu Confirm Sign + NSFP

---

## 1. Kategori eBupot PPh 21/26 (Bukti Potong)

### 1.1 BPMP — Bukti Pemotongan Bulanan Pegawai Tetap

**Menu Coretax:** eBupot → BPMP (Bukti Potong Bulanan Pegawai Tetap)  
**Use Case:** HR/Payroll lapor PPh 21 pegawai tetap tiap bulan  
**XML Root:** `<MmPayrollBulk>` → `<MmPayroll>`  

**Flow User:**
```
1. Download "BPMP Excel to XML.xlsx" dari pajak.go.id
2. Buka Excel → Aktifkan Developer Tab
3. Sheet "BPMP": Berisi panduan kolom + mapping Excel→XML
4. Sheet "DATA": Isi data pegawai (NIK, PTKP, KOP, Bruto, Tarif, NITKU, Tgl Pemotongan)
5. Sheet "REF": Referensi KOP, PTKP, Fasilitas, CounterpartOpt
6. Developer → Export → Save as "XML Data"
7. Login Coretax → eBupot → BPMP → Import Data → Upload XML
8. System validate → Jika valid → Submit → Sign → Terbitkan
```

**Karakteristik Unik:**
- NPWP Pemotong diisi **1x di root level** (bukan per record)
- Field "CounterpartTin" pakai **NIK 16 digit** untuk WNI, NPWP untuk WNA
- Tarif **otomatis terisi** dari tabel TER berdasarkan KOP
- CounterpartPassport: kosong = `xsi:nil="true"`
- Status PTKP: TK/0 sampai HB/3
- **Batch friendly** — 1 XML bisa isi banyak pegawai (max 100)

**Smart Defaults yang Bisa Kita Kasih:**
- NPWP Pemotong → auto-fill dari Settings
- Masa Pajak → default bulan sekarang
- KOP → default `21-100-01` (pegawai tetap)
- Tarif → auto-populate dari KOP selection
- NITKU → auto-fill dari Settings

---

### 1.2 BP21 — Bukti Pemotongan Final & Tidak Final

**Menu Coretax:** eBupot → BP21 (Final/Tidak Final Bukan Pegawai Tetap)  
**Use Case:** Potong PPh 21 atas honorarium, tenaga ahli, upah tidak tetap, dll  
**XML Root:** `<Bp21Bulk>` → `<Bp21>`  

**Flow User:**
```
1. Download "BP21 Excel to XML.xlsx"
2. Sheet "BP21": Panduan kolom (16 field)
3. Sheet "DATA": Isi data penerima penghasilan
4. Sheet "REF": Referensi KOP (32 kode), Fasilitas, Document Types
5. Developer → Export → XML
6. Coretax → eBupot → BP21 → Import → Upload
7. Validate → Submit → Sign → Terbitkan
```

**Karakteristik Unik:**
- Ada field **Deemed** (Norma Penghasilan) — persentase 0-100%
- Ada field **Document** (jenis dok referensi) — TaxInvoice, CommercialInvoice, Contract, dll
- KOP lebih banyak (32+ kode) — pegawai tidak tetap, tenaga ahli, agen, dll
- **Tarif bervariasi** — TER, PS17, atau angka fix tergantung KOP
- IDPlaceOfBusinessActivityOfIncomeRecipient → NITKU **penerima** (bukan pemotong)

**Perbedaan vs BPMP:**
| Aspek | BPMP | BP21 |
|-------|------|------|
| Target | Pegawai tetap | Bukan pegawai tetap / final |
| Field Deemed | ❌ Tidak ada | ✅ Ada (0-100%) |
| Field Document | ❌ Tidak ada | ✅ Ada (jenis dok referensi) |
| NITKU | Pemotong saja | Pemotong + Penerima |
| KOP | 3 kode | 32+ kode |
| ID Penerima | NIK/NPWP | NPWP + NITKU penerima |

---

### 1.3 BP26 — Bukti Pemotongan PPh 26 (WP Luar Negeri)

**Menu Coretax:** eBupot → BP26 (Pemotongan PPh 26)  
**Use Case:** Potong PPh 26 atas pembayaran ke WP luar negeri  
**XML Root:** `<WmWithholdingTax>`  

**Flow User:**
```
1. Download "BP26 Excel to XML.xlsx"
2. Sheet "BP26": Panduan kolom (22 field — paling banyak!)
3. Sheet "DATA": Isi data WP luar negeri
4. Sheet "REF": Referensi KOP, Fasilitas, Document, KODE NEGARA (249 negara!)
5. Developer → Export → XML
6. Coretax → eBupot → BP26 → Import → Upload
7. Validate → Submit → Sign → Terbitkan
```

**Karakteristik Unik:**
- Field **CounterpartTin** bisa berupa TIN luar negeri (bukan NPWP!)
- Field **CounterpartCountry** — ISO 3166-1 alpha-3 (249 negara)
- Field **CounterpartDob** (tanggal lahir) & **CounterpartBirthCity** (tempat lahir)
- Field **CounterpartKitas** — khusus WNA yang ada KITAS
- Field **CounterpartName** — nama lengkap WP luar negeri
- Field **CounterpartAddress** — alamat luar negeri
- Fasilitas: **SKD** (Surat Keterangan Domisili) — unik untuk BP26
- Nomor Fasilitas wajib diisi kalau pakai SKD

**Perbedaan vs BP21/BPMP:**
| Aspek | BPMP/BP21 | BP26 |
|-------|-----------|------|
| Target | WP Dalam Negeri | WP Luar Negeri |
| ID Penerima | NIK/NPWP | TIN asing / NPWP |
| Negara | ❌ | ✅ Kode negara |
| Paspor | ❌ / opsional | ✅ Opsional |
| KITAS | ❌ | ✅ Opsional |
| Nama Penerima | ❌ (di NIK) | ✅ Wajib |
| Alamat | ❌ | ✅ Wajib |
| Tempat/Tgl Lahir | ❌ | ✅ Opsional |
| Fasilitas SKD | ❌ | ✅ Khusus |

---

### 1.4 BPA1 — Bukti Pemotongan A1 (Tahunan/Annual)

**Menu Coretax:** eBupot → BPA1 (SPT Tahunan A1)  
**Use Case:** Lapor SPT Tahunan PPh 21 pegawai tetap  
**XML Root:** `<A1Bulk>` → `<A1>`  

**Flow User:**
```
1. Download "BPA1 Excel to XML.xlsx"
2. Sheet "BPA1": Panduan kolom (28 field — paling kompleks!)
3. Sheet "DATA": Isi data rekap tahunan per pegawai
4. Sheet "REF": Referensi KOP (3 kode), PTKP, Fasilitas
5. Developer → Export → XML
6. Coretax → eBupot → BPA1 → Import → Upload
7. Validate → Submit → Sign → Terbitkan
```

**Karakteristik Unik:**
- Field **WorkForSecondEmployer** — apakah kerja di 2 tempat
- Field **StatusOfWithholding** — FullYear / PartialYear / Annualized
- Field **NumberOfMonths** — jumlah bulan kerja (0 jika FullYear)
- **Banyak komponen penghasilan** (bukan hanya 1 bruto):
  - Gaji (SalaryPensionJhtTht)
  - Tunjangan PPh (IncomeTaxBenefit)
  - Tunjangan Lainnya (OtherBenefit)
  - Honorarium
  - Asuransi (InsurancePaidByEmployer)
  - Natura
  - Tantiem/Bonus/THR (TantiemBonusThr)
  - Iuran Pensiun/JHT (PensionContributionJhtThtFee)
  - Zakat
- Field **GrossUpOpt** — Yes/No (apakah PPh di-gross up)
- Field **PrevWhTaxSlip** — nomor BP sebelumnya (untuk koreksi)
- Field **Article21IncomeTax** — PPh 21 yang dipotong

**Perbedaan vs BPMP:**
| Aspek | BPMP (Bulanan) | BPA1 (Tahunan) |
|-------|----------------|----------------|
| Frekuensi | Tiap bulan | 1x setahun |
| Komponen Gaji | 1 (Bruto) | 8+ komponen |
| Status Bukti Potong | ❌ | FullYear/PartialYear/Annualized |
| Zakat | ❌ | ✅ |
| Gross Up | ❌ | ✅ |
| PPh 21 | ❌ (auto dari tarif) | ✅ (Article21IncomeTax) |
| BP Sebelumnya | ❌ | ✅ (PrevWhTaxSlip) |

---

### 1.5 BPPU — Bukti Pemotongan PPh Unifikasi

**Menu Coretax:** eBupot → BPPU (Bukti Potong PPh Unifikasi)  
**Use Case:** Potong PPh 22, 23, 26, 4(2), 15 — transaksi B2B umum  
**XML Root:** TBD (converter Excel: BPPU Excel to XML v2)  

**Flow User:**
```
1. Download "BPPU Excel to XML.xlsx" dari pajak.go.id
2. Buka Excel → Aktifkan Developer Tab
3. Sheet "BPPU": Panduan pengisian per kolom
4. Sheet "DATA": Isi data transaksi
   - NPWP Pemotong (16 digit)
   - Masa Pajak & Tahun Pajak
   - NPWP/NIK Penerima Penghasilan (16 digit)
   - ID TKU Penerima Penghasilan (22 digit)
   - Fasilitas (N/A jika tidak ada)
   - Kode Objek Pajak (banyak jenis!)
   - Dasar Pengenaan Pajak (DPP)
   - PPh yang dipotong
   - Referensi Dokumen (faktur, kontrak, dll)
5. Sheet "REF": Referensi KOP per jenis PPh (22, 23, 26, 4(2), 15)
6. Developer → Export → XML
7. Coretax → eBupot → BPPU → Create eBupot BPU → Import Data → Upload XML
8. System validate → Jika valid → Submit → Save Draft / Submit langsung
9. Pilih bukti potong → Terbitkan → Confirm Sign → Selesai
```

**Karakteristik Unik:**
- **Multi-PPh** — cover PPh 22, 23, 26, 4(2), dan 15 dalam satu template!
- KOP sangat banyak — ratusan kode berdasarkan jenis PPh
- **Tax Object Name** — nama objek pajak (free text)
- **Revenue Code** — kode pendapatan (otomatis dari sistem)
- **Income Tax Status** — status pemotongan
- Field referensi dokumen wajib — jenis + nomor dokumen
- Setelah submit → masuk ke **"Belum Terbit"** → perlu **Terbitkan + Confirm Sign**
- BPPU adalah **fondasi SPT Unifikasi** — data BPPU otomatis tarik ke SPT Masa

**Perbedaan vs BP21/BPMP:**
| Aspek | BPMP/BP21 | BPPU |
|-------|-----------|------|
| Scope | PPh 21/26 saja | PPh 22, 23, 26, 4(2), 15 |
| Target | Individual (karyawan/WNA) | B2B (badan/usaha) |
| Menu Coretax | eBupot → BPMP/BP21 | eBupot → BPPU |
| Hubungan SPT | Independen | **Langsung terhubung ke SPT Unifikasi** |
| Signing | Submit → Sign | Submit → Terbitkan → Confirm Sign |
| KOP | Terbatas | Ratusan kode |

---

### 1.6 BPNR — Bukti Potong Non-Residen

**Menu Coretax:** eBupot → BPNR  
**Use Case:** Potong PPh 4(2) dan PPh 26 untuk WP Luar Negeri (selain BUT) — khusus untuk transaksi BUKAN terkait pekerjaan/jasa  
**Flow:** Mirip BP26 tapi scope berbeda  

### 1.7 BPSP — Bukti Potong Self Payment (Penyetoran Sendiri)

**Menu Coretax:** eBupot → Penyetoran Sendiri  
**Use Case:** PPh Final yang disetor sendiri (jasa konstruksi, sewa tanah/bangunan)  

---

## 2. Kategori Faktur Pajak (eFaktur)

### 2.1 Faktur Pajak Keluaran

**Menu Coretax:** eFaktur → Pajak Keluaran → Create Output Invoice / Import Data  
**Use Case:** PKP menerbitkan faktur pajak atas penjualan BKP/JKP  

**Flow User (via XML):**
```
1. Download template "Faktur Pajak Keluaran" dari pajak.go.id (format ZIP, extract dulu)
2. Buka template Excel — ada BEBERAPA sheet:
   - Sheet "Faktur Pajak": Data utama (NPWP Penjual, Tanggal, Kode Transaksi, Lawan Transaksi)
   - Sheet "Detail Faktur": Line item barang/jasa (kode, nama, harga satuan, jumlah, diskon, DPP, PPN, PPnBM)
   - Sheet "Referensi": Panduan pengisian
   - Sheet "Keterangan": Kode barang/jasa (1300+ kode barang, 600+ kode jasa)
3. Isi data di semua sheet yang diperlukan
4. Developer → Export → XML
5. Coretax → eFaktur → Pajak Keluaran → Import Data → Upload XML
6. System generate NSFP (17 digit) otomatis!
7. Review → Confirm Sign → Selesai
```

**Karakteristik Unik (SANGAT BERBEDA dari Bupot):**
- **Multi-sheet** — bukan cuma DATA + REF, tapi ada sheet terpisah untuk header & line items
- **Struktur header + detail** — 1 faktur punya 1 header + banyak line items
- **NSFP otomatis** — Nomor Seri Faktur Pajak 17 digit, auto-generate saat submit
- **Kode Transaksi PPN** — 2 digit (01=normal, 02=pemerintah, 03=PKP lain, dll)
- **Kode Barang/Jasa** — 1300+ kode barang, 600+ kode jasa dari DJP
- **Line item details** — nama, harga satuan, jumlah, satuan, diskon per item
- **PPN + PPnBM** — ada PPN dan PPnBM per item
- **Max 1000 faktur per XML file** (jauh lebih banyak dari bupot)

**Perbedaan Besar vs Bupot:**
| Aspek | Bupot (BPMP/BP21) | Faktur Keluaran |
|-------|-------------------|-----------------|
| Struktur | Flat (1 row = 1 record) | Header-Detail (1 header + N items) |
| Sheet Excel | 2-3 sheet | 4+ sheet |
| Kode Barang | ❌ | ✅ 1300+ kode |
| Line Items | ❌ | ✅ Multiple per faktur |
| NSFP | ❌ | ✅ Auto-generate 17 digit |
| PPN/PPnBM | ❌ | ✅ Per item |
| Kode Transaksi | KOP (PPh) | Kode Transaksi PPN |
| Max Records | 100 | 1000 |

---

### 2.2 Dok Lain Keluaran (Special Documents)

**Menu Coretax:** eFaktur → Dok Lain Keluaran  
**Use Case:** Dokumen setara faktur pajak (penyerahan tanpa NPWP pembeli, export, import)  

**Flow User:**
```
1. Download "DokLainKeluaran.xlsx" dari pajak.go.id
2. Sheet "Validation on xml": Berisi contoh XML yang benar (bukan sheet DATA!)
3. Sheet "DATA": Isi NPWP + data transaksi
   - TransactionType: 01=DELIVERY, 02=EXPORT, 03=IMPORT, 04=PURCHASE, 05=UNCREDIT
   - TransactionDetail: Detail jenis transaksi (15 kode)
   - TransactionDocument: Jenis dokumen (10 kode)
   - AdditionalInformation: Info tambahan untuk kode 07/08
   - DocumentNumber + DocumentDate
   - BuyerTIN, BuyerName, BuyerAddress
   - TaxBase, VAT, STLG
4. Sheet "AddInfo": Kode tambahan untuk PPN Tidak Dipungut / Dibebaskan (27+ kode)
5. Sheet "Trx Detail", "Trx Doc", "Trx Type": Referensi kode
6. Developer → Export → XML
7. Coretax → eFaktur → Dok Lain Keluaran → Import → Upload
```

**Karakteristik Unik:**
- **TransactionType + TransactionDetail + TransactionDocument** — 3 level kode yang saling terkait
- **AdditionalInformation** — kode khusus untuk PPN tidak dipungut/dibebaskan (27+ kode)
- BuyerTIN bisa `0000000000000000` untuk export
- **XML Root berbeda** — `<SpecialDocBulk>` bukan Faktur biasa

---

### 2.3 Dok Lain Masukan (Input Special Documents)

**Menu Coretax:** eFaktur → Dok Lain Masukan  
**Use Case:** Mencatat dokumen setara faktur pajak yang DITERIMA dari pihak lain  

**Flow:** Mirip Dok Lain Keluaran tapi:
- XML Root: `<InputSpecialDocBulk>`
- Field SellerTin/SellerName (bukan BuyerTIN)
- Field SpecialDocNo/SpecialDocDate (bukan DocumentNumber)
- Field TrxType/TrxCode/TrxDocument

---

## 3. Kategori SPT

### 3.1 SPT Masa PPh Unifikasi

**Menu Coretax:** SPT → SPT Masa → PPh Unifikasi  
**Use Case:** Lapor SPT Masa yang menggabungkan semua PPh (22, 23, 26, 4(2), 15)  

**Flow:**
```
1. Pastikan semua BPPU sudah dibuat dan diterbitkan
2. Data BPPU OTOMATIS terpull ke SPT Unifikasi
3. Review data → Cek total pemotongan per jenis PPh
4. Submit SPT → Generate kode billing
5. Bayar via eBilling → Selesai
```

**PENTING:** SPT Unifikasi **TIDAK PERLU XML upload** — datanya otomatis dari BPPU!

### 3.2 SPT Masa PPN

**Menu Coretax:** SPT → SPT Masa → PPN  
**Use Case:** Lapor SPT Masa PPN  
**XML:** Template khusus untuk lampiran SPT PPN  

### 3.3 SPT Tahunan Badan

**Menu Coretax:** SPT → SPT Tahunan → Badan  
**Use Case:** Lapor SPT Tahunan PPh Badan  
**XML:** Multiple templates untuk lampiran (penyusutan, amortisasi, dll)  

---

## 4. Summary Matrix: Perbedaan Template

| Template | Menu Coretax | Sheet Excel | Root XML | Record Type | Max/Upload | Auto-fill Fields |
|----------|-------------|-------------|----------|-------------|------------|------------------|
| **BPMP** | eBupot → BPMP | 3 (BPMP, DATA, REF) | MmPayrollBulk | Flat | 100 | Tarif dari KOP |
| **BP21** | eBupot → BP21 | 3 (BP21, DATA, REF) | Bp21Bulk | Flat | 100 | Deemed+Tarif dari KOP |
| **BP26** | eBupot → BP26 | 3 (BP26, DATA, REF) | WmWithholdingTax | Flat | TBD | — |
| **BPA1** | eBupot → BPA1 | 3 (BPA1, DATA, REF) | A1Bulk | Flat | TBD | — |
| **BPPU** | eBupot → BPPU | 3+ | TBD | Flat | TBD | TaxArticle, RevenueCode |
| **Dok Keluaran** | eFaktur → Dok Keluaran | 5+ | SpecialDocBulk | Flat | TBD | — |
| **Dok Masukan** | eFaktur → Dok Masukan | 4+ | InputSpecialDocBulk | Flat | TBD | — |
| **Faktur Keluaran** | eFaktur → Pajak Keluaran | 4+ | TBD | **Header-Detail** | **1000** | NSFP auto-generate |
| **SPT Unifikasi** | SPT → Masa PPh | N/A | N/A | **Auto dari BPPU** | N/A | Semua dari BPPU |

---

## 5. Implications untuk UI/UX Design

### 5.1 Tiga Pattern Utama yang Harus Diakomodasi

**Pattern A: Flat Single-Table (Bupot types)**
```
Header fields (root level): NPWP Pemotong, Masa Pajak, Tahun Pajak
↓
Tabel flat: 1 row = 1 bukti potong
↓
Generate 1 XML file
```
- Cocok untuk: BPMP, BP21, BP26, BPA1, BPPU, Dok Lain

**Pattern B: Header-Detail (Faktur types)**
```
Header fields: NPWP Penjual, Tanggal, Kode Transaksi, Lawan Transaksi
↓
Detail items: Multiple rows per faktur (kode barang, nama, harga, qty, diskon, PPN)
↓
Generate 1 XML per faktur (atau batch dalam 1 XML)
```
- Cocok untuk: Faktur Keluaran, Faktur Masukan, Retur

**Pattern C: Auto-Pull (SPT types)**
```
Tidak perlu input manual
↓
Data otomatis dari bukti potong yang sudah diterbitkan
↓
Review & Submit saja
```
- Cocok untuk: SPT Unifikasi

### 5.2 UI Must Adapt Per Template

| Pattern | UI Approach |
|---------|------------|
| **Flat** | Spreadsheet-style grid, 1 row = 1 record, all fields in columns |
| **Header-Detail** | Form header + sub-table for items. Tab atau accordion untuk detail |
| **Auto-Pull** | Read-only summary table, review & confirm. No input needed |

### 5.3 Converter Page Should Be Template-Aware

Saat user pilih template, UI harus otomatis:
1. **Load correct field definitions** (kolom berbeda per template)
2. **Show correct reference data** (KOP, PTKP, TrxType, dll — beda per template)
3. **Apply correct validation rules** (NPWP format, date format, dll)
4. **Use correct XML root/child structure** (setiap template beda)
5. **Show correct smart defaults** (KOP default, auto-fill fields)
6. **Handle correct max records** (100 vs 1000)

---

## 6. Research Sources

| Source | URL | Key Finding |
|--------|-----|-------------|
| DiskusiPajak - Upload XML Bupot | diskusipajak.com | Flow eBupot: Import → Validate → Submit → Sign |
| DoyanDuit - Impor XML 2026 | doyanduit.com | 70% error, template multi-sheet, PER-11/PJ/2025 |
| AyoPajak - eBupot Unifikasi | ayopajak.com | BPPU cover PPh 22, 23, 26, 4(2), 15 |
| vOffice - SPT Unifikasi | voffice.co.id | BPPU → SPT Unifikasi auto-pull |
| KlikPajak - Bupot Unifikasi | klikpajak.id | 6 jenis PPh dalam satu formulir |
| Pajak Klaten - Import BPMP | sites.google.com/view/pajakklaten | Step-by-step BPMP: Developer Tab + Export |
| SMR Konsultan - eBupot Menu | smrkonsultan.com | 10 menu eBupot: BPPU, BPNR, BPMP, BP21, BP26, BPA1, dll |
| KPP Pratama Subang - YouTube | youtube.com/watch?v=ky6m4fmX3g0 | Tutorial video BPPU: 3 sheet, Developer Tab, export |
| DiskusiPajak - Faktur Pajak | diskusipajak.com | 2 metode: key-in manual vs import XML |
| DoyanDuit - Faktur Keluaran XML | doyanduit.com | Template multi-sheet, NSFP 17 digit auto |
| PakarPajak - Faktur Keluaran | pakarpajak.com | Header-detail structure, 1300+ kode barang |
| OnlinePajak - XML eFaktur | support.online-pajak.com | Multi-sheet template: Faktur + Detail + Referensi |

---

*Deep research by Catheez PA — 1 April 2026*
