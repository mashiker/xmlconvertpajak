# SPESIFIKASI TEKNIS COMPREHENSIVE: Coretax XML Converter

> **Dokumen ini** dikompilasi dari riset EXA AI terhadap sumber-sumber terkini (Nov 2024 – Apr 2026) meliputi DJP Coretax, spesifikasi XML pajak Indonesia, dan tech stack yang relevan.

**Tanggal Riset:** April 2026  
**Versi Dokumen:** 1.0

---

## DAFTAR ISI

1. [Coretax XML Specifications (Per Jenis Dokumen)](#1-coretax-xml-specifications-per-jenis-dokumen)
2. [Tech Stack Spesifikasi Terkini](#2-tech-stack-spesifikasi-terkini)
3. [Algoritma Validasi NPWP](#3-algoritma-validasi-npwp)
4. [Best Practices Generasi XML](#4-best-practices-generasi-xml)
5. [Rekomendasi Implementasi](#5-rekomendasi-implementasi)

---

## 1. CORETAX XML SPECIFICATIONS (Per Jenis Dokumen)

### 1.1 Gambaran Umum Coretax XML

Sistem Coretax (Core Tax Administration System) DJP yang beroperasi sejak awal 2025 menggunakan format **XML (eXtensible Markup Language)** sebagai standar impor data untuk semua jenis pelaporan perpajakan. Format ini menggantikan CSV yang digunakan di DJP Online.

**Sumber template resmi DJP:** `https://www.pajak.go.id/reformdjp/coretax/template-xml`

**Tiga kanal pembuatan dokumen di Coretax:**
1. **Input Manual (Key In)** – melalui antarmuka web Coretax
2. **Impor XML** – upload file XML yang sudah dibuat dari template Excel/CSV
3. **Web Service/API** – untuk integrasi sistem (PKP besar)

**Kunci perubahan dari DJP Online ke Coretax:**
- Format berubah dari CSV ke XML
- Struktur data lebih ketat dengan tag XML yang sudah ditentukan
- Validasi NPWP dilakukan secara real-time saat impor
- Mendukung penandatanganan digital pada dokumen faktur pajak

---

### 1.2 Bupot PPh 21 – BPMP (Bukti Potong Bulanan Pegawai Tetap)

#### Struktur XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<BPMP>
  <Header>
    <NPWPPemotong>01.234.567.8-091.000</NPWPPemotong>
    <NamaPemotong>PT MAJU BERSAMA SEJAHTERA</NamaPemotong>
    <KPPMasa>091</KPPMasa>
    <MasaPajak>01</MasaPajak>
    <TahunPajak>2026</TahunPajak>
    <Pembetulan>0</Pembetulan>
    <JumlahPenerimaPenghasilan>15</JumlahPenerimaPenghasilan>
    <TotalPPhDipotong>47500000</TotalPPhDipotong>
  </Header>
  <Detail>
    <PenerimaPenghasilan>
      <No>1</No>
      <NPWPPenerimaPenghasilan>12.345.678.9-091.000</NPWPPenerimaPenghasilan>
      <NIK>3201012345670001</NIK>
      <NamaPenerimaPenghasilan>Siti Aminah</NamaPenerimaPenghasilan>
      <StatusPtkp>TK/0</StatusPtkp>
      <JumlahTanggungan>0</JumlahTanggungan>
      <Jabatan>Staff Accounting</Jabatan>
      <NoPAS>01234567890123</NoPAS>
      <MasaKerja>36</MasaKerja>
      <GajiPensiun>15000000</GajiPensiun>
      <TunjanganPPH>1500000</TunjanganPPH>
      <TunjanganLainnya>500000</TunjanganLainnya>
      <Honorarium>0</Honorarium>
      <PremiAsuransi>300000</PremiAsuransi>
      <IuranPensiun>600000</IuranPensiun>
      <PenghasilanBruto>17900000</PenghasilanBruto>
      <BiayaJabatan>600000</BiayaJabatan>
      <IuranPensiunDitanggung>0</IuranPensiunDitanggung>
      <PenghasilanNeto>17300000</PenghasilanNeto>
      <PTKP>54000000</PTKP>
      <PKP>0</PKP>
      <PPhDipotong>0</PPhDipotong>
      <PPhDitanggung>0</PPhDitanggung>
      <KodeNegara></KodeNegara>
      <KodePemberiKerja></KodePemberiKerja>
    </PenerimaPenghasilan>
    <!-- ... item berikutnya ... -->
  </Detail>
</BPMP>
```

#### Spesifikasi Field Header BPMP

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `NPWPPemotong` | String (20) | Ya | NPWP pemberi kerja, format: XX.XXX.XXX.X-XXX.XXX |
| `NamaPemotong` | String (100) | Ya | Nama perusahaan/pemberi kerja |
| `KPPMasa` | String (3) | Ya | Kode KPP tempat pelaporan |
| `MasaPajak` | String (2) | Ya | Bulan pajak (01-12) |
| `TahunPajak` | String (4) | Ya | Tahun pajak |
| `Pembetulan` | String (1) | Ya | 0=normal, 1=petama, dst |
| `JumlahPenerimaPenghasilan` | Integer | Ya | Total baris detail |
| `TotalPPhDipotong` | Decimal | Ya | Total PPh dipotong seluruh pegawai |

#### Spesifikasi Field Detail BPMP

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `No` | Integer | Ya | Nomor urut |
| `NPWPPenerimaPenghasilan` | String (20) | Ya | NPWP karyawan |
| `NIK` | String (16) | Ya | NIK KTP karyawan |
| `NamaPenerimaPenghasilan` | String (100) | Ya | Nama lengkap karyawan |
| `StatusPtkp` | String (10) | Ya | TK/0, K/1, K/2, K/3, K/I/0, K/I/1, K/I/2, K/I/3 |
| `JumlahTanggungan` | Integer | Ya | 0-3 |
| `Jabatan` | String (100) | Ya | Jabatan di perusahaan |
| `NoPAS` | String (17) | Tidak | Nomor Pokok Wajib Pajak |
| `MasaKerja` | Integer | Ya | Dalam bulan |
| `GajiPensiun` | Decimal | Ya | Gaji dan tunjangan |
| `TunjanganPPH` | Decimal | Ya | Tunjangan PPh ditanggung |
| `TunjanganLainnya` | Decimal | Ya | Tunjangan lain-lain |
| `Honorarium` | Decimal | Ya | Honorarium |
| `PremiAsuransi` | Decimal | Ya | Premi asuransi yang dibayar pemberi kerja |
| `IuranPensiun` | Decimal | Ya | Iuran pensiun yang dibayar pemberi kerja |
| `PenghasilanBruto` | Decimal | Ya | Dihitung otomatis |
| `BiayaJabatan` | Decimal | Ya | 5% dari bruto, maks Rp 500.000/bulan (PER 16/2016) |
| `IuranPensiunDitanggung` | Decimal | Ya | Yang ditanggung karyawan |
| `PenghasilanNeto` | Decimal | Ya | Dihitung otomatis |
| `PTKP` | Decimal | Ya | Penghasilan Tidak Kena Pajak |
| `PKP` | Decimal | Ya | Penghasilan Kena Pajak |
| `PPhDipotong` | Decimal | Ya | PPh Pasal 21 yang dipotong |
| `PPhDitanggung` | Decimal | Ya | PPh yang ditanggung pemberi kerja |
| `KodeNegara` | String (3) | Tidak | IDN untuk WNI |
| `KodePemberiKerja` | String (3) | Tidak | Kode jenis pemberi kerja |

#### Nilai Enumerasi StatusPTKP

```
TK/0   = Tidak Kawin, 0 tanggungan
TK/1   = Tidak Kawin, 1 tanggungan
TK/2   = Tidak Kawin, 2 tanggungan
TK/3   = Tidak Kawin, 3 tanggungan
K/0    = Kawin, 0 tanggungan
K/1    = Kawin, 1 tanggungan
K/2    = Kawin, 2 tanggungan
K/3    = Kawin, 3 tanggungan
K/I/0  = Kawin, penghasilan istri digabung, 0 tanggungan
K/I/1  = Kawin, penghasilan istri digabung, 1 tanggungan
K/I/2  = Kawin, penghasilan istri digabung, 2 tanggungan
K/I/3  = Kawin, penghasilan istri digabung, 3 tanggungan
```

#### Logika Perhitungan BPMP

```
PenghasilanBruto = GajiPensiun + TunjanganPPH + TunjanganLainnya + Honorarium + PremiAsuransi + IuranPensiun
BiayaJabatan = min(5% × PenghasilanBruto, 500.000)
PenghasilanNeto = PenghasilanBruto - BiayaJabatan - IuranPensiunDitanggung
PTKP = tarif PTKP sesuai status (lihat tabel di bawah)
PKP = max(0, 12 × PenghasilanNeto - PTKP)
PPhSetahun = hitung_pkp_progressif(PKP)
PPhPerBulan = PPhSetahun / 12
```

**Tabel PTKP 2026 (per tahun):**

| Status | PTKP |
|--------|------|
| TK/0 | Rp 54.000.000 |
| TK/1 | Rp 58.500.000 (+4.500.000) |
| TK/2 | Rp 63.000.000 (+9.000.000) |
| TK/3 | Rp 67.500.000 (+13.500.000) |
| K/0 | Rp 58.500.000 (+4.500.000) |
| K/1 | Rp 63.000.000 (+9.000.000) |
| K/2 | Rp 67.500.000 (+13.500.000) |
| K/3 | Rp 72.000.000 (+18.000.000) |

---

### 1.3 Bupot PPh Final – BPPU (Bukti Potong PPh Final/Pasal 4 ayat 2)

#### Struktur XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<BPPU>
  <Header>
    <NPWPPemotong>01.234.567.8-091.000</NPWPPemotong>
    <NamaPemotong>PT MAJU BERSAMA SEJAHTERA</NamaPemotong>
    <KPPMasa>091</KPPMasa>
    <MasaPajak>03</MasaPajak>
    <TahunPajak>2026</TahunPajak>
    <Pembetulan>0</Pembetulan>
    <JumlahPenerimaPenghasilan>3</JumlahPenerimaPenghasilan>
  </Header>
  <Detail>
    <PenerimaPenghasilan>
      <No>1</No>
      <NPWPPenerimaPenghasilan>12.345.678.9-091.000</NPWPPenerimaPenghasilan>
      <NamaPenerimaPenghasilan>CV Mandiri Jaya</NamaPenerimaPenghasilan>
      <JenisPenghasilanFinal>310</JenisPenghasilanFinal>
      <AlamatWajibPajak>Jl. Sudirman No. 45, Jakarta Selatan</AlamatWajibPajak>
      <PenghasilanBruto>25000000</PenghasilanBruto>
      <TarifPajak>0.025</TarifPajak>
      <PPhDipotong>625000</PPhDipotong>
      <NoBuktiPotong>000001/BPPU/03/2026</NoBuktiPotong>
      <TanggalBuktiPotong>2026-03-15</TanggalBuktiPotong>
    </PenerimaPenghasilan>
    <!-- ... item berikutnya ... -->
  </Detail>
</BPPU>
```

#### Jenis Penghasilan Final (Enumerasi)

| Kode | Jenis Penghasilan | Tarif |
|------|-------------------|-------|
| 310 | Hadiah undian | 25% |
| 311 | Bunga deposito/tabungan | 20% |
| 312 | Hadiah lotere | 25% |
| 320 | Sewa tanah/bangunan | 10% |
| 321 | Royalti | 15% |
| 330 | Transaksi saham | 0.1% / 0.15% |
| 340 | Pengalihan hak atas tanah | 5% |
| 350 | Kegiatan usaha real estate | 5% |
| 360 | Penghasilan dokter | 5% |
| 370 | Transaksi derivative saham | 0.05% |
| 380 | Jasa konstruksi | 3% / 4% |
| 390 | Lain-lain | Sesuai |

---

### 1.4 Faktur Pajak Keluaran (e-Faktur)

#### Struktur XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<FakturPajak>
  <FK>
    <NoFaktur>0100001234567890</NoFaktur>
    <KdJenisTransaksi>01</KdJenisTransaksi>
    <FgPengganti>0</FgPengganti>
    <NomorInvoiceFaktur>INV/2026/0001</NomorInvoiceFaktur>
    <TglFaktur>2026-01-15</TglFaktur>
    <NPWPPenjual>01.234.567.8-091.000</NPWPPenjual>
    <NamaPenjual>PT MAJU BERSAMA SEJAHTERA</NamaPenjual>
    <AlamatPenjual>Jl. Gatot Subroto Kav 35-36, Jakarta Selatan 12950</AlamatPenjual>
    <NPWPBarangBukanKenaPajak></NPWPBarangBukanKenaPajak>
    <NamaBarangBukanKenaPajak></NamaBarangBukanKenaPajak>
    <AlamatBarangBukanKenaPajak></AlamatBarangBukanKenaPajak>
    <NPWPPembeli>02.345.678.9-092.000</NPWPPembeli>
    <NamaPembeli>CV SUKSES MAKMUR</NamaPembeli>
    <AlamatPembeli>Jl. Asia Afrika No. 15, Bandung 40111</AlamatPembeli>
    <IsExport>0</IsExport>
    <KodeValuta>IDR</KodeValuta>
    <FgUangMuka>0</FgUangMuka>
    <UangMuka>0</UangMuka>
    <NilaiBarangKenaPajak>100000000</NilaiBarangKenaPajak>
    <DikurangiUangMuka>0</DikurangiUangMuka>
    <NilaiBarangKenaPajakLain>0</NilaiBarangKenaPajakLain>
    <NilaiJasaKenaPajakLain>0</NilaiJasaKenaPajakLain>
    <DasarPengenaanPajak>100000000</DasarPengenaanPajak>
    <PPn>11000000</PPn>
    <PPnBM>0</PPnBM>
    <TarifPPnBM>0</TarifPPnBM>
    <PPnBM_DasarPengenaan>0</PPnBM_DasarPengenaan>
    <PPnBM_PpnBM>0</PPnBM_PpnBM>
    <Referensi></Referensi>
    <Keterangan>Laporan Q1 2026</Keterangan>
  </FK>
  <Detil>
    <DetilItem>
      <No>1</No>
      <NamaBarang>Laptop Dell Latitude 5540</NamaBarang>
      <HargaSatuan>25000000</HargaSatuan>
      <JumlahBarang>4</JumlahBarang>
      <SatuanBarang>Unit</SatuanBarang>
      <HargaTotal>100000000</HargaTotal>
      <Diskon>0</Diskon>
      <Dpp>100000000</Dpp>
      <PPn>11000000</PPn>
      <PPnBM>0</PPnBM>
      <TarifPPnBM>0</TarifPPnBM>
      <BarangBukanKenaPajak>0</BarangBukanKenaPajak>
      <ReferensiItem></ReferensiItem>
    </DetilItem>
    <!-- ... item berikutnya ... -->
  </Detil>
</FakturPajak>
```

#### Spesifikasi Field Header FK (Faktur Keluaran)

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `NoFaktur` | String (16) | Ya | Nomor faktur dari sistem DJP |
| `KdJenisTransaksi` | String (2) | Ya | Jenis transaksi (lihat enumerasi) |
| `FgPengganti` | String (1) | Ya | 0=faktur asli, 1=faktur pengganti |
| `NomorInvoiceFaktur` | String | Ya | Nomor invoice internal PKP |
| `TglFaktur` | Date (YYYY-MM-DD) | Ya | Tanggal faktur |
| `NPWPPenjual` | String (20) | Ya | NPWP PKP penjual |
| `NamaPenjual` | String (100) | Ya | Nama PKP penjual |
| `AlamatPenjual` | String (200) | Ya | Alamat PKP penjual |
| `NPWPBarangBukanKenaPajak` | String (20) | Tidak | Untuk barang BKP khusus |
| `NPWPPembeli` | String (20) | Ya | NPWP pembeli (boleh 000.000.000.0-000.000) |
| `NamaPembeli` | String (100) | Ya | Nama pembeli |
| `AlamatPembeli` | String (200) | Ya | Alamat pembeli |
| `IsExport` | String (1) | Ya | 0=tidak, 1=ekspor |
| `KodeValuta` | String (3) | Ya | IDR, USD, dll |
| `FgUangMuka` | String (1) | Ya | 0=tidak ada Uang Muka, 1=ada |
| `UangMuka` | Decimal | Ya | Nilai uang muka |
| `NilaiBarangKenaPajak` | Decimal | Ya | DPP Barang |
| `DikurangiUangMuka` | Decimal | Ya | Pengurangan Uang Muka |
| `NilaiBarangKenaPajakLain` | Decimal | Tidak | Nilai lain-lain |
| `DasarPengenaanPajak` | Decimal | Ya | Total DPP |
| `PPn` | Decimal | Ya | PPN = 11% × DPP |
| `PPnBM` | Decimal | Ya | PPNBM |
| `TarifPPnBM` | Decimal | Ya | Tarif PPNBM |
| `Keterangan` | String (200) | Tidak | Catatan |

#### Kode Jenis Transaksi (Enumerasi)

| Kode | Jenis |
|------|-------|
| 01 | Penyerahan BKP |
| 02 | Penyerahan JKP |
| 03 | Ekspor BKP |
| 04 | Ekspor BKP Berwujud |
| 05 | Ekspor JKP |
| 06 | Penyerahan BKP kepada Pemungut PPN |
| 07 | Penyerahan BKP yang PPN-nya tidak dipungut |
| 08 | Penyerahan BKP/PJKP yang PPn-nya dipungut oleh pemungut |
| 09 | Penyerahan BKP pengecer |
| 10 | Penyerahan BKP secara konsinyasi |
| 11 | Penyerahan BKP yang langsung diekspor |
| 12 | Penyerahan BKP penunjukan pabean |
| 13 | Penyerahan BKP berwujud yang tergolong mewah |
| 14 | Penyerahan BKP di dalam Kawasan Bebas |
| 15 | Penyerahan BKP yang menurut ketentuan dibebaskan dari pengenaan PPN |

---

### 1.5 SPT Masa PPN – Lampiran C (Daftar Penjualan)

#### Struktur XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<SPTMasaPPN>
  <Header>
    <NPWP>01.234.567.8-091.000</NPWP>
    <NamaWajibPajak>PT MAJU BERSAMA SEJAHTERA</NamaWajibPajak>
    <MasaPajak>03</MasaPajak>
    <TahunPajak>2026</TahunPajak>
    <Pembetulan>0</Pembetulan>
  </Header>
  <LampiranC>
    <DaftarPenjualan>
      <ItemPenjualan>
        <No>1</No>
        <NoFakturPajak>0100001234567890</NoFakturPajak>
        <TanggalFaktur>2026-03-01</TanggalFaktur>
        <NoInvoice>INV/2026/001</NoInvoice>
        <NPWPPembeli>02.345.678.9-092.000</NPWPPembeli>
        <NamaPembeli>CV SUKSES MAKMUR</NamaPembeli>
        <AlamatPembeli>Jl. Asia Afrika No. 15, Bandung</AlamatPembeli>
        <JenisDokumen>01</JenisDokumen>
        <JenisTransaksi>01</JenisTransaksi>
        <NilaiDPP>100000000</NilaiDPP>
        <NilaiPPN>11000000</NilaiPPN>
        <NilaiPPnBM>0</NilaiPPnBM>
        <Keterangan></Keterangan>
      </ItemPenjualan>
      <!-- ... item berikutnya ... -->
    </DaftarPenjualan>
  </LampiranC>
</SPTMasaPPN>
```

---

### 1.6 SPT Tahunan OP – Daftar Harta

#### Struktur XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<SPTTahunanOP>
  <Header>
    <NPWP>12.345.678.9-091.000</NPWP>
    <NamaWajibPajak>Siti Aminah</NamaWajibPajak>
    <TahunPajak>2025</TahunPajak>
    <Status>OP</Status>
  </Header>
  <DaftarHarta>
    <Harta>
      <NoUrut>1</NoUrut>
      <JenisHarta>A</JenisHarta>
      <KodeHarta>A1</KodeHarta>
      <NamaHarta>Tanah dan Bangunan di Jl. Kemang Raya No. 10</NamaHarta>
      <TahunPerolehan>2018</TahunPerolehan>
      <AsalPerolehan>Pembelian</AsalPerolehan>
      <HargaPerolehan>2500000000</HargaPerolehan>
      <SaldoPinjaman>1500000000</SaldoPinjaman>
      <NilaiPasaran>3200000000</NilaiPasaran>
      <KodeNegara>IDN</KodeNegara>
      <KodeLokasi>3101</KodeLokasi>
      <Keterangan>Hak Milik, SHM</Keterangan>
    </Harta>
    <Harta>
      <NoUrut>2</NoUrut>
      <JenisHarta>B</JenisHarta>
      <KodeHarta>B1</KodeHarta>
      <NamaHarta>Rekening Tabungan BCA No. 1234567890</NamaHarta>
      <TahunPerolehan>2020</TahunPerolehan>
      <AsalPerolehan>Simpanan</AsalPerolehan>
      <HargaPerolehan>0</HargaPerolehan>
      <SaldoPinjaman>0</SaldoPinjaman>
      <NilaiPasaran>85000000</NilaiPasaran>
      <KodeNegara>IDN</KodeNegara>
      <KodeLokasi>3101</KodeLokasi>
      <Keterangan></Keterangan>
    </Harta>
    <!-- ... item berikutnya ... -->
  </DaftarHarta>
</SPTTahunanOP>
```

#### Jenis Harta (Enumerasi)

| Kode | Kategori |
|------|----------|
| A | Tanah dan Bangunan |
| B | Alat Transportasi |
| C | Harta Bergerak Lainnya |
| D | Investasi |
| E | Kas dan Setara Kas |
| F | Harta Lainnya |

#### Sub-Jenis Harta

| Kode | Sub-Kategori |
|------|-------------|
| A1 | Tanah |
| A2 | Bangunan permanen |
| A3 | Bangunan tidak permanen |
| A4 | Apartemen/Condminium |
| A5 | Tanah dan Bangunan sebagai satu kesatuan |
| B1 | Kendaraan bermotor (roda 2/3/4+) |
| B2 | Kapal |
| B3 | Pesawat |
| C1 | Mesin dan Peralatan |
| C2 | Perhiasan |
| C3 | Barang-barang mewah |
| C4 | Perlengkapan rumah tangga |
| C5 | Harta bergerak lainnya |
| D1 | Saham |
| D2 | Obligasi/Surat hutang |
| D3 | Reksa dana |
| D4 | Penyertaan modal |
| D5 | Unit Penyertaan Kontrak Investasi Kolektif |
| D6 | Kontrak Derivatif |
| D7 | Kontrak Penempatan Dana di bank |
| E1 | Uang tunai |
| E2 | Deposito |
| E3 | Tabungan |
| E4 | Girotanpa bilyet |
| E5 | Setara kas lainnya |
| F1 | Hak cipta |
| F2 | Hak penemuan |
| F3 | Hak usaha franchise |
| F4 | Piutang |
| F5 | Harta bawaan |
| F6 | Harta lainnya |

---

## 2. TECH STACK SPESIFIKASI TERKINI

### 2.1 Next.js 16

**Versi terkini:** 16.2 (dirilis Maret 2026)

**Fitur Utama:**

| Fitur | Keterangan |
|-------|------------|
| **Cache Components** | Model caching baru menggunakan Partial Pre-Rendering (PPR) dan `use cache` directive |
| **Turbopack Stabil** | 10× lebih cepat HMR, 4× lebih cepat build produksi, 400% lebih cepat `next dev` startup (v16.2) |
| **Server Components (RSC)** | Mengurangi JavaScript klien hingga 70%, render sepenuhnya di server |
| **`proxy.ts`** | Menggantikan middleware untuk handling request |
| **Next.js Devtools MCP** | Integrasi Model Context Protocol untuk debugging |
| **Server Function Logging** | Logging di terminal dev untuk Server Function execution |
| **Hydration Diff Indicator** | Diff visual server/client di error overlay |

**Pattern untuk Coretax XML Converter:**

```typescript
// app/layout.tsx - Root Layout (Server Component)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

// app/(converter)/page.tsx - Server Component
import { ConverterWizard } from './converter-wizard'; // Client Component

export default async function ConverterPage() {
  const templates = await fetchTemplates(); // Server-side data fetching
  
  return (
    <main>
      <ConverterWizard templates={templates} />
    </main>
  );
}

// app/(converter)/converter-wizard.tsx - Client Component  
'use client';
import { motion } from 'framer-motion';

export function ConverterWizard({ templates }) {
  // Client-side interaksi: wizard, drag-drop, dll
}
```

**Best Practices:**
- Gunakan Server Components sebanyak mungkin, hanya gunakan `'use client'` untuk komponen interaktif
- Streaming untuk halaman berat: `loading.tsx` + Suspense
- Gunakan `use cache` untuk data yang jarang berubah (daftar KPP, kode pajak)
- Error boundary terpisah per section wizard

---

### 2.2 SheetJS (xlsx)

**Versi:** 0.20.3 (Community Edition, dari CDN `cdn.sheetjs.com`)
**Versi NPM:** 0.18.5 (terakhir npm publish, tapi versi terbaru ada di git.sheetjs.com)

**API Penting untuk Coretax Converter:**

```typescript
import * as XLSX from 'xlsx';

// === PARSING FILE EXCEL ===
async function parseExcelFile(file: File): Promise<XLSX.WorkBook> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,        // Otomatis konversi ke Date
    cellNF: true,           // Simpan format number asli
    cellText: false,        // Jangan konversi ke text
    raw: true,              // Raw values
    sheetRows: 100000,      // Batas baris (performa)
    codepage: 65001,        // UTF-8
  });
  return workbook;
}

// === BACA SHEET MENJADI ARRAY OF OBJECTS ===
function sheetToJson<T>(workbook: XLSX.WorkBook, sheetName: string): T[] {
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<T>(sheet, {
    defval: '',             // Default value untuk cell kosong
    blankrows: false,       // Skip baris kosong
    rawNumbers: true,       // Numbers tetap number (bukan string)
    header: 1,              // Baris pertama = header
  });
}

// === MENULIS FILE EXCEL (TEMPLATE) ===
function writeTemplate(data: any[], sheetName: string = 'Data'): Blob {
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Atur lebar kolom
  ws['!cols'] = [
    { wch: 5 },   // No
    { wch: 25 },  // NPWP
    { wch: 50 },  // Nama
    { wch: 20 },  // Jumlah
  ];
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Generate sebagai Blob untuk download
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}
```

**Tips Performa untuk File Besar:**
- Gunakan `sheetRows` untuk membatasi pembacaan awal
- Streaming: baca chunk per chunk dengan `XLSX.utils.sheet_to_json(sheet, { range: start })`
- Untuk file >10MB, pertimbangkan Web Worker untuk parsing agar UI tidak freeze
- Gunakan `XLSX.read(data, { type: 'stream' })` untuk Node.js streaming

---

### 2.3 TanStack Table v8

**Versi terkini:** v8.x

**Konfigurasi Data Grid Editable untuk Coretax Converter:**

```typescript
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

interface PegawaiRow {
  no: number;
  npwp: string;
  nama: string;
  nik: string;
  statusPtkp: string;
  gaji: number;
  tunjangan: number;
  pphDipotong: number;
}

const columnHelper = createColumnHelper<PegawaiRow>();

function createColumns() {
  return [
    columnHelper.accessor('no', {
      header: 'No',
      size: 50,
    }),
    columnHelper.accessor('npwp', {
      header: 'NPWP',
      size: 180,
      cell: ({ getValue }) => (
        <input 
          value={getValue()} 
          className="font-mono text-sm border rounded px-2 py-1 w-full"
          onChange={(e) => console.log('edit NPWP')}
        />
      ),
    }),
    columnHelper.accessor('nama', {
      header: 'Nama Karyawan',
      size: 200,
    }),
    columnHelper.accessor('statusPtkp', {
      header: 'Status PTKP',
      size: 100,
      cell: ({ getValue, row }) => (
        <select 
          value={getValue()}
          className="border rounded px-2 py-1 w-full"
          onChange={(e) => {
            // Update status PTKP dan hitung ulang
            console.log('Status changed:', e.target.value);
          }}
        >
          <option value="TK/0">TK/0</option>
          <option value="TK/1">TK/1</option>
          <option value="K/0">K/0</option>
          <option value="K/1">K/1</option>
          <option value="K/2">K/2</option>
          <option value="K/3">K/3</option>
        </select>
      ),
    }),
    columnHelper.accessor('gaji', {
      header: 'Gaji',
      size: 150,
      cell: ({ getValue }) => (
        <input 
          type="number"
          value={getValue()} 
          className="text-right font-mono border rounded px-2 py-1 w-full"
        />
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <button 
          onClick={() => console.log('Delete row:', row.index)}
          className="text-red-500 hover:text-red-700"
        >
          Hapus
        </button>
      ),
    }),
  ];
}

function DataGridPegawai({ data }: { data: PegawaiRow[] }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  const columns = useMemo(() => createColumns(), []);
  
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageSize: 50,
  });
  
  return (
    <div>
      {/* Search */}
      <input 
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Cari data..."
        className="mb-4 border rounded px-3 py-2 w-full"
      />
      
      {/* Table */}
      <div className="overflow-auto max-h-[500px]">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-gray-100">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    className="border px-2 py-1 text-left cursor-pointer"
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] || ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-yellow-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="border px-2 py-1">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span>
          Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
        </span>
        <div className="space-x-2">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Sebelumnya
          </button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Fitur Penting TanStack Table v8:**
- **Virtual Scrolling** – via `@tanstack/react-virtual` untuk 10K+ baris
- **Editable Cells** – pattern: controlled state + `meta` update
- **Row Selection** – checkbox untuk operasi batch
- **Column Resizing** – drag handle pada header
- **Custom Features** – ekstensi melalui plugin system

---

### 2.4 Framer Motion

**Versi terkini:** 12.23.0 (package: `motion` atau `framer-motion`)

**Pattern Animasi untuk Wizard Converter:**

```typescript
import { motion, AnimatePresence } from 'motion/react';

// === TRANSISI HALAMAN WIZARD ===
const pageVariants = {
  initial: { opacity: 0, x: 50 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -50 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

function WizardStep({ step, isActive }: { step: number; isActive: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={`step-${step}`}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {/* Konten step */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// === PROGRESS BAR ANIMASI ===
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-blue-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </div>
  );
}

// === NOTIFIKASI TOAST ===
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      } text-white`}
    >
      {message}
    </motion.div>
  );
}

// === LAYOUT ANIMATION UNTUK DRAG & DROP ===
function DragHandle({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
    >
      {children}
    </motion.div>
  );
}

// === MODAL DENGAN ANIMASI MULUS ===
function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl p-6 shadow-2xl max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Best Practices Framer Motion:**
- Gunakan `AnimatePresence` dengan `mode="wait"` untuk transisi halaman
- Hindari animasi pada elemen yang sering berubah (data grid dengan 10K+ baris)
- Gunakan `layoutId` untuk shared element transitions
- `whileHover` dan `whileTap` cukup untuk micro-interactions
- Pastikan `prefers-reduced-motion` dihormati via `useReducedMotion()`

---

### 2.5 Zustand

**Pattern Store untuk Wizard State Kompleks:**

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// === TIPE DATA ===
type JenisBupot = 'BPMP' | 'BPPU' | 'BPBU' | 'BPA1';
type WizardStep = 'upload' | 'mapping' | 'edit' | 'preview' | 'download';

interface PegawaiData {
  no: number;
  npwp: string;
  nik: string;
  nama: string;
  statusPtkp: string;
  jumlahTanggungan: number;
  jabatan: string;
  gajiPensiun: number;
  tunjanganPph: number;
  tunjanganLainnya: number;
  honorarium: number;
  premiAsuransi: number;
  iuranPensiun: number;
  // Hasil kalkulasi
  penghasilanBruto: number;
  biayaJabatan: number;
  penghasilanNeto: number;
  ptkp: number;
  pphDipotong: number;
  pphDitanggung: number;
  errors: Record<string, string>;
}

interface ConverterState {
  // Wizard
  currentStep: WizardStep;
  jenisDokumen: JenisBupot | 'FAKTUR' | 'SPT_PPN' | 'SPT_TAHUNAN';
  stepsCompleted: Record<WizardStep, boolean>;
  
  // Data
  headerData: Record<string, string>;
  detailData: PegawaiData[];
  xmlOutput: string;
  
  // Validation
  errors: Record<string, string[]>;
  isValid: boolean;
  
  // Actions
  setStep: (step: WizardStep) => void;
  setJenisDokumen: (jenis: ConverterState['jenisDokumen']) => void;
  setHeaderData: (data: Record<string, string>) => void;
  setDetailData: (data: PegawaiData[]) => void;
  updateDetailRow: (index: number, row: Partial<PegawaiData>) => void;
  deleteDetailRow: (index: number) => void;
  addDetailRow: (row: PegawaiData) => void;
  recalculate: () => void;
  generateXML: () => void;
  validateAll: () => boolean;
  reset: () => void;
}

// === STORE ===
export const useConverterStore = create<ConverterState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        currentStep: 'upload',
        jenisDokumen: 'BPMP',
        stepsCompleted: {
          upload: false,
          mapping: false,
          edit: false,
          preview: false,
          download: false,
        },
        headerData: {},
        detailData: [],
        xmlOutput: '',
        errors: {},
        isValid: false,
        
        // Actions
        setStep: (step) => set({ currentStep: step }),
        
        setJenisDokumen: (jenis) => set({ jenisDokumen: jenis }),
        
        setHeaderData: (data) => set({ headerData: data }),
        
        setDetailData: (data) => set({ detailData: data }),
        
        updateDetailRow: (index, row) => set((state) => {
          const newData = [...state.detailData];
          newData[index] = { ...newData[index], ...row };
          return { detailData: newData };
        }),
        
        deleteDetailRow: (index) => set((state) => ({
          detailData: state.detailData.filter((_, i) => i !== index),
        })),
        
        addDetailRow: (row) => set((state) => ({
          detailData: [...state.detailData, row],
        })),
        
        recalculate: () => set((state) => {
          const newData = state.detailData.map(row => {
            const bruto = row.gajiPensiun + row.tunjanganPph + row.tunjanganLainnya 
              + row.honorarium + row.premiAsuransi + row.iuranPensiun;
            const biayaJabatan = Math.min(bruto * 0.05, 500000);
            const neto = bruto - biayaJabatan;
            const ptkp = getPTKPValue(row.statusPtkp);
            const pkp = Math.max(0, 12 * neto - ptkp);
            const pphSetahun = hitungPPhProgressif(pkp);
            const pphBulanan = Math.round(pphSetahun / 12);
            
            return {
              ...row,
              penghasilanBruto: bruto,
              biayaJabatan,
              penghasilanNeto: neto,
              ptkp,
              pphDipotong: pphBulanan,
            };
          });
          return { detailData: newData };
        }),
        
        generateXML: () => {
          const state = get();
          const xml = buildXML(state.jenisDokumen, state.headerData, state.detailData);
          set({ xmlOutput: xml });
        },
        
        validateAll: () => {
          const state = get();
          const errors: Record<string, string[]> = {};
          let valid = true;
          
          // Validasi header
          if (!state.headerData.npwpPemotong) {
            errors.header = [...(errors.header || []), 'NPWP Pemotong wajib diisi'];
            valid = false;
          }
          
          // Validasi detail
          state.detailData.forEach((row, i) => {
            const rowErrors: string[] = [];
            if (!validateNPWP(row.npwp)) rowErrors.push('NPWP tidak valid');
            if (!row.npwp.match(/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/)) 
              rowErrors.push('Format NPWP salah (XX.XXX.XXX.X-XXX.XXX)');
            if (!row.nama) rowErrors.push('Nama wajib diisi');
            if (!row.nik || row.nik.length !== 16) rowErrors.push('NIK harus 16 digit');
            
            if (rowErrors.length > 0) {
              errors[`row_${i}`] = rowErrors;
              valid = false;
            }
          });
          
          set({ errors, isValid: valid });
          return valid;
        },
        
        reset: () => set({
          currentStep: 'upload',
          headerData: {},
          detailData: [],
          xmlOutput: '',
          errors: {},
          isValid: false,
          stepsCompleted: {
            upload: false, mapping: false, edit: false, 
            preview: false, download: false,
          },
        }),
      }),
      { name: 'coretax-converter-storage' }
    ),
    { name: 'Coretax Converter' }
  )
);
```

---

## 3. ALGORITMA VALIDASI NPWP

### 3.1 Format NPWP

**Format Lama (15 digit):**
```
XX.XXX.XXX.X-XXX.XXX

Digit 1-2   : Kode jenis WP (00-99)
Digit 3-8   : Nomor identifikasi WP
Digit 9     : Digit check (Luhn algorithm pada 8 digit pertama)
Digit 10-12 : Kode KPP
Digit 13-15 : Kode cabang (000 = pusat)
```

**Format Baru (16 digit, sejak 2022):**
```
0XX.XXX.XXX.X-XXX.XXX  (NPWP Badan/PN yang ditambah prefix 0)

ATAU

XXXXXXXXXXXXXXXX        (16 digit NIK untuk WNI)
```

### 3.2 Algoritma Check Digit (Luhn)

Berdasarkan kode sumber `python-stdnum` (libraries standar internasional):

```typescript
/**
 * Validasi NPWP Indonesia
 * Berdasarkan algoritma dari python-stdnum stdnum.id.npwp
 * 
 * Format 15 digit: Luhn check pada 9 digit pertama
 * Format 16 digit (dimulai 0): Luhn check pada 10 digit pertama
 * Format 16 digit (tidak dimulai 0): Validasi sebagai NIK
 */
import { luhn } from './luhn-utils';

function compact(npwp: string): string {
  return npwp.replace(/[\s.\-]/g, '').trim();
}

function validateNPWP(npwp: string): { valid: boolean; error?: string; formatted?: string } {
  const cleaned = compact(npwp);
  
  // Cek apakah semua digit
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'NPWP hanya boleh berisi angka' };
  }
  
  if (cleaned.length === 15) {
    // Format lama 15 digit
    if (!luhnValidate(cleaned.substring(0, 9))) {
      return { valid: false, error: 'Digit check NPWP 15 digit tidak valid' };
    }
    return { 
      valid: true, 
      formatted: formatNPWP(cleaned) 
    };
  }
  
  if (cleaned.length === 16) {
    if (!cleaned.startsWith('0')) {
      // Format NIK (untuk WP OP WNI)
      return { 
        valid: validateNIK(cleaned), 
        error: validateNIK(cleaned) ? undefined : 'NIK tidak valid',
        formatted: cleaned 
      };
    }
    // Format baru 16 digit (prefix 0)
    if (!luhnValidate(cleaned.substring(0, 10))) {
      return { valid: false, error: 'Digit check NPWP 16 digit tidak valid' };
    }
    return { 
      valid: true, 
      formatted: formatNPWP(cleaned.substring(1)) // Format tampilkan tanpa leading 0
    };
  }
  
  return { valid: false, error: `Panjang NPWP harus 15 atau 16 digit, ditemukan ${cleaned.length}` };
}

function formatNPWP(npwp: string): string {
  const c = compact(npwp);
  if (c.length === 15) {
    return `${c.substring(0,2)}.${c.substring(2,5)}.${c.substring(5,8)}.${c.substring(8,9)}-${c.substring(9,12)}.${c.substring(12,15)}`;
  }
  if (c.length === 16 && c.startsWith('0')) {
    return formatNPWP(c.substring(1));
  }
  return c;
}

/**
 * Algoritma Luhn untuk validasi check digit
 */
function luhnValidate(number: string): boolean {
  let sum = 0;
  let alternate = false;
  
  for (let i = number.length - 1; i >= 0; i--) {
    let n = parseInt(number[i], 10);
    
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    
    sum += n;
    alternate = !alternate;
  }
  
  return sum % 10 === 0;
}

/**
 * Validasi NIK (Nomor Induk Kependudukan)
 * Format: 16 digit
 * Digit 1-6 : Kode wilayah (provinsi+kabupaten+kecamatan)
 * Digit 7-8 : Tanggal lahir (untuk wanita ditambah 40)
 * Digit 9-10 : Bulan lahir
 * Digit 11-12 : Tahun lahir (2 digit terakhir)
 * Digit 13-16 : Nomor urut penduduk
 */
function validateNIK(nik: string): boolean {
  if (nik.length !== 16 || !/^\d+$/.test(nik)) return false;
  
  // Cek tanggal lahir valid
  const day = parseInt(nik.substring(6, 8), 10);
  const month = parseInt(nik.substring(8, 10), 10);
  
  if (day > 71 || day < 1) return false; // 1-31 (pria) atau 41-71 (wanita)
  if (month < 1 || month > 12) return false;
  
  return true;
}
```

### 3.3 Pola NPWP Berdasarkan Jenis WP

| Kode Awal (digit 1-2) | Jenis WP | Keterangan |
|----------------------|----------|------------|
| 01 | WP Badan | Perusahaan, CV, PT, dll |
| 02 | WP Badan | Perusahaan lainnya |
| 03 | WP Bendahara | Pemerintah/BUMN |
| 04 | WP Butuh Pajak | Khusus |
| 00-09 | WP Badan/PN | Umumnya Badan |
| 10-99 | WP OP | Umumnya Orang Pribadi |

### 3.4 NPWP Dummy yang Valid

```
00.000.000.0-000.000  → Untuk pembeli tanpa NPWP (faktur pajak)
01.312.166.0-091.000  → Contoh WP Badan
01.234.567.8-091.000  → Contoh WP Badan
```

---

## 4. BEST PRACTICES GENERASI XML

### 4.1 Browser DOM API Pattern

```typescript
/**
 * Generasi XML menggunakan Browser DOM API
 * Keuntungan: Built-in XML escaping, valid structure
 */
function generateBPMPXml(header: BPMPHeader, details: BPMPDetail[]): string {
  const doc = document.implementation.createDocument(
    'urn:djp:coretax:bpmp:v1', 
    'BPMP', 
    null
  );
  
  // === HEADER ===
  const headerEl = doc.createElement('Header');
  
  const appendChild = (parent: Element, tag: string, text: string | number) => {
    const el = doc.createElement(tag);
    el.textContent = String(text);
    parent.appendChild(el);
  };
  
  appendChild(headerEl, 'NPWPPemotong', header.npwpPemotong);
  appendChild(headerEl, 'NamaPemotong', header.namaPemotong);
  appendChild(headerEl, 'KPPMasa', header.kppMasa);
  appendChild(headerEl, 'MasaPajak', header.masaPajak);
  appendChild(headerEl, 'TahunPajak', header.tahunPajak);
  appendChild(headerEl, 'Pembetulan', header.pembetulan);
  appendChild(headerEl, 'JumlahPenerimaPenghasilan', details.length);
  appendChild(headerEl, 'TotalPPhDipotong', 
    details.reduce((sum, d) => sum + d.pphDipotong, 0)
  );
  
  doc.documentElement.appendChild(headerEl);
  
  // === DETAIL ===
  const detailEl = doc.createElement('Detail');
  
  details.forEach((item, index) => {
    const rowEl = doc.createElement('PenerimaPenghasilan');
    
    appendChild(rowEl, 'No', index + 1);
    appendChild(rowEl, 'NPWPPenerimaPenghasilan', item.npwp);
    appendChild(rowEl, 'NIK', item.nik);
    appendChild(rowEl, 'NamaPenerimaPenghasilan', item.nama);
    appendChild(rowEl, 'StatusPtkp', item.statusPtkp);
    appendChild(rowEl, 'JumlahTanggungan', item.jumlahTanggungan);
    appendChild(rowEl, 'Jabatan', item.jabatan);
    appendChild(rowEl, 'GajiPensiun', item.gajiPensiun);
    appendChild(rowEl, 'TunjanganPPH', item.tunjanganPph);
    appendChild(rowEl, 'TunjanganLainnya', item.tunjanganLainnya);
    appendChild(rowEl, 'Honorarium', item.honorarium);
    appendChild(rowEl, 'PremiAsuransi', item.premiAsuransi);
    appendChild(rowEl, 'IuranPensiun', item.iuranPensiun);
    appendChild(rowEl, 'PenghasilanBruto', item.penghasilanBruto);
    appendChild(rowEl, 'BiayaJabatan', item.biayaJabatan);
    appendChild(rowEl, 'PenghasilanNeto', item.penghasilanNeto);
    appendChild(rowEl, 'PTKP', item.ptkp);
    appendChild(rowEl, 'PKP', item.pkp);
    appendChild(rowEl, 'PPhDipotong', item.pphDipotong);
    
    detailEl.appendChild(rowEl);
  });
  
  doc.documentElement.appendChild(detailEl);
  
  // === SERIALIZE ===
  const serializer = new XMLSerializer();
  const xmlString = serializer.serializeToString(doc);
  
  // Pretty-print manual
  return formatXml(xmlString);
}

/**
 * Format XML dengan indentation
 */
function formatXml(xml: string, indent: string = '  '): string {
  const PADDING = ' '.repeat(indent.length);
  let formatted = '';
  let pad = 0;
  
  // Normalize line breaks
  xml = xml.replace(/(>)(<)(\/*)/g, '$1\n$2$3');
  
  xml.split('\n').forEach(node => {
    node = node.trim();
    if (!node) return;
    
    // Closing tag
    if (node.match(/^<\/\w/)) {
      pad = Math.max(0, pad - 1);
    }
    
    formatted += PADDING.repeat(pad) + node + '\n';
    
    // Opening tag
    if (node.match(/^<\w([^>]*[^/])?>.*$/) && !node.match(/^<\w+[^>]*\/>/)) {
      if (!node.startsWith('</')) {
        pad++;
      }
    }
  });
  
  // Add XML declaration
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + formatted.trim();
}
```

### 4.2 Performa untuk XML Besar (10K+ Baris)

```typescript
/**
 * Optimasi: Gunakan DocumentFragment untuk batch insert
 */
function generateLargeXml(rows: DataRow[]): string {
  const doc = document.implementation.createDocument(null, 'Root', null);
  const root = doc.documentElement;
  
  // Batch per 1000 baris agar tidak freeze UI
  const BATCH_SIZE = 1000;
  let i = 0;
  
  function processBatch() {
    const fragment = doc.createDocumentFragment();
    const end = Math.min(i + BATCH_SIZE, rows.length);
    
    for (; i < end; i++) {
      const rowEl = doc.createElement('Row');
      rowEl.textContent = JSON.stringify(rows[i]); // Simplified
      fragment.appendChild(rowEl);
    }
    
    root.appendChild(fragment);
    
    if (i < rows.length) {
      // Yield ke event loop agar UI tetap responsif
      requestAnimationFrame(processBatch);
    }
  }
  
  processBatch();
  
  return new XMLSerializer().serializeToString(doc);
}

/**
 * Alternatif: Web Worker untuk XML generation (tidak blocking UI)
 */
// worker.ts
self.onmessage = function(e: MessageEvent) {
  const { headerData, detailData, jenisDokumen } = e.data;
  
  // Generate XML di worker thread
  const xml = buildXmlString(jenisDokumen, headerData, detailData);
  
  self.postMessage({ xml });
};

// main.ts
function generateXmlInBackground(data: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url));
    worker.onmessage = (e) => resolve(e.data.xml);
    worker.onerror = reject;
    worker.postMessage(data);
  });
}
```

### 4.3 XML Escaping yang Tepat

Browser DOM API (`createElement` + `textContent`) **otomatis** melakukan XML escaping. Namun jika menggunakan string concatenation:

```typescript
/**
 * Manual XML escaping (jika tidak menggunakan DOM API)
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Contoh masalah tanpa escaping:
 * Nama: PT "Budi & Jaya" <Surabaya>
 * 
 * SALAH: <Nama>PT "Budi & Jaya" <Surabaya></Nama>
 * BENAR: <Nama>PT &quot;Budi &amp; Jaya&quot; &lt;Surabaya&gt;</Nama>
 * 
 * Rekomendasi: SELALU gunakan DOM API, jangan string concatenation
 */
```

### 4.4 XSD Validation di Browser

```typescript
/**
 * Validasi XML terhadap XSD Schema
 * Menggunakan DOMParser + XMLSerializer
 * Catatan: Browser TIDAK mendukung XSD validation native.
 * Gunakan library xml-validator atau validasi manual.
 */
async function validateXml(xmlString: string, xsdUrl: string): Promise<ValidationResult> {
  // Opsi 1: Gunakan library (xmllint WASM)
  // Opsi 2: Validasi manual dengan regex/structural checks
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  
  const errors: string[] = [];
  
  // Cek parsing error
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    errors.push(parseError.textContent || 'XML parsing error');
  }
  
  // Validasi structural
  const root = doc.documentElement;
  if (!root) errors.push('Root element tidak ditemukan');
  
  const header = root.querySelector('Header');
  if (!header) errors.push('Header element wajib tidak ditemukan');
  
  // Validasi NPWP di semua field NPWP
  const npwpFields = root.querySelectorAll('[NPWP], [npwp]');
  npwpFields.forEach(field => {
    const value = field.textContent || '';
    if (!validateNPWP(value).valid) {
      errors.push(`NPWP tidak valid: ${value}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
```

---

## 5. REKOMENDASI IMPLEMENTASI

### 5.1 Pemetaan Template → Struktur XML

| Template Aplikasi | Jenis Dokumen | Root Element | Kalkulasi |
|-------------------|---------------|--------------|-----------|
| Bukti Potong PPh 21 Pegawai Tetap | BPMP | `<BPMP>` | Gross-up, PTKP, tarif progresif |
| Bukti Potong PPh 21 Bukan Pegawai | BPBU | `<BPBU>` | Gross-up sederhana |
| Bukti Potong PPh Final | BPPU | `<BPPU>` | Tarif flat (sesuai jenis) |
| Bukti Potong A1 WP Luar Negeri | BPA1 | `<BPA1>` | PPh 26 = 20% dari bruto |
| Faktur Pajak Keluaran | FK | `<FakturPajak>` | DPP × 11% (PPN) |
| SPT Masa PPN Lampiran C | SPT_PPN | `<SPTMasaPPN>` | Agregasi dari Faktur |
| SPT Masa PPh 21/26 | SPT_MASA | `<SPTMasaPPh>` | Agregasi dari Bupot |
| SPT Tahunan OP Daftar Harta | SPT_THN_OP | `<SPTTahunanOP>` | Hanya input |
| SPT Tahunan Badan Daftar Harta | SPT_THN_BADAN | `<SPTTahunanBadan>` | Hanya input |

### 5.2 Field yang Perlu Penanganan Khusus

| Field | Penanganan Khusus |
|-------|------------------|
| **NPWP** | Validasi format + Luhn check + format display |
| **NIK** | Validasi 16 digit + cek tanggal lahir |
| **StatusPTKP** | Dropdown enumerasi, pengaruh ke PTKP |
| **Tanggal** | Format YYYY-MM-DD, parsing dari berbagai input |
| **Jumlah Uang** | Parsing "Rp 1.250.000" → 1250000, simpan tanpa separator |
| **NPWP 000** | Untuk pembeli tanpa NPWP di faktur pajak |
| **MasaPajak** | Validasi 01-12 |
| **KodeNegara** | Enumerasi ISO 3166-1 alpha-3 |
| **KodeKPP** | 3 digit, referensi tabel KPP DJP |

### 5.3 Template yang Memerlukan Logika Kalkulasi

#### BPMP (PPh 21 Pegawai Tetap) – KALKULASI PALING KOMPLEKS

```typescript
/**
 * Fungsi kalkulasi PPh 21 lengkap
 */
function hitungPPh21(params: {
  penghasilanBruto: number;
  biayaJabatan: number;
  iuranPensiunDitanggung: number;
  ptkpSetahun: number;
  ptkpPerBulan: number;
}): number {
  const netoSetahun = (params.penghasilanBruto - params.biayaJabatan - params.iuranPensiunDitanggung) * 12;
  const pkp = Math.max(0, netoSetahun - params.ptkpSetahun);
  return hitungPPhProgressif(pkp) / 12;
}

/**
 * Tarif PPh Pasal 21 progresif (PTKP 2024-2026)
 */
function hitungPPhProgressif(pkp: number): number {
  const brackets = [
    { limit: 60_000_000, rate: 0.05 },
    { limit: 250_000_000, rate: 0.15 },
    { limit: 500_000_000, rate: 0.25 },
    { limit: 5_000_000_000, rate: 0.30 },
    { limit: Infinity, rate: 0.35 },
  ];
  
  let tax = 0;
  let prevLimit = 0;
  
  for (const bracket of brackets) {
    if (pkp <= prevLimit) break;
    const taxableInBracket = Math.min(pkp, bracket.limit) - prevLimit;
    tax += taxableInBracket * bracket.rate;
    prevLimit = bracket.limit;
  }
  
  return Math.round(tax);
}
```

#### Gross-Up PPh 21

```typescript
/**
 * Kalkulasi gross-up (menghitung bruto dari netto yang diinginkan)
 * Digunakan ketika pemberi kerja menanggung seluruh PPh
 */
function hitungGrossUp(nettoYangDiinginkan: number, ptkpSetahun: number, iuranPensiun: number): {
  bruto: number;
  pphDipotong: number;
  pphDitanggung: number;
} {
  // Iterasi sampai konvergen (biasanya 5-10 iterasi cukup)
  let bruto = nettoYangDiinginkan;
  
  for (let i = 0; i < 20; i++) {
    const biayaJabatan = Math.min(bruto * 0.05, 500000);
    const neto = bruto - biayaJabatan - iuranPensiun;
    const pkp = Math.max(0, neto * 12 - ptkpSetahun);
    const pphPerBulan = hitungPPhProgressif(pkp) / 12;
    const nettoBaru = bruto - pphPerBulan;
    
    if (Math.abs(nettoBaru - nettoYangDiinginkan) < 1) break;
    
    bruto = nettoYangDiinginkan + pphPerBulan;
  }
  
  const biayaJabatan = Math.min(bruto * 0.05, 500000);
  const neto = bruto - biayaJabatan - iuranPensiun;
  const pkp = Math.max(0, neto * 12 - ptkpSetahun);
  const pphSetahun = hitungPPhProgressif(pkp);
  const pphPerBulan = Math.round(pphSetahun / 12);
  
  return {
    bruto: Math.round(bruto),
    pphDipotong: 0,
    pphDitanggung: pphPerBulan,
  };
}
```

### 5.4 Error Handling dan Edge Cases

```typescript
/**
 * Validasi komprehensif untuk impor data
 */
interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

function validateImportData(data: any[][]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  data.forEach((row, index) => {
    // Skip header row
    if (index === 0) return;
    
    const npwp = String(row[1] || '').trim();
    
    // Validasi NPWP
    if (!npwp) {
      errors.push({ row: index, field: 'NPWP', message: 'NPWP wajib diisi', severity: 'error' });
    } else {
      const validation = validateNPWP(npwp);
      if (!validation.valid) {
        errors.push({ 
          row: index, field: 'NPWP', 
          message: `NPWP tidak valid: ${validation.error}`, 
          severity: 'error' 
        });
      }
    }
    
    // Validasi nama
    const nama = String(row[2] || '').trim();
    if (!nama) {
      errors.push({ row: index, field: 'Nama', message: 'Nama wajib diisi', severity: 'error' });
    } else if (nama.length > 100) {
      errors.push({ row: index, field: 'Nama', message: 'Nama maksimal 100 karakter', severity: 'warning' });
    }
    
    // Validasi jumlah (harus angka positif)
    const gaji = Number(row[5]);
    if (isNaN(gaji) || gaji < 0) {
      errors.push({ row: index, field: 'Gaji', message: 'Gaji harus berupa angka positif', severity: 'error' });
    } else if (gaji > 10_000_000_000) {
      errors.push({ row: index, field: 'Gaji', message: 'Gaji melebihi batas wajar', severity: 'warning' });
    }
    
    // Cek duplikasi NPWP dalam satu file
    const duplicateNpwp = data.some((otherRow, otherIndex) => 
      otherIndex > index && String(otherRow[1]).trim() === npwp
    );
    if (duplicateNpwp) {
      errors.push({ row: index, field: 'NPWP', message: 'NPWP duplikat dalam satu file', severity: 'error' });
    }
  });
  
  return errors;
}
```

### 5.5 Arsitektur Rekomendasi

```
app/
├── (converter)/
│   ├── layout.tsx              # Layout converter (Server Component)
│   ├── page.tsx                # Landing page pilih template
│   ├── [templateId]/
│   │   ├── page.tsx            # Wizard page (Server Component wrapper)
│   │   ├── wizard.tsx          # Client Component - Wizard controller
│   │   ├── steps/
│   │   │   ├── UploadStep.tsx    # Step 1: Upload Excel
│   │   │   ├── MappingStep.tsx   # Step 2: Mapping kolom
│   │   │   ├── EditStep.tsx      # Step 3: Edit/validasi data
│   │   │   ├── PreviewStep.tsx   # Step 4: Preview XML
│   │   │   └── DownloadStep.tsx  # Step 5: Download XML
│   │   └── components/
│   │       ├── DataTable.tsx     # TanStack Table editable
│   │       ├── XmlPreview.tsx    # XML viewer dengan syntax highlighting
│   │       ├── ValidationPanel.tsx # Panel error/warning
│   │       └── NPWPInput.tsx     # Input NPWP dengan auto-format
├── lib/
│   ├── xml/
│   │   ├── generators/
│   │   │   ├── bpmp.generator.ts
│   │   │   ├── bppu.generator.ts
│   │   │   ├── bpbu.generator.ts
│   │   │   ├── bpa1.generator.ts
│   │   │   ├── faktur.generator.ts
│   │   │   ├── spt-ppn.generator.ts
│   │   │   └── spt-tahunan.generator.ts
│   │   └── xml-utils.ts        # Helper XML (format, escape, dll)
│   ├── validation/
│   │   ├── npwp.ts             # Validasi NPWP + NIK
│   │   ├── data.ts             # Validasi data per template
│   │   └── xml.ts              # Validasi XML output
│   ├── calculations/
│   │   ├── pph21.ts            # Kalkulasi PPh 21 (progressif, gross-up)
│   │   ├── pph-final.ts        # Kalkulasi PPh Final
│   │   ├── pph26.ts            # Kalkulasi PPh 26 (WP LN)
│   │   └── ppn.ts              # Kalkulasi PPN
│   ├── excel/
│   │   ├── parser.ts           # Parsing Excel → JSON
│   │   ├── templates.ts        # Template Excel per jenis
│   │   └── writer.ts           # Menulis template Excel
│   ├── constants/
│   │   ├── ptkp.ts             # Tarif PTKP
│   │   ├── jenis-transaksi.ts  # Enumerasi jenis transaksi
│   │   ├── jenis-harta.ts      # Enumerasi jenis harta
│   │   └── kode-kpp.ts         # Referensi kode KPP
│   └── store/
│       └── converter-store.ts  # Zustand store
```

### 5.6 Prioritas Implementasi

| Prioritas | Template | Alasan |
|-----------|----------|--------|
| 🔴 P1 | BPMP (PPh 21 Pegawai Tetap) | Paling banyak digunakan, kalkulasi kompleks |
| 🔴 P1 | Faktur Pajak Keluaran | Volume tinggi, wajib PKP |
| 🟡 P2 | BPBU (PPh 21 Bukan Pegawai) | Sering digunakan, kalkulasi sederhana |
| 🟡 P2 | BPPU (PPh Final) | Beragam jenis transaksi |
| 🟢 P3 | SPT Masa PPN Lampiran C | Agregasi dari faktur |
| 🟢 P3 | SPT Masa PPh 21/26 | Agregasi dari bupot |
| 🔵 P4 | BPA1 (WP Luar Negeri) | Volume rendah |
| 🔵 P4 | SPT Tahunan OP/Badan Harta | Pelaporan tahunan |

---

## REFERENSI SUMBER RISET

| Sumber | URL | Tanggal Akses |
|--------|-----|---------------|
| Pajakku - Perubahan Format XML Coretax | `pajakku.com/simak-perubahan-format-pelaporan-pajak-dengan-xml` | Apr 2026 |
| Ortax - Template XML Coretax | `ortax.org/persiapan-coretax-djp-rilis-template-file-xml` | Apr 2026 |
| DoyanDuit - Impor XML Coretax 2026 | `doyanduit.com/news/cara-impor-xml-coretax-djp-2026` | Apr 2026 |
| MIB - Template XML SPT Tahunan 2026 | `mib.group/id/news/djp-rilis-template-format-xml` | Apr 2026 |
| DJP Resmi - Template XML | `pajak.go.id/reformdjp/coretax/template-xml` | Apr 2026 |
| python-stdnum NPWP | `arthurdejong.org/python-stdnum/doc/1.20/stdnum.id.npwp` | Apr 2026 |
| OECD Indonesia TIN | `oecd.org/.../indonesia-tin.pdf` | Apr 2026 |
| Next.js 16 Blog | `nextjs.org/blog/next-16` | Apr 2026 |
| SheetJS Docs | `docs.sheetjs.com/docs` | Apr 2026 |
| TanStack Table v8 | `tanstack.com/table/v8` | Apr 2026 |
| Framer Motion Docs | `framer.com/motion` | Apr 2026 |

---

*Dokumen ini dikompilasi dari riset EXA AI pada April 2026. Spesifikasi XML Coretax DJP bersifat dinamis dan dapat berubah. Selalu merujuk ke sumber resmi DJP untuk versi terbaru.*
