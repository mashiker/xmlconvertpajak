# PRD: All-in-One XML Converter for Coretax DJP

**Produk:** Website konversi data (CSV/Excel/Manual) ke format XML untuk upload ke Coretax DJP  
**Domain:** coretax.alatpajak.id/tools/xml-converters/  
**Versi PRD:** 1.0  
**Tanggal:** 1 April 2026  
**Author:** Jevi / alatpajak.id  

---

## 1. Executive Summary

### 1.1 Visi Produk
Website all-in-one yang memungkinkan wajib pajak, konsultan pajak, dan admin HR/finance untuk mengonversi data pajak mereka ke format XML yang valid untuk diupload ke sistem Coretax DJP. Semua proses berjalan 100% di browser (client-side) — **tidak ada data yang dikirim ke server manapun**.

### 1.2 Masalah yang Dipecahkan
- DJP menyediakan 34+ template XML, masing-masing dengan struktur berbeda
- Excel converter dari DJP rentan error, tidak user-friendly, dan terbatas pada satu template per file
- Tidak ada tool terpusat yang cover semua template
- Proses manual (isi satu-satu di Coretax) sangat memakan waktu untuk data bulk

### 1.3 Target Users
| Persona | Deskripsi | Kebutuhan Utama |
|---------|-----------|-----------------|
| Konsultan Pajak | Menangani banyak klien, bulk upload | Batch convert, banyak template, cepat |
| HR/Payroll Admin | Lapor PPh 21/26 bulanan | Template BPMP/BP21/A1, import CSV dari payroll |
| Finance/Tax Admin Badan | Lapor PPN, SPT | Faktur, Dok Lain, SPT masa |
| WP Individual | Lapor SPT pribadi | Simple input, panduan jelas |

### 1.4 Tujuan
- Menyediakan **34+ template** XML converter dalam satu website
- Import CSV/Excel → auto-map → validate → preview → download XML
- Manual input form dengan validasi real-time
- 100% client-side processing (privacy first)
- Simple, clean, mobile-friendly UI

---

## 2. Fitur Utama

### 2.1 Import & Convert
- Upload file CSV atau Excel (.xlsx, .xls)
- Auto-detect kolom dan mapping ke field XML
- Kolom mapping yang bisa diedit jika auto-detect salah
- Support multiple records (batch) dalam satu file

### 2.2 Manual Input Form
- Form berbasis tabel (editable spreadsheet-like)
- Dropdown untuk field yang punya reference data (KOP, PTKP, Fasilitas, dll)
- Validasi real-time per field
- Auto-fill untuk field yang berulang (misal NPWP Pemotong, Masa Pajak)

### 2.3 Preview & Download
- Preview XML dengan syntax highlighting sebelum download
- Validasi XML terhadap schema
- Download single XML file
- Download batch (multiple records) sebagai ZIP
- Copy XML ke clipboard

### 2.4 Template Library
- Daftar semua 34+ template yang tersedia
- Pencarian dan filter berdasarkan kategori
- Panduan pengisian per template
- Sample data per template

### 2.5 Privacy & Security
- **100% client-side** — semua proses di browser
- Tidak ada data yang dikirim ke server
- File yang diupload hanya diproses di memori browser
- Preferences disimpan di localStorage/IndexedDB (opsional)

---

## 3. Tech Stack

| Komponen | Teknologi | Alasan |
|----------|-----------|--------|
| Framework | Next.js 14 (App Router) | SSR + static generation, SEO friendly |
| Language | TypeScript | Type safety, developer experience |
| UI Library | React 18 | Komponen reusabel, ecosystem besar |
| Styling | TailwindCSS + shadcn/ui | Rapid UI development, consistent design |
| Excel Parser | SheetJS (xlsx) | Client-side Excel/CSV parsing |
| XML Builder | fast-xml-builder atau custom | XML generation dari data |
| Syntax Highlight | Prism.js / react-syntax-highlighter | Preview XML |
| ZIP | JSZip | Batch download sebagai ZIP |
| Storage | IndexedDB (Dexie.js) | Simpan preferences, recent files |
| Validation | Zod | Schema validation per template |
| Deployment | Vercel | Free tier, custom domain, CDN |
| Analytics | Plausible / Umami | Privacy-friendly, no cookies |

### 3.1 Arsitektur
```
Browser (Client-Side Only)
├── /                         → Landing page
├── /templates                → Template library
├── /convert/[templateId]     → Converter page per template
│   ├── Import tab            → Upload CSV/Excel
│   ├── Manual tab            → Form input
│   └── Preview tab           → XML preview + download
├── /help                     → Panduan penggunaan
└── /about                    → Tentang aplikasi

Data Flow:
CSV/Excel → SheetJS parser → JSON data → Zod validation → XML builder → Preview → Download

No backend required. All static + client-side processing.
```

---

## 4. Template Catalog — Detail Lengkap

> **INI BAGIAN PALING PENTING.** Setiap template harus punya field mapping lengkap agar developer bisa implementasi akurat.

### Kategori Template

| # | Kategori | Template | XML Root Element |
|---|----------|----------|------------------|
| 1 | Bupot PPh 21/26 | BPMP | `MmPayrollBulk` |
| 2 | Bupot PPh 21/26 | BP21 | `Bp21Bulk` |
| 3 | Bupot PPh 21/26 | BP26 | `WmWithholdingTax` |
| 4 | Bupot PPh 21/26 | BPA1 | `A1Bulk` |
| 5 | Bupot PPh 21/26 | BPA2 | TBD |
| 6 | Bupot PPh 21/26 | BPPU | TBD |
| 7 | Bupot PPh 21/26 | BPNR | TBD |
| 8 | Bupot PPh 21/26 | BPSP | TBD |
| 9 | Bupot PPh 21/26 | BPCY | TBD |
| 10 | Bupot PPh 21/26 | DDBU | TBD |
| 11 | Faktur Pajak | Dok Lain Keluaran | `SpecialDocBulk` |
| 12 | Faktur Pajak | Dok Lain Masukan | `InputSpecialDocBulk` |
| 13 | Faktur Pajak | Faktur Keluaran | TBD |
| 14 | Faktur Pajak | Faktur Masukan | TBD |
| 15 | Faktur Pajak | Retur Faktur Keluaran | TBD |
| 16 | Faktur Pajak | Retur Faktur Masukan | TBD |
| 17 | Faktur Pajak | Retail Sales | TBD |
| 18 | SPT Badan | SPT CIT + Lampiran | TBD |
| 19 | SPT OP | SPT PIT + Lampiran | TBD |
| 20 | SPT Masa PPN | Lampiran C, dll | TBD |
| 21+ | Lainnya | Bea Meterai, LK, dll | TBD |

> **TBD** = Template belum ada Excel converter dari DJP. Perlu di-scrape dari halaman DJP saat development Phase 2-3.

---

### 4.1 BPMP — Bukti Pemotongan Bulanan Pegawai Tetap

**Kode:** `bpmp`  
**XML Root:** `<MmPayrollBulk>`  
**Child Element:** `<MmPayroll>`  
**Max Records:** 100 per upload  
**Kategori:** Bupot PPh 21/26  

#### XML Structure
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<MmPayrollBulk xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <TIN>{NPWP_Pemotong}</TIN>
  <ListOfMmPayroll>
    <MmPayroll>
      <TaxPeriodMonth>{1-12}</TaxPeriodMonth>
      <TaxPeriodYear>{YYYY}</TaxPeriodYear>
      <CounterpartOpt>Resident|Foreign</CounterpartOpt>
      <CounterpartPassport xsi:nil="true"/>
      <CounterpartTin>{NPWP/NIK_16digit}</CounterpartTin>
      <StatusTaxExemption>TK/0|TK/1|K/0|...</StatusTaxExemption>
      <Position>{Posisi}</Position>
      <TaxCertificate>N/A|DTP|ETC</TaxCertificate>
      <TaxObjectCode>21-100-01</TaxObjectCode>
      <Gross>{Penghasilan_Bruto}</Gross>
      <Rate>{Tarif}</Rate>
      <IDPlaceOfBusinessActivity>{NITKU_21digit}</IDPlaceOfBusinessActivity>
      <WithholdingDate>{YYYY-MM-DD}</WithholdingDate>
    </MmPayroll>
  </ListOfMmPayroll>
</MmPayrollBulk>
```

#### Field Mapping

| # | Label (Excel) | XML Tag | Type | Required | Validation | Contoh |
|---|--------------|---------|------|----------|------------|--------|
| 1 | NPWP Pemotong | `TIN` | string | ✅ | 16 digit, harus sama dengan NPWP login Coretax | `0029482015507000` |
| 2 | Masa Pajak | `TaxPeriodMonth` | number | ✅ | 1-12 | `10` |
| 3 | Tahun Pajak | `TaxPeriodYear` | number | ✅ | 4 digit (2024+) | `2024` |
| 4 | Status Pegawai | `CounterpartOpt` | enum | ✅ | `Resident` \| `Foreign` | `Resident` |
| 5 | NPWP/NIK/TIN | `CounterpartTin` | string | ✅ | 16 digit (NIK/NPWP), wajib valid | `3275010905770021` |
| 6 | Nomor Passport | `CounterpartPassport` | string | ❌ | Kosong = `xsi:nil="true"` | _(kosong)_ |
| 7 | Status PTKP | `StatusTaxExemption` | enum | ✅ | Lihat tabel PTKP | `TK/0` |
| 8 | Posisi | `Position` | string | ✅ | Free text | `Staff` |
| 9 | Sertifikat/Fasilitas | `TaxCertificate` | enum | ✅ | `N/A` \| `DTP` \| `ETC` | `N/A` |
| 10 | Kode Objek Pajak | `TaxObjectCode` | string | ✅ | Format `XX-XXX-XX`, lihat tabel KOP | `21-100-01` |
| 11 | Penghasilan Kotor | `Gross` | number | ✅ | ≥ 0, angka bulat | `40000000` |
| 12 | Tarif | `Rate` | number | ✅ | 0-100, desimal pakai titik | `16` |
| 13 | ID TKU | `IDPlaceOfBusinessActivity` | string | ✅ | 21 digit (NITKU) | `0029482015507000000000` |
| 14 | Tgl Pemotongan | `WithholdingDate` | date | ✅ | YYYY-MM-DD, ≥ masa pajak | `2024-10-21` |

#### Catatan Khusus
- Field `TIN` (NPWP Pemotong) muncul sekali di root level, BUKAN per record
- `CounterpartPassport` jika kosong harus ditulis `<CounterpartPassport xsi:nil="true"/>`
- Tarif desimal: di Excel pakai koma, di XML pakai titik (converter harus handle ini)
- `WithholdingDate` tidak boleh lebih rendah dari masa/tahun pajak

---

### 4.2 BP21 — Bukti Pemotongan Final & Tidak Final

**Kode:** `bp21`  
**XML Root:** `<Bp21Bulk>`  
**Child Element:** `<Bp21>`  
**Max Records:** 100 per upload  
**Kategori:** Bupot PPh 21/26  

#### XML Structure
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Bp21Bulk xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <TIN>{NPWP_Pemotong}</TIN>
  <ListOfBp21>
    <Bp21>
      <TaxPeriodMonth>{1-12}</TaxPeriodMonth>
      <TaxPeriodYear>{YYYY}</TaxPeriodYear>
      <CounterpartTin>{NPWP/NIK_16digit}</CounterpartTin>
      <IDPlaceOfBusinessActivityOfIncomeRecipient>{NITKU_21digit}</IDPlaceOfBusinessActivityOfIncomeRecipient>
      <StatusTaxExemption>TK/0|K/1|...</StatusTaxExemption>
      <TaxCertificate>N/A|TaxExAr21|DTP|ETC</TaxCertificate>
      <TaxObjectCode>21-100-35</TaxObjectCode>
      <Gross>{Penghasilan_Bruto}</Gross>
      <Deemed>{Norma_Penghasilan_%}</Deemed>
      <Rate>{Tarif_%}</Rate>
      <Document>TaxInvoice|CommercialInvoice|...</Document>
      <DocumentNumber>{Nomor_Dokumen}</DocumentNumber>
      <DocumentDate>{YYYY-MM-DD}</DocumentDate>
      <IDPlaceOfBusinessActivity>{NITKU_21digit}</IDPlaceOfBusinessActivity>
      <WithholdingDate>{YYYY-MM-DD}</WithholdingDate>
    </Bp21>
  </ListOfBp21>
</Bp21Bulk>
```

#### Field Mapping

| # | Label (Excel) | XML Tag | Type | Required | Validation | Contoh |
|---|--------------|---------|------|----------|------------|--------|
| 1 | NPWP Pemotong | `TIN` | string | ✅ | 16 digit, = NPWP login | `0029482015507000` |
| 2 | Masa Pajak | `TaxPeriodMonth` | number | ✅ | 1-12 | `1` |
| 3 | Tahun Pajak | `TaxPeriodYear` | number | ✅ | 4 digit | `2024` |
| 4 | NPWP | `CounterpartTin` | string | ✅ | 16 digit, wajib valid | `1403011006750026` |
| 5 | ID TKU Penerima | `IDPlaceOfBusinessActivityOfIncomeRecipient` | string | ✅ | 21 digit | `1403011006750026000000` |
| 6 | Status PTKP | `StatusTaxExemption` | enum | ✅ | Lihat tabel PTKP | `K/3` |
| 7 | Fasilitas | `TaxCertificate` | enum | ✅ | `N/A` \| `TaxExAr21` \| `DTP` \| `ETC` | `N/A` |
| 8 | Kode Objek Pajak | `TaxObjectCode` | string | ✅ | Format `XX-XXX-XX` | `21-100-35` |
| 9 | Penghasilan | `Gross` | number | ✅ | ≥ 0 | `40000000` |
| 10 | Deemed | `Deemed` | number | ✅ | 0-100 (%) | `100` |
| 11 | Tarif | `Rate` | number | ✅ | 0-100 | `16` |
| 12 | Jenis Dok. Referensi | `Document` | enum | ✅ | Lihat tabel Document Types | `CommercialInvoice` |
| 13 | Nomor Dok. Referensi | `DocumentNumber` | string | ✅ | Jika TaxInvoice → format Faktur Pajak | `ABC123` |
| 14 | Tanggal Dok. Referensi | `DocumentDate` | date | ✅ | YYYY-MM-DD | `2024-01-13` |
| 15 | ID TKU | `IDPlaceOfBusinessActivity` | string | ✅ | 21 digit (NITKU) | `0029482015507000000000` |
| 16 | Tgl Pemotongan | `WithholdingDate` | date | ✅ | YYYY-MM-DD, ≥ masa pajak | `2024-01-21` |

#### KOP Codes untuk BP21

| Kode | Nama Objek Pajak | Deemed (%) | Tarif |
|------|------------------|-----------|-------|
| 21-100-35 | Upah Pegawai Tidak Tetap yang Dibayarkan Secara Bulanan | 100 | TER |
| 21-100-10 | Honorarium atau Imbalan kepada Anggota Dewan Komisaris/Direksi | 100 | TER |
| 21-100-27 | Upah Pegawai Tidak Tetap yang Dibayarkan Tidak Secara Bulanan | 100 | TER |
| 21-100-07 | Imbalan kepada Tenaga Ahli (Pengacara, Akuntan, dll) | 50 | PS17 |
| 21-100-18 | Imbalan kepada Penasihat, Pengajar, Pelatih | 50 | PS17 |
| 21-100-19 | Imbalan kepada Pengarang, Peneliti, Penerjemah | 50 | PS17 |
| 21-100-20 | Imbalan kepada Pemberi Jasa dalam Segala Bidang | 50 | PS17 |
| 21-100-21 | Imbalan kepada Agen Iklan | 50 | PS17 |
| 21-100-22 | Imbalan kepada Pengawas atau Pengelola Proyek | 50 | PS17 |
| 21-100-23 | Imbalan kepada Pembawa Pesanan | 50 | PS17 |
| 21-100-06 | Imbalan kepada Petugas Penjaja Barang Dagangan | 50 | PS17 |
| 21-100-05 | Imbalan kepada Agen Asuransi | 50 | PS17 |
| 21-100-04 | Imbalan kepada Distributor Perusahaan Pertamina | 50 | PS17 |
| 21-100-30 | Upah Pegawai Tidak Tetap yang Dibayarkan Secara Tidak Teratur | 50 | PS17 |
| 21-100-34 | Penghasilan yang diterima oleh Pegawai Tetap (SPT Tahunan A1) | 100 | TER |
| 21-402-03 | Penghasilan dari pekerjaan/jasa yang dipotong PPh 21 bersifat final | 100 | 15 |

---

### 4.3 BP26 — Bukti Pemotongan PPh 26 (Wajib Pajak Luar Negeri)

**Kode:** `bp26`  
**XML Root:** `<WmWithholdingTax>`  
**Child Element:** `<WmWithholdingTaxRecord>` (presumed)  
**Max Records:** TBD  
**Kategori:** Bupot PPh 21/26  

#### Field Mapping

| # | Label (Excel) | XML Tag | Type | Required | Validation | Contoh |
|---|--------------|---------|------|----------|------------|--------|
| 1 | NPWP Pemotong | `TIN` | string | ✅ | 16 digit, = NPWP login | `0029482015507000` |
| 2 | Masa Pajak | `TaxPeriodMonth` | number | ✅ | 1-12 | `10` |
| 3 | Tahun Pajak | `TaxPeriodYear` | number | ✅ | 4 digit | `2024` |
| 4 | NPWP/TIN | `CounterpartTin` | string | ✅ | Format TIN luar negeri atau NPWP | `NPWP-USA-ABC` |
| 5 | Nama Penerima | `CounterpartName` | string | ✅ | Free text | `JASON LEE SCOOT` |
| 6 | Kode Negara | `CounterpartCountry` | enum | ✅ | ISO 3166-1 alpha-3 | `USA` |
| 7 | Alamat | `CounterpartAddress` | string | ✅ | Free text | `CALIFORNIA` |
| 8 | Tanggal Lahir | `CounterpartDob` | date | ❌ | YYYY-MM-DD | `1980-01-13` |
| 9 | Tempat Lahir | `CounterpartBirthCity` | string | ❌ | Free text | `LAS VEGAS` |
| 10 | No. Paspor | `CounterpartPassport` | string | ❌ | Free text | `PASPOR-ESP-001` |
| 11 | No. Kitas | `CounterpartKitas` | string | ❌ | Free text | `1234563242` |
| 12 | Fasilitas | `TaxCertificate` | enum | ✅ | `N/A` \| `SKD` \| `DTP` \| `ETC` | `N/A` |
| 13 | Nomor Fasilitas | `CounterpartReceiptNumber` | string | ❌ | Jika pakai SKD, wajib diisi | `SKD-WPLN/002/233-001` |
| 14 | Kode Objek Pajak | `TaxObjectCode` | string | ✅ | Format `XX-XXX-XX` | `27-100-99` |
| 15 | Penghasilan | `Gross` | number | ✅ | ≥ 0 | `100000000` |
| 16 | Deemed | `Deemed` | number | ✅ | 0-100 (%) | `100` |
| 17 | Tarif | `Rate` | number | ✅ | 0-100 | `20` |
| 18 | Jenis Dok. Referensi | `Document` | enum | ✅ | Lihat tabel Document Types | `CommercialInvoice` |
| 19 | Nomor Dok. Referensi | `DocumentNumber` | string | ✅ | Free text | `ABC123` |
| 20 | Tanggal Dok. Referensi | `DocumentDate` | date | ✅ | YYYY-MM-DD | `2024-01-13` |
| 21 | ID TKU | `IDPlaceOfBusinessActivity` | string | ✅ | 21 digit (NITKU) | `0029482015507000000000` |
| 22 | Tgl Pemotongan | `WithholdingDate` | date | ✅ | YYYY-MM-DD | `2024-10-21` |

#### KOP untuk PPh 26
| Kode | Nama | Deemed (%) | Tarif (%) |
|------|------|-----------|-----------|
| 27-100-99 | Imbalan sehubungan dengan jasa, pekerjaan dan kegiatan, hadiah dan penghargaan, pensiun dan pembayaran berkala lainnya yang dipotong PPh Pasal 26 | 100 | 20 |

---

### 4.4 BPA1 — Bukti Pemotongan A1 (Tahunan/Annual)

**Kode:** `bpa1`  
**XML Root:** `<A1Bulk>`  
**Child Element:** `<A1>`  
**Max Records:** TBD  
**Kategori:** Bupot PPh 21/26  

#### XML Structure
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<A1Bulk xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <TIN>{NPWP_Pemotong}</TIN>
  <ListOfA1>
    <A1>
      <WorkForSecondEmployer>No</WorkForSecondEmployer>
      <TaxPeriodMonthStart>{1-12}</TaxPeriodMonthStart>
      <TaxPeriodMonthEnd>{1-12}</TaxPeriodMonthEnd>
      <TaxPeriodYear>{YYYY}</TaxPeriodYear>
      <CounterpartOpt>Resident|Foreign</CounterpartOpt>
      <CounterpartPassport xsi:nil="true"/>
      <CounterpartTin>{NPWP/NIK}</CounterpartTin>
      <TaxExemptOpt>TK/0|K/1|...</TaxExemptOpt>
      <StatusOfWithholding>FullYear|PartialYear|Annualized</StatusOfWithholding>
      <CounterpartPosition>{Posisi}</CounterpartPosition>
      <TaxObjectCode>21-100-01</TaxObjectCode>
      <NumberOfMonths>{0-12}</NumberOfMonths>
      <SalaryPensionJhtTht>{Gaji}</SalaryPensionJhtTht>
      <GrossUpOpt>Yes|No</GrossUpOpt>
      <IncomeTaxBenefit>{Tunjangan_PPh}</IncomeTaxBenefit>
      <OtherBenefit>{Tunjangan_Lainnya}</OtherBenefit>
      <Honorarium>{Honorarium}</Honorarium>
      <InsurancePaidByEmployer>{Asuransi}</InsurancePaidByEmployer>
      <Natura>{Natura}</Natura>
      <TantiemBonusThr>{Tantiem_Bonus_THR}</TantiemBonusThr>
      <PensionContributionJhtThtFee>{Iuran_Pensiun}</PensionContributionJhtThtFee>
      <Zakat>{Zakat}</Zakat>
      <PrevWhTaxSlip xsi:nil="true"/>
      <TaxCertificate>N/A|DTP|ETC</TaxCertificate>
      <Article21IncomeTax>{PPh_21}</Article21IncomeTax>
      <IDPlaceOfBusinessActivity>{NITKU}</IDPlaceOfBusinessActivity>
      <WithholdingDate>{YYYY-MM-DD}</WithholdingDate>
    </A1>
  </ListOfA1>
</A1Bulk>
```

#### Field Mapping

| # | Label (Excel) | XML Tag | Type | Required | Validation | Contoh |
|---|--------------|---------|------|----------|------------|--------|
| 1 | NPWP Pemotong | `TIN` | string | ✅ | 16 digit, = NPWP login | `0029482015507000` |
| 2 | Pemberi Kerja Selanjutnya | `WorkForSecondEmployer` | enum | ✅ | `Yes` \| `No` | `No` |
| 3 | Masa Pajak Awal | `TaxPeriodMonthStart` | number | ✅ | 1-12 | `1` |
| 4 | Masa Pajak Akhir | `TaxPeriodMonthEnd` | number | ✅ | 1-12 | `4` |
| 5 | Tahun Pajak | `TaxPeriodYear` | number | ✅ | 4 digit | `2024` |
| 6 | WNI/WNA | `CounterpartOpt` | enum | ✅ | `Resident` \| `Foreign` | `Resident` |
| 7 | No. Paspor | `CounterpartPassport` | string | ❌ | Kosong = `xsi:nil` | _(kosong)_ |
| 8 | NPWP | `CounterpartTin` | string | ✅ | 16 digit, wajib valid | `3275101001720010` |
| 9 | Status PTKP | `TaxExemptOpt` | enum | ✅ | Lihat tabel PTKP | `K/3` |
| 10 | Posisi | `CounterpartPosition` | string | ✅ | Free text | `TESTER` |
| 11 | Kode Objek Pajak | `TaxObjectCode` | string | ✅ | `21-100-01` \| `21-100-02` | `21-100-01` |
| 12 | Status Bukti Potong | `StatusOfWithholding` | enum | ✅ | `FullYear` \| `PartialYear` \| `Annualized` | `PartialYear` |
| 13 | Jumlah Bulan Bekerja | `NumberOfMonths` | number | ✅ | 0-12. Jika FullYear = 0 | `0` |
| 14 | Gaji | `SalaryPensionJhtTht` | number | ✅ | ≥ 0 | `150000000` |
| 15 | Opsi Gross Up | `GrossUpOpt` | enum | ✅ | `Yes` \| `No` | `Yes` |
| 16 | Tunjangan PPh | `IncomeTaxBenefit` | number | ✅ | ≥ 0 | `0` |
| 17 | Tunjangan Lainnya/Lembur | `OtherBenefit` | number | ✅ | ≥ 0 | `15000000` |
| 18 | Honorarium | `Honorarium` | number | ✅ | ≥ 0 | `10000000` |
| 19 | Asuransi | `InsurancePaidByEmployer` | number | ✅ | ≥ 0 | `2500000` |
| 20 | Natura | `Natura` | number | ✅ | ≥ 0 | `8500000` |
| 21 | Tantiem, Bonus, THR | `TantiemBonusThr` | number | ✅ | ≥ 0 | `50000000` |
| 22 | Iuran Pensiun/THT/JHT | `PensionContributionJhtThtFee` | number | ✅ | ≥ 0 | `15000000` |
| 23 | Zakat | `Zakat` | number | ✅ | ≥ 0 | `10000000` |
| 24 | No. BP Sebelumnya | `PrevWhTaxSlip` | string | ❌ | Kosong = `xsi:nil` | _(kosong)_ |
| 25 | Fasilitas Pajak | `TaxCertificate` | enum | ✅ | `N/A` \| `DTP` \| `ETC` | `N/A` |
| 26 | PPh Pasal 21 | `Article21IncomeTax` | number | ✅ | ≥ 0 | `0` |
| 27 | ID TKU | `IDPlaceOfBusinessActivity` | string | ✅ | 21 digit | `0029482015507000000000` |
| 28 | Tgl Pemotongan | `WithholdingDate` | date | ✅ | YYYY-MM-DD | `2024-04-30` |

#### Catatan BPA1
- `StatusOfWithholding=FullYear` → `TaxPeriodMonthStart=1`, `TaxPeriodMonthEnd=12`, `NumberOfMonths=0`
- `StatusOfWithholding=PartialYear` → bulan awal/akhir sesuai kapan mulai/berhenti kerja
- `StatusOfWithholding=Annualized` → untuk penghitungan di akhir tahun

---

### 4.5 Dok Lain Keluaran

**Kode:** `doklain_keluaran`  
**XML Root:** `<SpecialDocBulk>`  
**Child Element:** `<SpecialDoc>`  
**Max Records:** TBD  
**Kategori:** Faktur Pajak  

#### XML Structure
```xml
<?xml version="1.0" encoding="utf-8"?>
<SpecialDocBulk xsi:noNamespaceSchemaLocation="schema.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <TIN>{NPWP}</TIN>
  <ListOfSpecialDoc>
    <SpecialDoc>
      <TransactionType>01</TransactionType>
      <TransactionDetail>01</TransactionDetail>
      <TransactionDocument>1</TransactionDocument>
      <AdditionalInformation></AdditionalInformation>
      <DocumentNumber>DELI-0002</DocumentNumber>
      <DocumentDate>2024-08-01</DocumentDate>
      <Reference />
      <BuyerTIN>1091031210915288</BuyerTIN>
      <BuyerName>Anku</BuyerName>
      <BuyerAddress>Jakarta</BuyerAddress>
      <TaxBase>250000</TaxBase>
      <VAT>25000</VAT>
      <STLG>0</STLG>
    </SpecialDoc>
  </ListOfSpecialDoc>
</SpecialDocBulk>
```

#### Field Mapping

| # | Label | XML Tag | Type | Required | Validation | Contoh |
|---|-------|---------|------|----------|------------|--------|
| 1 | NPWP | `TIN` | string | ✅ | 16 digit | `1091031210910416` |
| 2 | Transaction Type | `TransactionType` | enum | ✅ | Lihat tabel TrxType | `01` |
| 3 | Transaction Detail | `TransactionDetail` | enum | ✅ | Lihat tabel TrxDetail | `01` |
| 4 | Transaction Document | `TransactionDocument` | enum | ✅ | Lihat tabel TrxDoc | `1` |
| 5 | Additional Information | `AdditionalInformation` | string | ❌ | Kosong jika tidak ada | _(kosong)_ |
| 6 | Nomor Dokumen | `DocumentNumber` | string | ✅ | Free text | `DELI-0002` |
| 7 | Tanggal Dokumen | `DocumentDate` | date | ✅ | YYYY-MM-DD | `2024-08-01` |
| 8 | Referensi | `Reference` | string | ❌ | Bisa kosong `<Reference />` | _(kosong)_ |
| 9 | NPWP Pembeli | `BuyerTIN` | string | ✅ | 16 digit, `0000000000000000` untuk export | `1091031210915288` |
| 10 | Nama Pembeli | `BuyerName` | string | ✅ | Free text | `Anku` |
| 11 | Alamat Pembeli | `BuyerAddress` | string | ✅ | Free text | `Jakarta` |
| 12 | Dasar Pengenaan Pajak | `TaxBase` | number | ✅ | ≥ 0 | `250000` |
| 13 | PPN | `VAT` | number | ✅ | ≥ 0 | `25000` |
| 14 | PPnBM | `STLG` | number | ✅ | ≥ 0, bisa 0 | `0` |

---

### 4.6 Dok Lain Masukan

**Kode:** `doklain_masukan`  
**XML Root:** `<InputSpecialDocBulk>`  
**Child Element:** `<SpecialDoc>`  
**Max Records:** TBD  
**Kategori:** Faktur Pajak  

#### XML Structure
```xml
<?xml version="1.0" encoding="utf-8"?>
<InputSpecialDocBulk xsi:noNamespaceSchemaLocation="SpecialInput.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <TIN>{NPWP}</TIN>
  <ListOfSpecialDoc>
    <SpecialDoc>
      <SpecialDocNo>PUR-0023</SpecialDocNo>
      <SpecialDocDate>2024-08-09</SpecialDocDate>
      <TrxType>04</TrxType>
      <TrxCode>01</TrxCode>
      <TrxDocument>8</TrxDocument>
      <TaxPeriodMonth>8</TaxPeriodMonth>
      <TaxPeriodYear>2024</TaxPeriodYear>
      <TotalTaxBase>2500000</TotalTaxBase>
      <TotalVAT>250000</TotalVAT>
      <TotalSTLG>0</TotalSTLG>
      <SellerTin>1091031210915288</SellerTin>
      <SellerName>Aku</SellerName>
    </SpecialDoc>
  </ListOfSpecialDoc>
</InputSpecialDocBulk>
```

#### Field Mapping

| # | Label | XML Tag | Type | Required | Validation | Contoh |
|---|-------|---------|------|----------|------------|--------|
| 1 | NPWP | `TIN` | string | ✅ | 16 digit | `1091031210910416` |
| 2 | Nomor Dokumen | `SpecialDocNo` | string | ✅ | Free text | `PUR-0023` |
| 3 | Tanggal Dokumen | `SpecialDocDate` | date | ✅ | YYYY-MM-DD | `2024-08-09` |
| 4 | Jenis Transaksi | `TrxType` | enum | ✅ | Lihat tabel TrxType | `04` |
| 5 | Detail Transaksi | `TrxCode` | enum | ✅ | Lihat tabel TrxDetail | `01` |
| 6 | Jenis Dokumen | `TrxDocument` | enum | ✅ | Lihat tabel TrxDoc | `8` |
| 7 | Masa Pajak | `TaxPeriodMonth` | number | ✅ | 1-12 | `8` |
| 8 | Tahun Pajak | `TaxPeriodYear` | number | ✅ | 4 digit | `2024` |
| 9 | Dasar Pengenaan Pajak | `TotalTaxBase` | number | ✅ | ≥ 0 | `2500000` |
| 10 | PPN | `TotalVAT` | number | ✅ | ≥ 0 | `250000` |
| 11 | PPnBM | `TotalSTLG` | number | ✅ | ≥ 0 | `0` |
| 12 | NPWP Penjual | `SellerTin` | string | ✅ | 16 digit | `1091031210915288` |
| 13 | Nama Penjual | `SellerName` | string | ✅ | Free text | `Aku` |

---

## 5. Reference Data (Data Referensi Dropdown)

### 5.1 Status PTKP
```
TK/0, TK/1, TK/2, TK/3
K/0,  K/1,  K/2,  K/3
HB/0, HB/1, HB/2, HB/3
```

### 5.2 Fasilitas Pajak
| Kode | Nama |
|------|------|
| N/A | Tanpa Fasilitas |
| DTP | PPh Ditanggung Pemerintah |
| ETC | Fasilitas Lainnya |
| TaxExAr21 | Surat Keterangan Bebas (SKB) PPh 21 |
| COD | Surat Keterangan Domisili (SKD) |
| SKD | Surat Keterangan Domisili (untuk WP Luar Negeri) |

### 5.3 Status Kewarganegaraan (CounterpartOpt)
| Value | Label |
|-------|-------|
| Resident | WNI / WNA dengan NPWP Indonesia |
| Foreign | WNA (Warga Negara Asing) |

### 5.4 Status Bukti Potong (BPA1)
| Value | Label |
|-------|-------|
| FullYear | Setahun penuh (Jan-Des) |
| PartialYear | Sebagian tahun |
| Annualized | Tahunan (annualized) |

### 5.5 Jenis Dokumen Referensi
| Kode | Nama |
|------|------|
| Announcement | Pengumuman |
| CommercialInvoice | Surat Tagihan |
| Contract | Kontrak |
| CurrentAccount | Jasa Giro |
| Decree | Decree |
| DeedOfEngagement | Akta Perjanjian |
| DeedOfGeneral | Akta RUPS |
| TaxInvoice | Faktur Pajak |

### 5.6 Transaction Type (Dok Lain)
| Kode | Deskripsi |
|------|-----------|
| 01 | DELIVERY (Penyerahan) |
| 02 | EXPORT |
| 03 | IMPORT |
| 04 | PURCHASE (Pembelian) |
| 05 | UNCREDIT |

### 5.7 Transaction Detail (Dok Lain)
| Kode | Deskripsi |
|------|-----------|
| 01 | To other party than VAT Collector |
| 02 | To Government Institution as VAT Collector |
| 03 | To VAT Collector other than Government Institution |
| 04 | Other Tax Base |
| 05 | Certain value Tax Base |
| 06 | To Tourist for VAT Refund |
| 07 | VAT Uncollected |
| 08 | VAT Exempted |
| 09 | Sale of unrelated to business asset |
| 10 | Other delivery of goods/services |
| 11 | Exports of Tangible Goods |
| 12 | Exports of Intangible Goods |
| 13 | Exports of Services |
| 14 | Import Taxable Goods |
| 15 | Utilization of Intangible Taxable Goods/Services |

### 5.8 Transaction Document (Dok Lain)
| Kode | Deskripsi |
|------|-----------|
| 01 | Documents Equivalent to Tax Invoice |
| 02 | Cigarette Excise |
| 03 | Bonded Area Document |
| 04 | Export Notice of Goods |
| 05 | Export Notice of Services/Intangible Goods |
| 06 | Import Notice and Payment |
| 07 | Payment |
| 08 | Special documents |
| 09 | Notice of Tax Underpayment Assessment |
| 10 | Import Notice |

### 5.9 Additional Information (Dok Lain Keluaran)

**Kode 07 — PPN Tidak Dipungut:**
| Kode | Deskripsi |
|------|-----------|
| 1 | PPN Tidak Dipungut berdasarkan PP 10/2012 |
| 2 | PPN/PPnBM tidak dipungut |
| 3 | PPN dan PPnBM Tidak Dipungut |
| 4 | PPN Tidak Dipungut Sesuai PP 71/2012 |
| 5 | (Tidak ada Cap) |
| 6 | PPN/PPnBM tidak dipungut PMK 194/PMK.03/2012 |
| 7 | PPN Tidak Dipungut PP 15/2015 |
| 8 | PPN Tidak Dipungut PP 69/2015 |
| 9 | PPN Tidak Dipungut PP 96/2015 |
| 10 | PPN Tidak Dipungut PP 106/2015 |
| 11 | PPN Tidak Dipungut PP 50/2019 |
| 12 | PPN/PPnBM Tidak Dipungut PP 27/2017 |
| 13-27 | (Berbagai dasar hukum lainnya) |

**Kode 08 — PPN Dibebaskan:**
| Kode | Deskripsi |
|------|-----------|
| 1 | PPN Dibebaskan PP 146/2000 |
| 2 | PPN Dibebaskan PP 12/2001 |
| 3 | PPN Dibebaskan PP 28/2009 |
| 5 | PPN Dibebaskan PP 81/2015 |
| 6 | PPN Dibebaskan PP 74/2015 |
| 8 | PPN Dibebaskan PP 81/2015 (diubah PP 48/2020) |
| 9 | PPN Dibebaskan PP 47/2020 |
| 10 | PPN Dibebaskan PP 49/2022 |

### 5.10 Kode Negara (ISO 3166-1 Alpha-3)
> Full list: 249 country codes tersedia di BP26 REF sheet  
> Contoh: USA (United States), SGP (Singapore), CHN (China), JPN (Japan), MYS (Malaysia), AUS (Australia), GBR (United Kingdom), DEU (Germany), dll.

---

## 6. UI/UX Design

### 6.1 Halaman Utama (Landing)
```
┌─────────────────────────────────────────────────┐
│  🔧 XML Converter Coretax                       │
│  alatpajak.id/tools/xml-converters              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Konversi data pajak ke XML untuk Coretax DJP   │
│  100% gratis. 100% privat. Semua di browser.    │
│                                                 │
│  [Pilih Template ▼]  [Mulai Convert →]         │
│                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Bupot   │ │ Faktur  │ │  SPT    │            │
│  │ PPh 21  │ │ Pajak   │ │  Masa   │            │
│  └─────────┘ └─────────┘ └─────────┘           │
│                                                 │
│  🔒 Privacy First — data diproses lokal        │
│  📋 34+ template tersedia                      │
│  ⚡ Import CSV/Excel atau input manual          │
└─────────────────────────────────────────────────┘
```

### 6.2 Halaman Converter (`/convert/[templateId]`)
```
┌─────────────────────────────────────────────────┐
│ ← Kembali  |  BPMP - Bukti Potong Bulanan      │
├─────────────────────────────────────────────────┤
│ [Import CSV/Excel] [Input Manual]               │
├─────────────────────────────────────────────────┤
│                                                 │
│  NPWP Pemotong: [0029482015507000____________]  │
│                                                 │
│  ┌───┬────────┬────────┬────────┬──────┐        │
│  │ # │ NIK    │ Nama   │ KOP    │ Bruto│        │
│  ├───┼────────┼────────┼────────┼──────┤        │
│  │ 1 │ 3275.. │ Staff  │ 21-100 │ 40M  │        │
│  │ 2 │ 3273.. │ Admin  │ 21-100 │ 30M  │        │
│  │ 3 │ + Add Row       │        │      │        │
│  └───┴────────┴────────┴────────┴──────┘        │
│                                                 │
│  [Validate ✓]  [Preview XML]  [Download ⬇]     │
└─────────────────────────────────────────────────┘
```

### 6.3 Preview XML
```
┌─────────────────────────────────────────────────┐
│ Preview XML — BPMP                              │
├─────────────────────────────────────────────────┤
│ <?xml version="1.0" encoding="UTF-8"?>          │
│ <MmPayrollBulk xmlns:xsi="...">                 │
│   <TIN>0029482015507000</TIN>                   │
│   <ListOfMmPayroll>                             │
│     <MmPayroll>                                 │
│       <TaxPeriodMonth>10</TaxPeriodMonth>        │
│       ...                                       │
│     </MmPayroll>                                │
│   </ListOfMmPayroll>                            │
│ </MmPayrollBulk>                                │
├─────────────────────────────────────────────────┤
│ [Copy 📋]  [Download XML ⬇]  [Download ZIP ⬇]  │
└─────────────────────────────────────────────────┘
```

### 6.4 Design System
- **Color Scheme:** Biru-hijau corporate (alatpajak.id branding)
- **Font:** Inter (sans-serif) + JetBrains Mono (code/XML preview)
- **Components:** shadcn/ui (Button, Input, Select, Table, Tabs, Dialog, Toast)
- **Responsive:** Mobile-first, tablet & desktop friendly

---

## 7. Data Flow

### 7.1 Import Flow
```
1. User upload CSV/Excel
2. SheetJS parse file → JSON array of objects
3. Auto-detect column headers → map ke XML fields
   - Exact match (case-insensitive)
   - Fuzzy match (Levenshtein distance)
   - Manual mapping jika auto-detect gagal
4. User review mapping → confirm
5. Data masuk ke tabel editable
6. User bisa edit langsung di tabel
7. Validate semua row
8. Generate XML
9. Preview + Download
```

### 7.2 Manual Input Flow
```
1. User pilih template
2. Tampil form/tabel kosong
3. Field "NPWP Pemotong" auto-fill dari setting (disimpan di localStorage)
4. User isi data per row
5. Dropdown untuk field enum (KOP, PTKP, Fasilitas, dll)
6. Validasi real-time per field
7. Add row / delete row
8. Generate XML
9. Preview + Download
```

### 7.3 XML Generation
```
1. Ambil data dari tabel
2. Validasi semua field wajib
3. Build XML menggunakan template yang sesuai
4. Handle special cases:
   - xsi:nil="true" untuk field kosong optional
   - Format tanggal YYYY-MM-DD (strip waktu dari Excel)
   - Format angka (desimal pakai titik)
5. Pretty-print XML (indent 2 spaces)
6. Tampilkan di preview
7. Download sebagai file .xml
```

---

## 8. Validation Rules

### 8.1 Common Validations (Semua Template)
| Field | Rule |
|-------|------|
| TIN (NPWP) | 16 digit angka, harus sama dengan NPWP login Coretax |
| NIK | 16 digit angka |
| NITKU (ID TKU) | 21 digit angka |
| TaxPeriodMonth | Integer 1-12 |
| TaxPeriodYear | Integer, ≥ 2024 |
| WithholdingDate | Format YYYY-MM-DD, tidak boleh < masa pajak |
| Gross | Number ≥ 0 |
| Rate | Number 0-100 |

### 8.2 Template-Specific Validations

**BPMP:**
- CounterpartOpt wajib `Resident` atau `Foreign`
- Jika `Foreign`, CounterpartPassport wajib diisi
- TaxCertificate: `N/A`, `DTP`, `ETC`
- TaxObjectCode: harus dari daftar KOP yang valid

**BP21:**
- Document: jika `TaxInvoice`, DocumentNumber harus format Faktur Pajak (16 digit)
- Deemed: 0-100

**BP26:**
- CounterpartCountry: harus dari daftar ISO 3166-1 alpha-3
- Jika TaxCertificate = `SKD`, CounterpartReceiptNumber wajib diisi

**BPA1:**
- Jika StatusOfWithholding = `FullYear`:
  - TaxPeriodMonthStart = 1, TaxPeriodMonthEnd = 12, NumberOfMonths = 0
- GrossUpOpt: `Yes` atau `No`

**Dok Lain Keluaran/Masukan:**
- TransactionType, TransactionDetail, TransactionDocument: harus dari enum valid
- Jika TransactionType = `02` (EXPORT), BuyerTIN bisa `0000000000000000`

---

## 9. Development Phases

### Phase 1 — MVP (2 minggu)
**Scope:** 6 template yang sudah ada Excel converter (BPMP, BP21, BP26, BPA1, DokLainKeluaran, DokLainMasukan)

| Task | Estimasi |
|------|----------|
| Setup project (Next.js + TailwindCSS + shadcn/ui) | 1 hari |
| Template data structure (TypeScript types + JSON schema) | 1 hari |
| XML builder service | 1 hari |
| CSV/Excel import (SheetJS integration) | 1 hari |
| Manual input form (editable table) | 2 hari |
| Preview XML (syntax highlight) | 0.5 hari |
| Validation engine (Zod) | 1 hari |
| Download (single XML + ZIP) | 0.5 hari |
| Landing page + template selector | 1 hari |
| Testing & bug fixes | 2 hari |
| **Total** | **~11 hari** |

### Phase 2 — Expansion (2 minggu)
- Tambah template: Faktur Keluaran, Faktur Masukan, Retur Faktur, Retail
- Tambah template: BPA2, BPPU, BPNR, BPSP, BPCY, DDBU
- Auto-column mapping (fuzzy match)
- Batch operations (merge multiple files)
- Save/load draft di IndexedDB
- Dark mode

### Phase 3 — Complete (2 minggu)
- Tambah template: SPT Badan, SPT OP, SPT Masa PPN
- Tambah template: Bea Meterai, Lembaga Keuangan
- PWA support (offline mode)
- Template version tracking (monitor DJP updates)
- Advanced analytics (template usage stats)
- SEO optimization

### Phase 4 — Monetization (ongoing)
- Freemium model: basic free, premium untuk batch > 10 records
- Ads (privacy-friendly)
- API access (optional)

---

## 10. File Structure (Project)

```
xml-converter-website/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── templates/
│   │   │   └── page.tsx                # Template library
│   │   ├── convert/
│   │   │   └── [templateId]/
│   │   │       └── page.tsx            # Converter page
│   │   ├── help/
│   │   │   └── page.tsx                # Help/FAQ
│   │   └── about/
│   │       └── page.tsx                # About
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   ├── TemplateCard.tsx
│   │   ├── ImportPanel.tsx
│   │   ├── ManualInputTable.tsx
│   │   ├── XmlPreview.tsx
│   │   ├── ColumnMapper.tsx
│   │   ├── ValidationStatus.tsx
│   │   └── DownloadButton.tsx
│   ├── lib/
│   │   ├── templates/
│   │   │   ├── index.ts                # Template registry
│   │   │   ├── bpmp.ts                 # BPMP field definitions
│   │   │   ├── bp21.ts
│   │   │   ├── bp26.ts
│   │   │   ├── bpa1.ts
│   │   │   ├── doklain-keluaran.ts
│   │   │   ├── doklain-masukan.ts
│   │   │   └── ...                     # More templates
│   │   ├── xml-builder.ts             # XML generation
│   │   ├── excel-parser.ts            # CSV/Excel parsing
│   │   ├── validator.ts               # Validation engine
│   │   ├── column-mapper.ts           # Auto column mapping
│   │   └── zip-builder.ts             # ZIP generation
│   ├── data/
│   │   ├── ref-kop-codes.ts           # Kode Objek Pajak
│   │   ├── ref-ptkp.ts                # Status PTKP
│   │   ├── ref-fasilitas.ts           # Fasilitas Pajak
│   │   ├── ref-countries.ts           # Country codes
│   │   ├── ref-doc-types.ts           # Document types
│   │   └── ref-trx-types.ts           # Transaction types
│   └── types/
│       └── template.ts                # TypeScript interfaces
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## 11. TypeScript Types

```typescript
// Core types untuk template system

interface TemplateField {
  id: string;
  label: string;           // Label Indonesia untuk UI
  xmlTag: string;          // XML tag name
  type: 'string' | 'number' | 'date' | 'enum';
  required: boolean;
  rootLevel?: boolean;     // true jika field di root (bukan per record), e.g. TIN
  validation?: {
    pattern?: string;       // Regex pattern
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    enum?: string[];        // Allowed values
  };
  enumRef?: string;        // Reference to dropdown data, e.g. 'kopCodes', 'ptkpStatus'
  defaultValue?: string;
  placeholder?: string;
  description?: string;    // Help text
  nilIfEmpty?: boolean;    // If true, output xsi:nil="true" when empty
  dateFormat?: string;     // For date fields, output format
}

interface Template {
  id: string;              // e.g. 'bpmp'
  name: string;            // e.g. 'Bukti Pemotongan Bulanan Pegawai Tetap'
  category: string;        // e.g. 'Bupot PPh 21/26'
  xmlRoot: string;         // e.g. 'MmPayrollBulk'
  xmlChild: string;        // e.g. 'MmPayroll'
  xmlListWrapper: string;  // e.g. 'ListOfMmPayroll'
  xmlnsXsi: boolean;       // Include xmlns:xsi
  maxRecords: number;      // Max records per upload
  rootFields: TemplateField[];   // Fields at root level (TIN)
  recordFields: TemplateField[]; // Fields per record
  sampleXml: string;       // Sample XML string
  description: string;     // Template description
}

interface ConversionResult {
  xml: string;
  recordCount: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: string;
}

interface ColumnMapping {
  csvColumn: string;
  templateFieldId: string;
  confidence: number;      // 0-1, auto-mapping confidence
}
```

---

## 12. Testing Strategy

### Unit Tests
- XML builder: input data → expected XML string
- Validator: invalid data → expected error messages
- Excel parser: sample files → expected JSON
- Column mapper: various headers → expected mappings

### Integration Tests
- Full flow: upload CSV → validate → preview → download XML
- Full flow: manual input → validate → preview → download XML
- Each template end-to-end

### Test Data
- Sample Excel files dari DJP (sudah di `/tmp/coretax_templates/`)
- Sample XML files (sudah di `/tmp/coretax_templates/xml_samples/`)
- Edge cases: empty fields, max records, special characters, tanggal format

### Commands
```bash
npm run test          # Unit tests (Vitest)
npm run test:e2e      # E2E tests (Playwright)
npm run test:all      # Run all tests
```

---

## 13. Deployment

### Vercel Deployment
```bash
# Build
npm run build

# Deploy
vercel --prod

# Custom domain: coretax.alatpajak.id
```

### Environment Variables
```
NEXT_PUBLIC_SITE_URL=https://coretax.alatpajak.id
NEXT_PUBLIC_ANALYTICS_ID=xxx  # Plausible/Umami
```

### Build Checklist
- [ ] All templates validated with sample data
- [ ] XML output matches DJP sample files exactly
- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] Mobile responsive
- [ ] CSP headers set (no external scripts except analytics)
- [ ] Privacy policy page ready
- [ ] robots.txt + sitemap.xml

---

## 14. Security & Privacy

### Content Security Policy
```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'none';  // No external connections!
```

### Privacy Measures
1. **No backend** — static site only, all processing client-side
2. **No cookies** — use localStorage/IndexedDB for preferences
3. **No tracking** — privacy-friendly analytics only (Plausible/Umami)
4. **No data transmission** — files processed in browser memory only
5. **Auto-clear** — option to clear all local data after session
6. **CSP headers** — prevent any accidental data leakage
7. **HTTPS only** — enforced via Vercel

### Disclaimer
> "Website ini memproses semua data secara lokal di browser Anda. Tidak ada data yang dikirim ke server manapun. Tool ini bukan merupakan aplikasi resmi Direktorat Jenderal Pajak."

---

## 15. SEO & Performance

### SEO
- Title: "XML Converter Coretax DJP — Gratis, Privat, All-in-One | alatpajak.id"
- Meta description: "Konversi CSV/Excel ke XML untuk upload Coretax. 34+ template, 100% gratis, data diproses lokal di browser Anda."
- Structured data: SoftwareApplication schema
- Sitemap.xml with all template pages
- robots.txt allowing all crawlers

### Performance Targets
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3s
- Bundle size: < 200KB gzipped
- No server round-trips for conversion

---

## 16. Appendix

### A. Source Files
| File | Deskripsi | Lokasi |
|------|-----------|--------|
| BPMP Excel Converter | Template + data + mapping | `/tmp/coretax_templates/BPMP_Excel_to_XML.xlsx` |
| BP21 Excel Converter | Template + data + mapping | `/tmp/coretax_templates/BP21_Excel_to_XML.xlsx` |
| BP26 Excel Converter | Template + data + mapping | `/tmp/coretax_templates/BP26_Excel_to_XML.xlsx` |
| BPA1 Excel Converter | Template + data + mapping | `/tmp/coretax_templates/BPA1_Excel_to_XML.xlsx` |
| DokLainKeluaran | Template + data | `/tmp/coretax_templates/DokLainKeluaran.xlsx` |
| DokLainMasukan | Template + data | `/tmp/coretax_templates/DokLainMasukan.xlsx` |
| BPMP XML Sample | Contoh XML output | `/tmp/coretax_templates/xml_samples/bpmp.xml` |
| BP21 XML Sample | Contoh XML output | `/tmp/coretax_templates/xml_samples/bp21.xml` |
| BPA1 XML Sample | Contoh XML output | `/tmp/coretax_templates/xml_samples/bpa1.xml` |
| Dok Lain Keluaran XML | Contoh XML output | `/tmp/coretax_templates/xml_samples/Dok Lain Keluaran.xml` |
| Dok Lain Masukan XML | Contoh XML output | `/tmp/coretax_templates/xml_samples/Dok Lain Masukan.xml` |
| User Manual PDF | Panduan penggunaan | `/tmp/coretax_templates/user_manual.pdf` |
| Mekanisme Upload PDF | Panduan upload faktur | `/tmp/coretax_templates/mekanisme_upload_faktur.pdf` |

### B. Referensi DJP
- Template XML & Converter: https://www.pajak.go.id/id/reformdjp/coretax/template-xml-dan-converter-excel-ke-xml
- Coretax Info: https://www.pajak.go.id/reformdjp/coretax/
- Contoh download: `https://pajak.go.id/sites/default/files/2025-04/BPMP%20Excel%20to%20XML%20v.3.xlsx`

### C. Glossary
| Istilah | Arti |
|---------|------|
| BPMP | Bukti Pemotongan Bulanan Pegawai Tetap |
| BP21 | Bukti Pemotongan PPh 21 Final/Tidak Final |
| BP26 | Bukti Pemotongan PPh 26 WP Luar Negeri |
| BPA1 | Bukti Pemotongan A1 (Annual/Tahunan) |
| KOP | Kode Objek Pajak |
| PTKP | Penghasilan Tidak Kena Pajak |
| NITKU | Nomor Identitas Tempat Kegiatan Usaha (21 digit) |
| TKU | Tempat Kegiatan Usaha |
| DTP | Ditanggung Pemerintah |
| SKD | Surat Keterangan Domisili |
| SKB | Surat Keterangan Bebas |
| Coretax | Sistem inti administrasi perpajakan DJP |
| DJP | Direktorat Jenderal Pajak |

---

*PRD ini dibuat berdasarkan analisis file Excel converter dan XML sample resmi dari DJP. Template yang belum dianalisis (BPA2, BPPU, BPNR, BPSP, BPCY, DDBU, Faktur, SPT) akan ditambahkan di Phase 2-3 setelah file converter-nya diunduh dari website DJP.*

*_Generated by Catheez PA — 1 April 2026_*
