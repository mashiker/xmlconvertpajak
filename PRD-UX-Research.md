# UX Research & Improvement Recommendations
## XML Converter Coretax DJP — Supplement PRD v1.1

**Tanggal:** 1 April 2026  
**Status:** Research selesai, rekomendasi siap implementasi  

---

## 1. Problem Statement: User Journey Saat Ini

### 1.1 Flow Saat Ini (Fragmented & Painful)

```
Step 1: Download Excel converter dari pajak.go.id (34+ file berbeda!)
Step 2: Buka file Excel yang sesuai (misal BPMP_Excel_to_XML.xlsx)
Step 3: Aktifkan Developer Tab di Excel (banyak user gak tau cara)
Step 4: Isi data di sheet "DATA"
Step 5: Cek sheet "REF" buat referensi (kode KOP, PTKP, dll) — manual switching
Step 6: Klik Developer → Export → Save as XML
Step 7: Buka Coretax → Login → Pilih menu eBupot/eFaktur
Step 8: Klik Import → Browse → Upload file XML
Step 9: Kalau error (70% kasus!), baca pesan error yang ambigu
Step 10: Kembali ke Step 4, fix data, repeat dari awal
```

**Total steps: 10 | Total context switching: 4x (Browser → Excel → Export → Coretax)**

### 1.2 Pain Points yang Teridentifikasi

| # | Pain Point | Sumber | Severity |
|---|-----------|--------|----------|
| 1 | **70% upload XML gagal** karena format/isi salah | doyanduit.com, diskusipajak.com | 🔴 Critical |
| 2 | File Excel terpisah per template — 34+ file berbeda | pajak.go.id | 🔴 Critical |
| 3 | Harus aktifkan Developer Tab di Excel — user awam bingung | diskusipajak.com | 🟡 High |
| 4 | Error message di Coretax generik & tidak helpful | pajak.go.id (Sidrap case) | 🟡 High |
| 5 | Tidak ada inline validation di Excel — error baru ketahuan setelah upload | Research Flatfile/CSVBox | 🟡 High |
| 6 | Copy-paste dari sistem lain (ERP, payroll) ke Excel sering format beda | CSVBox blog, real user pain | 🟠 Medium |
| 7 | Tidak bisa save draft/resume — harus sekaligus | Flatfile best practice | 🟠 Medium |
| 8 | Tidak ada tool terpusat — user harus cari-cari template sendiri | Competitive gap analysis | 🔴 Critical |

---

## 2. Competitor & Market Analysis

### 2.1 Existing Solutions

| Tool | Cara Kerja | Kelebihan | Kekurangan |
|------|-----------|-----------|------------|
| **DJP Excel Converter** | Download Excel → isi → export XML | Resmi dari DJP, gratis | Fragmented, error-prone, butuh Developer Tab, 34+ file |
| **KlikPajak** | SaaS pelaporan pajak | GUI lengkap, integrasi Coretax | Berbayar, tidak ada XML converter tool |
| **DoyanDuit / AyoPajak** | Panduan tutorial | Edukasi bagus | Hanya artikel, tidak ada tool |
| **Flatfile / CSVBox** | Embeddable CSV import widget | Best-in-class import UX | Bukan untuk pajak Indonesia, berbayar |

### 2.2 Gap Analysis

**Tidak ada satupun tool yang:**
- Menyediakan all-in-one XML converter untuk semua template Coretax
- Berbasis web dengan inline editing spreadsheet-style
- Memiliki smart validation khusus perpajakan Indonesia (KOP, NPWP, PTKP, NITKU)
- 100% gratis dan privacy-first (client-side only)

**Ini blue ocean opportunity buat alatpajak.id.**

---

## 3. UX Best Practices (dari Research Flatfile/CSVBox)

### 3.1 Canonical Import Flow: `File → Map → Validate → Submit`

Ini adalah pattern yang terbukti paling efektif untuk data conversion tools (Flatfile, CSVBox, 2026):

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  UPLOAD  │ →  │   MAP    │ →  │ VALIDATE │ →  │  SUBMIT  │
│          │    │          │    │          │    │          │
│ CSV/Excel│    │ Auto-    │    │ Inline   │    │ Preview  │
│ drag &   │    │ detect   │    │ error    │    │ XML +    │
│ drop or  │    │ columns  │    │ highlight│    │ Download │
│ browse   │    │ + manual │    │ per cell │    │          │
│          │    │ override │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     ↑                               ↑                 │
     │         User can go back ─────┘                 │
     │              and fix at any step                │
     └────────────────────────────────────────────────┘
                     Start over if needed
```

**Key principles:**
1. **Setiap stage observable & reversible** — user bisa kembali ke step sebelumnya tanpa kehilangan data
2. **Better mapping → fewer validation errors** — invest di smart mapping
3. **Clearer validation → fewer manual fixes** — inline error yang actionable
4. **Progressive disclosure** — show one step at a time, reduce cognitive load

### 3.2 Column Mapping Best Practices

**Problem:** User punya CSV/Excel dengan header yang beda-beda:
- Customer A: `"NIK"`, Customer B: `"No KTP"`, Customer C: `"NPWP/NIK"`
- Format tanggal: `DD/MM/YYYY` vs `YYYY-MM-DD` vs `MM/DD/YYYY`

**Solution: AI-Assisted Column Mapping**
1. **Exact match** (case-insensitive): `"NIK"` → `CounterpartTin`
2. **Fuzzy match** (Levenshtein distance): `"No KTP"` → `CounterpartTin` (confidence: 0.7)
3. **Known aliases** (hardcoded): `"NPWP/NIK/TIN"`, `"NIK"`, `"No. KTP"` → `CounterpartTin`
4. **Manual override** — user bisa ubah mapping yang salah
5. **Confidence indicator** — warna hijau (high), kuning (medium), merah (no match)

### 3.3 Validation Best Practices

**From CSVBox research:**
- **Row-level AND cell-level validation** — highlight cell yang bermasalah
- **Actionable error messages** — bukan "Format tidak valid", tapi "NPWP harus 16 digit. Anda memasukkan 14 digit."
- **Fix before submit** — user bisa koreksi langsung di tabel sebelum generate XML
- **Real-time validation** — validasi saat user ketik/ubah value, bukan setelah klik "Submit"

---

## 4. Rekomendasi UX Improvement

### 4.1 Eliminasi Excel dari Workflow

**Visi:** User TIDAK PERLU lagi buka Excel. Semua dilakukan di web.

**Caranya:** Provide **spreadsheet-like web editor** yang:
- Look & feel seperti Excel/Google Sheets
- Inline editing — double-click cell untuk edit
- Copy-paste dari Excel/ERP langsung ke tabel (Ctrl+V)
- Keyboard navigation — Tab, Enter, Arrow keys
- Dropdown untuk field enum (KOP, PTKP, Fasilitas, dll) dengan search
- Auto-fill untuk field yang berulang (NPWP Pemotong, Masa Pajak, Tahun Pajak)

### 4.2 Smart Defaults & Auto-Populate

| Scenario | Behavior |
|----------|----------|
| NPWP Pemotong | Auto-fill dari Settings (disimpan di localStorage). User cukup set sekali |
| Masa Pajak | Default ke bulan sekarang |
| Tahun Pajak | Default ke tahun sekarang |
| NITKU | Auto-fill dari Settings |
| KOP selection | Saat pilih KOP, **auto-populate** Deemed & Rate berdasarkan REF table |
| PTKP | Dropdown dengan deskripsi (TK/0, K/1, dll) |
| Tanggal | Date picker, format YYYY-MM-DD otomatis |

### 4.3 Smart KOP Selection

Saat user pilih Kode Objek Pajak:
1. **Searchable dropdown** — ketik "pegawai tetap" → muncul `21-100-01`
2. **Tooltip on hover** — tampilkan nama lengkap: "21-100-01: Penghasilan yang diterima oleh Pegawai Tetap..."
3. **Auto-fill related fields** — setelah pilih KOP, auto-isi Deemed dan Rate dari REF table
4. **Grouped by category** — Bupot PPh 21, Bupot PPh 26, dll

```
┌─────────────────────────────────────┐
│ Kode Objek Pajak: [🔍 Search...  ] │
├─────────────────────────────────────┤
│ ▸ PPh 21 - Pegawai Tetap           │
│   21-100-01  Pegawai Tetap        │
│   21-100-02  Penerima Pensiun     │
│ ▸ PPh 21 - Tidak Tetap            │
│   21-100-35  Upah Bulanan  ← you  │
│   21-100-27  Upah Tidak Teratur   │
│ ▸ PPh 21 - Final/Tidak Final      │
│   21-100-07  Tenaga Ahli          │
│   ...                              │
├─────────────────────────────────────┤
│ Selected: 21-100-35                │
│ Deemed: 100% (auto)               │
│ Rate: TER (auto)                   │
└─────────────────────────────────────┘
```

### 4.4 Template Download — CSV Template (Bukan Excel)

User yang masih mau pakai Excel bisa:
1. Download **CSV template** dari website kita (sudah ada header yang benar)
2. Isi data di Excel/Google Sheets mereka
3. Upload CSV ke website kita → auto-map → validate → XML

**Keuntungan:** Header CSV kita standardized, jadi auto-mapping selalu 100% akurat.

### 4.5 Multi-Template Dashboard

```
┌─────────────────────────────────────────────────────┐
│  XML Converter — Dashboard                    [⚙]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📂 Bukti Potong PPh 21/26                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  │ BPMP   │ │ BP21   │ │ BP26   │ │ BPA1   │      │
│  │ Bulanan│ │ Final  │ │ WNA    │ │Annual  │      │
│  └────────┘ └────────┘ └────────┘ └────────┘      │
│                                                     │
│  📂 Faktur Pajak                                   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │Dok Keluaran│ │Dok Masukan │ │ Faktur     │      │
│  │            │ │            │ │ Keluaran   │      │
│  └────────────┘ └────────────┘ └────────────┘      │
│                                                     │
│  📂 SPT Masa                                        │
│  ┌────────┐ ┌────────┐                             │
│  │PPN     │ │Badan   │                             │
│  └────────┘ └────────┘                             │
│                                                     │
│  🔒 Semua data diproses lokal di browser Anda      │
└─────────────────────────────────────────────────────┘
```

### 4.6 Error Experience

**Saat ini (Coretax error):**
```
❌ "Data tidak valid" — user bingung mana yang salah
```

**Yang kita buat:**
```
┌─────┬──────────┬────────────┬──────────┬────────┐
│  #  │ NIK      │ Status PTKP│ KOP      │ Bruto  │
├─────┼──────────┼────────────┼──────────┼────────┤
│  1  │ 3275...  │ TK/0 ✓     │21-100-01│ 40M ✓ │
│  2  │ 3273🔴  │ K/2 ✓     │21-100-02│ 30M ✓ │
│     │⚠ 14 digit│           │         │       │
│     │ harus 16 │           │         │       │
│  3  │ 3175...  │ K/0 ✓     │21-100-32│ 20M ✓ │
└─────┴──────────┴────────────┴──────────┴────────┘
  3 rows • 1 error • Fix the highlighted cell to continue
```

**Features:**
- Cell-level error highlight (merah)
- Specific error message per cell (bukan generik)
- Row count: "3 rows, 1 error"
- Fix button → focus ke cell yang error
- Bulk fix: "Fill empty NPWP with default"

---

## 5. Data Grid Library Comparison

| Library | Bundle | Weekly DL | License | Excel-like | Inline Edit | Virtual Scroll |
|---------|--------|-----------|---------|------------|-------------|----------------|
| **TanStack Table** | ~45KB | 1.6M | MIT | ❌ (headless) | Custom | ✅ |
| **react-data-grid** | ~90KB | 500K | MIT | ✅ Moderate | ✅ Built-in | ✅ |
| **AG Grid Community** | ~320KB | 1.2M | MIT | ✅ Full | ✅ Built-in | ✅ |
| **Handsontable** | ~330KB | 300K | Commercial | ✅ Full | ✅ Built-in | ✅ |

### Recommendation

**Phase 1 (MVP):** **TanStack Table** + custom inline editing
- Alasan: Paling ringan (~45KB), flexible, developer builds exact UI needed
- Cocok dengan shadcn/ui components
- Cukup untuk dropdown, validation, dan basic inline edit

**Phase 2 (Enhancement):** Evaluate **react-data-grid** jika perlu more Excel-like experience
- Inline editing built-in, copy-paste, keyboard navigation
- Smaller footprint than AG Grid

**Avoid:** AG Grid (too heavy untuk MVP), Handsontable (commercial license)

---

## 6. Updated UI Flow — Step-by-Step Wizard

### 6.1 Step 1: Select Template
```
User buka website → Landing page
→ Pilih kategori (Bupot/Faktur/SPT) → Pilih template spesifik
→ Masuk ke converter page
```

### 6.2 Step 2: Input Data (2 mode)

**Mode A: Import File**
```
1. Drag & drop atau browse CSV/Excel
2. SheetJS parse → JSON
3. Auto-column mapping (AI-assisted + fuzzy match)
4. Mapping review screen:
   ┌──────────────────┬──────────────────┬──────────┐
   │ CSV Column       │ → XML Field      │ Match %  │
   ├──────────────────┼──────────────────┼──────────┤
   │ "NIK"            │ CounterpartTin   │ 🟢 95%   │
   │ "Nama"           │ (skip)           │ 🔴 —     │
   │ "Kode Objek"     │ TaxObjectCode    │ 🟡 70%   │
   │ "Bruto"          │ Gross            │ 🟢 98%   │
   └──────────────────┴──────────────────┴──────────┘
5. User confirm/adjust → Data masuk ke tabel editable
```

**Mode B: Manual Input**
```
1. Tampil spreadsheet kosong (pre-configured per template)
2. NPWP Pemotong, Masa Pajak, Tahun Pajak auto-fill dari Settings
3. User isi per row:
   - Dropdown untuk KOP, PTKP, Fasilitas, dll
   - Date picker untuk tanggal
   - Number input untuk nominal
4. Tab/Enter untuk navigate antar cell
5. Ctrl+V paste dari clipboard (parse multi-row)
```

### 6.3 Step 3: Validate
```
1. Real-time validation per cell (saat user ketik)
2. Full validation saat klik "Validate"
3. Summary:
   ✅ 48 rows valid
   🔴 2 rows have errors
   ⚠️ 3 rows have warnings (optional fields empty)
4. User fix errors inline
5. Re-validate → all green
```

### 6.4 Step 4: Preview & Download
```
1. Generate XML dari validated data
2. Preview dengan syntax highlighting
3. Side-by-side: data table (left) + XML output (right)
4. Download options:
   - Download XML (single file)
   - Download ZIP (if multiple files/batches)
   - Copy to clipboard
5. "New Conversion" button to start over
```

---

## 7. Key UX Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to first XML | < 3 minutes | From landing to download |
| Import success rate | > 95% | % of uploads that generate valid XML |
| Error rate per conversion | < 2% | Average errors per 100 rows |
| Support tickets | Reduce 60% vs Excel workflow | Feedback form |
| Return users | > 40% in 30 days | Privacy-friendly analytics |

---

## 8. Mobile UX Considerations

- **Responsive layout** — table scroll horizontal di mobile
- **Touch-friendly** — larger tap targets for cells, dropdowns
- **Progressive disclosure** — show 1 step at a time
- **File upload** — support camera/scan for mobile users
- **Compact validation** — show errors as expandable cards, not full table

---

## 9. Summary of Changes vs PRD v1.0

| Area | PRD v1.0 | Updated Recommendation |
|------|----------|----------------------|
| Data Grid | Not specified | TanStack Table (MVP) → react-data-grid (Phase 2) |
| Import Flow | Basic upload | 4-step wizard: Upload → Map → Validate → Submit |
| Column Mapping | Simple auto-detect | AI-assisted + fuzzy match + confidence scores + manual override |
| Validation | Zod schema | Zod + inline cell-level + actionable error messages |
| Manual Input | Basic editable table | Spreadsheet-like editor with smart defaults, auto-fill, dropdown search |
| KOP Selection | Basic dropdown | Searchable dropdown with descriptions + auto-populate Deemed & Rate |
| Error Display | Generic | Cell-level highlight with specific fix instructions |
| Template Download | Not mentioned | CSV template download with standardized headers |
| Save Draft | Not mentioned | Auto-save to IndexedDB, resume later |
| Settings | Not mentioned | Persistent settings (NPWP, NITKU, defaults) |

---

## 10. Research Sources

| Source | URL | Key Insight |
|--------|-----|-------------|
| CSVBox - Multi-step Import Flow | blog.csvbox.io/multi-step-import-flow/ | file → map → validate → submit pattern |
| CSVBox - Column Mapping | blog.csvbox.io/inside-csvbox-column-mapping/ | AI-assisted header detection |
| CSVBox - AI Auto-Mapping | blog.csvbox.io/ai-auto-mapping-spreadsheet-imports/ | Pattern matching + fuzzy logic |
| CSVBox - Reduce Support Tickets | blog.csvbox.io/reduce-support-tickets-import-ux/ | 60% reduction with better UX |
| CSVBox - Mobile Import | blog.csvbox.io/mobile-friendly-spreadsheet-import-flows/ | Touch-friendly import patterns |
| Flatfile - CSV Import Experience | flatfile.com/blog/optimizing-csv-import-experiences-flatfile-portal/ | Building vs buying CSV importer |
| PkgPulse - Data Grid Comparison | pkgpulse.com/blog/tanstack-table-vs-ag-grid-vs-react-data-grid-2026 | react-data-grid vs TanStack vs AG Grid |
| DoyanDuit - Coretax XML Guide | doyanduit.com/news/cara-impor-xml-coretax-djp-2026 | 70% upload errors from format issues |
| DiskusiPajak - Upload XML Bupot | diskusipajak.com/cara-upload-xml-bupot-di-coretax | Developer Tab + export workflow |
| AyoPajak - XML Coretax | ayopajak.com/cara-upload-dan-convert-file-xml-ke-excel-coretax/ | PER-11/PJ/2025 XML format mandate |
| KlikPajak - Upload File | klikpajak.id/blog/file-upload-coretax/ | XML replaces CSV and PDF |
| DJP Sidrap Case | pajak.go.id/en/node/114904 | Real user XML upload error case |

---

*Supplement to PRD v1.0 — Generated by Catheez PA, 1 April 2026*
