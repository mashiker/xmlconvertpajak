const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, ExternalHyperlink,
  TableOfContents, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak
} = require("docx");

// === "Midnight Code" Color Palette ===
const C = {
  primary: "020617",    // Midnight Black
  body: "1E293B",       // Deep Slate Blue
  secondary: "64748B",  // Cool Blue-Gray
  accent: "94A3B8",     // Steady Silver
  tableBg: "F8FAFC",   // Glacial Blue-White
  white: "FFFFFF",
  coverBg: "0F172A",   // Deep navy for cover
  accentLine: "3B82F6", // Electric blue accent line
  lightBorder: "CBD5E1",
  headerBg: "1E293B",
};

// === Reusable helpers ===
const LINE_SPACING = 250;
const BODY_SIZE = 21;
const H1_SIZE = 32;
const H2_SIZE = 28;
const H3_SIZE = 24;
const CAPTION_SIZE = 18;

const FONT_BODY = "Microsoft YaHei";
const FONT_HEADING = "SimHei";

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: C.lightBorder };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };
const tableMargins = { top: 80, bottom: 80, left: 150, right: 150 };

function bodyP(text, opts = {}) {
  const runs = typeof text === "string"
    ? [new TextRun({ text, font: FONT_BODY, size: BODY_SIZE, color: C.body })]
    : text;
  return new Paragraph({
    spacing: { line: LINE_SPACING, after: 120 },
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 420 },
    ...opts,
    children: runs,
  });
}

function bodyRun(text, extra = {}) {
  return new TextRun({ text, font: FONT_BODY, size: BODY_SIZE, color: C.body, ...extra });
}

function boldRun(text, extra = {}) {
  return new TextRun({ text, font: FONT_BODY, size: BODY_SIZE, color: C.body, bold: true, ...extra });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 600, after: 300, line: LINE_SPACING },
    children: [new TextRun({ text, font: FONT_HEADING, size: H1_SIZE, bold: true, color: C.primary })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200, line: LINE_SPACING },
    children: [new TextRun({ text, font: FONT_HEADING, size: H2_SIZE, bold: true, color: C.primary })],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 300, after: 150, line: LINE_SPACING },
    children: [new TextRun({ text, font: FONT_HEADING, size: H3_SIZE, bold: true, color: C.body })],
  });
}

function emptyP(height = 100) {
  return new Paragraph({ spacing: { before: height, after: 0 }, children: [new TextRun("")] });
}

function makeHeaderCell(text, width) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: C.headerBg, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: LINE_SPACING },
      children: [new TextRun({ text, bold: true, font: FONT_BODY, size: 18, color: C.white })],
    })],
  });
}

function makeCell(text, width, opts = {}) {
  const align = opts.center ? AlignmentType.CENTER : AlignmentType.LEFT;
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shaded ? { fill: C.tableBg, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: align,
      spacing: { line: LINE_SPACING },
      children: [new TextRun({ text, font: FONT_BODY, size: 17, color: C.body })],
    })],
  });
}

function makeTable(headers, rows, widths) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => makeHeaderCell(h, widths[i])),
  });
  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell, ci) => makeCell(cell, widths[ci], { shaded: ri % 2 === 1 })),
    })
  );
  return new Table({
    alignment: AlignmentType.CENTER,
    columnWidths: widths,
    margins: tableMargins,
    rows: [headerRow, ...dataRows],
  });
}

function tableCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 200, line: LINE_SPACING },
    children: [new TextRun({ text, font: FONT_BODY, size: CAPTION_SIZE, color: C.secondary, italics: true })],
  });
}

function codeBlock(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80, line: LINE_SPACING },
    indent: { left: 480 },
    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
    children: [new TextRun({ text, font: "SarasaMonoSC", size: 18, color: C.body })],
  });
}

// === BULLET & NUMBERING CONFIG ===
const numberingConfig = [];
let bulletRef = 0;
function newBulletRef() {
  const ref = `bullet-${++bulletRef}`;
  numberingConfig.push({
    reference: ref,
    levels: [{
      level: 0, format: LevelFormat.BULLET, text: "\u2022",
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } },
    }],
  });
  return ref;
}

let numRef = 0;
function newNumRef() {
  const ref = `num-${++numRef}`;
  numberingConfig.push({
    reference: ref,
    levels: [{
      level: 0, format: LevelFormat.DECIMAL, text: "%1.",
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } },
    }],
  });
  return ref;
}

function bulletItem(ref, text) {
  const runs = typeof text === "string" ? [bodyRun(text)] : text;
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { line: LINE_SPACING, after: 60 },
    alignment: AlignmentType.LEFT,
    children: runs,
  });
}

function numItem(ref, text) {
  const runs = typeof text === "string" ? [bodyRun(text)] : text;
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { line: LINE_SPACING, after: 60 },
    alignment: AlignmentType.LEFT,
    children: runs,
  });
}

// ====================================================================
// COVER PAGE SECTION
// ====================================================================
const coverSection = {
  properties: {
    page: {
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
      size: { width: 11906, height: 16838 },
    },
    titlePage: true,
  },
  children: [
    emptyP(3200),
    emptyP(800),
    // Accent line
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", font: FONT_BODY, size: 20, color: C.accentLine })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: "PRODUCT REQUIREMENTS DOCUMENT", font: FONT_HEADING, size: 28, color: C.accent, bold: true, characterSpacing: 200 })],
    }),
    emptyP(200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: "PRD: Coretax XML Converter", font: FONT_HEADING, size: 56, color: C.primary, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: "All-in-One", font: FONT_HEADING, size: 44, color: C.accentLine })],
    }),
    emptyP(200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", font: FONT_BODY, size: 20, color: C.accentLine })],
    }),
    emptyP(300),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Solusi Konverter XML Client-Side untuk Sistem Coretax DJP", font: FONT_BODY, size: 24, color: C.secondary })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Privacy-First | 100% Client-Side | Zero Server Data Transmission", font: FONT_BODY, size: 20, color: C.accent })],
    }),
    emptyP(1800),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "Versi 1.0 | Juni 2025", font: FONT_BODY, size: 20, color: C.secondary })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "Dokumen Rahasia \u2014 Untuk Keperluan Pengembangan Internal", font: FONT_BODY, size: 18, color: C.accent })],
    }),
  ],
};

// ====================================================================
// TOC SECTION
// ====================================================================
const tocSection = {
  properties: {
    page: {
      margin: { top: 1800, bottom: 1440, left: 1440, right: 1440 },
    },
    titlePage: true,
  },
  headers: {
    default: new Header({
      children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "PRD: Coretax XML Converter \u2014 All-in-One", font: FONT_BODY, size: 16, color: C.accent })],
      })],
    }),
  },
  footers: {
    default: new Footer({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "\u2014 ", font: FONT_BODY, size: 18, color: C.secondary }),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT_BODY, size: 18, color: C.secondary }),
          new TextRun({ text: " \u2014", font: FONT_BODY, size: 18, color: C.secondary }),
        ],
      })],
    }),
  },
  children: [
    new Paragraph({
      spacing: { before: 200, after: 400, line: LINE_SPACING },
      children: [new TextRun({ text: "Daftar Isi", font: FONT_HEADING, size: 36, bold: true, color: C.primary })],
    }),
    new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-3" }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
      children: [new TextRun({ text: "Catatan: Daftar Isi ini dibuat menggunakan field codes. Untuk memastikan nomor halaman akurat, silakan klik kanan pada Daftar Isi dan pilih \u201cUpdate Field\u201d.", font: FONT_BODY, size: CAPTION_SIZE, color: "999999" })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ],
};

// ====================================================================
// MAIN CONTENT
// ====================================================================

// --- 1. Executive Summary ---
const b1 = newBulletRef();
const b2 = newBulletRef();
const b3 = newBulletRef();
const b4 = newBulletRef();
const b5 = newBulletRef();
const b6 = newBulletRef();
const b7 = newBulletRef();
const b8 = newBulletRef();
const b9 = newBulletRef();
const b10 = newBulletRef();
const b11 = newBulletRef();
const b12 = newBulletRef();
const b13 = newBulletRef();
const b14 = newBulletRef();
const b15 = newBulletRef();
const b16 = newBulletRef();
const b17 = newBulletRef();
const b18 = newBulletRef();
const b19 = newBulletRef();
const b20 = newBulletRef();
const b21 = newBulletRef();
const b22 = newBulletRef();
const b23 = newBulletRef();
const b24 = newBulletRef();
const b25 = newBulletRef();
const b26 = newBulletRef();
const b27 = newBulletRef();
const b28 = newBulletRef();
const b29 = newBulletRef();
const b30 = newBulletRef();
const b31 = newBulletRef();
const b32 = newBulletRef();
const b33 = newBulletRef();
const b34 = newBulletRef();
const b35 = newBulletRef();
const b36 = newBulletRef();
const b37 = newBulletRef();
const b38 = newBulletRef();
const b39 = newBulletRef();
const b40 = newBulletRef();
const b41 = newBulletRef();
const b42 = newBulletRef();
const b43 = newBulletRef();
const b44 = newBulletRef();
const b45 = newBulletRef();
const b46 = newBulletRef();
const b47 = newBulletRef();
const b48 = newBulletRef();
const b49 = newBulletRef();
const b50 = newBulletRef();
const n1 = newNumRef();
const n2 = newNumRef();
const n3 = newNumRef();
const n4 = newNumRef();
const n5 = newNumRef();
const n6 = newNumRef();
const n7 = newNumRef();
const n8 = newNumRef();

const section1 = [
  heading1("1. Executive Summary"),
  bodyP("Dokumen Product Requirements Document (PRD) ini mendefinisikan spesifikasi lengkap untuk pengembangan Coretax XML Converter \u2014 sebuah aplikasi web All-in-One yang dirancang khusus untuk profesional perpajakan Indonesia (anak pajak) dalam menghadapi era digitalisasi perpajakan melalui sistem Coretax Administrasi Core System DJP."),
  bodyP("Sistem Coretax DJP mengharuskan seluruh data perpajakan dikirimkan dalam format XML, menggantikan format CSV dan Excel yang selama ini digunakan. DJP telah menyediakan file-file konverter Excel-ke-XML, namun solusi tersebut tersebar dalam puluhan file terpisah yang harus diunduh satu per satu dari website pajak.go.id. Kondisi ini menciptakan pain point yang signifikan bagi pengguna."),
  
  heading2("1.1 Visi Produk"),
  bodyP("Membangun satu platform terpadu yang mampu mengonversi data Excel/CSV ke format XML yang sesuai dengan spesifikasi DJP Coretax, dengan prinsip privacy-first dimana seluruh proses konversi terjadi di sisi klien (client-side) tanpa transmisi data ke server manapun. Pengguna cukup mengimpor data, memilih template, dan mengunduh file XML yang siap diunggah ke Coretax."),
  
  heading2("1.2 Target Pengguna"),
  bodyP("Produk ini menargetkan tiga segmen utama pengguna perpajakan Indonesia:"),
  bulletItem(b1, [boldRun("Konsultan Pajak"), bodyRun(" \u2014 Profesional yang menangani 20+ klien, memerlukan pemrosesan batch dan efisiensi tinggi dalam mengelola berbagai jenis dokumen perpajakan secara bersamaan.")]),
  bulletItem(b2, [boldRun("Staf Perpajakan Korporat"), bodyRun(" \u2014 Tim pajak internal perusahaan yang melakukan pelaporan bulanan dan tahunan, membutuhkan akurasi tinggi dan validasi data yang ketat.")]),
  bulletItem(b3, [boldRun("Wajib Pajak Orang Pribadi (WP OP)"), bodyRun(" \u2014 Individu yang hanya mengisi SPT Tahunan sekali setahun, membutuhkan antarmuka yang sederhana dan panduan yang mudah dipahami.")]),
  
  heading2("1.3 Nilai Inti"),
  bulletItem(b4, [boldRun("Privacy-First:"), bodyRun(" 100% pemrosesan di sisi klien (browser). Tidak ada data yang dikirim ke server, tidak ada cookies pelacakan, tidak ada penyimpanan data sensitif.")]),
  bulletItem(b5, [boldRun("All-in-One:"), bodyRun(" Mendukung seluruh 35 tipe template XML DJP Coretax dalam satu platform terpadu, menggantikan puluhan file konverter terpisah.")]),
  bulletItem(b6, [boldRun("Simple Workflow:"), bodyRun(" Alur kerja yang intuitif: Import Data \u2192 Pilih Template \u2192 Konversi \u2192 Preview \u2192 Download. Tiga metode input didukung: upload file, paste dari clipboard, atau input manual.")]),
  bulletItem(b7, [boldRun("Gratis dan Open Source:"), bodyRun(" Akses gratis untuk seluruh anak pajak Indonesia, dengan kode sumber terbuka untuk audit keamanan oleh komunitas.")]),
];

// --- 2. Problem Statement & Background ---
const section2 = [
  heading1("2. Problem Statement & Latar Belakang"),
  
  heading2("2.1 Transformasi Digital Perpajakan Indonesia"),
  bodyP("Direktorat Jenderal Pajak (DJP) sedang menjalankan transformasi digital besar-besaran melalui proyek Coretax Administration Core System. Salah satu perubahan fundamental adalah peralihan format pengiriman data dari CSV/Excel ke XML untuk seluruh jenis dokumen perpajakan, termasuk Bukti Potong (Bupot) PPh, Faktur Pajak (e-Faktur), SPT Tahunan, SPT Masa PPN, dan SPT Bea Meterai."),
  bodyP("Perubahan ini berlaku efektif berdasarkan PER-11/PJ/2025 tentang Format SPT, Bukti Pemotongan, dan Faktur Pajak era Coretax. Seluruh wajib pajak dan konsultan pajak harus beradaptasi dengan format baru ini dalam pelaporan perpajakan mereka."),
  
  heading2("2.2 Masalah Saat Ini"),
  bodyP("DJP telah menyediakan solusi melalui file-file converter Excel-ke-XML yang dapat diunduh dari halaman resmi pajak.go.id. Namun, solusi ini memiliki beberapa permasalahan kritis:"),
  
  heading3("2.2.1 Pencarian Converter yang Tersebar"),
  bulletItem(b8, "Converter disediakan PER-TIPE dokumen, total ada 35 tipe template yang masing-masing memiliki file converter terpisah."),
  bulletItem(b9, "File-file tersebut tersebar di satu halaman web tanpa organisasi yang intuitif."),
  bulletItem(b10, "Pengguna harus mengunduh puluhan file berbeda, menginstal masing-masing, dan mengingat fungsi setiap file."),
  bulletItem(b11, "Setiap file converter memiliki versi dan tanggal update yang berbeda-beda, menyulitkan pengelolaan."),
  
  heading3("2.2.2 Kekhawatiran Privasi Data"),
  bulletItem(b12, "Beberapa file converter DJP menggunakan makro VBA yang berpotensi mengirim data secara eksternal."),
  bulletItem(b13, "Tidak ada transparansi mengenai ke mana data yang diproses oleh converter tersebut dikirim."),
  bulletItem(b14, "Data perpajakan bersifat sangat sensitif (NPWP, penghasilan, transaksi keuangan) dan dilindungi undang-undang kerahasiaan perbankan."),
  bulletItem(b15, "Konsultan pajak memiliki kewajiban etis dan hukum untuk menjaga kerahasiaan data klien mereka."),
  
  heading3("2.2.3 Pengalaman Pengguna yang Buruk"),
  bulletItem(b16, "Antarmuka file converter berbasis Excel tidak konsisten antar tipe dokumen."),
  bulletItem(b17, "Tidak ada validasi real-time terhadap format data yang diinput."),
  bulletItem(b18, "Tidak ada fitur preview XML sebelum generate, sehingga kesalahan baru terdeteksi setelah upload ke Coretax."),
  bulletItem(b19, "Proses trial-and-error yang memakan waktu ketika format XML tidak sesuai."),
  
  heading2("2.3 Referensi Resmi"),
  bodyP("Sumber referensi utama untuk template dan converter resmi DJP Coretax:"),
  new Paragraph({
    spacing: { line: LINE_SPACING, after: 80 },
    indent: { left: 720 },
    children: [new ExternalHyperlink({
      children: [new TextRun({ text: "https://www.pajak.go.id/id/reformdjp/coretax/template-xml-dan-converter-excel-ke-xml", style: "Hyperlink", font: FONT_BODY, size: BODY_SIZE })],
      link: "https://www.pajak.go.id/id/reformdjp/coretax/template-xml-dan-converter-excel-ke-xml",
    })],
  }),
];

// --- 3. Target Audience & User Personas ---
const section3 = [
  heading1("3. Target Audience & User Personas"),
  bodyP("Berdasarkan analisis terhadap ekosistem perpajakan Indonesia, kami mengidentifikasi tiga persona utama yang menjadi target pengguna produk ini. Setiap persona memiliki kebutuhan, pain point, dan ekspektasi yang berbeda terhadap solusi konverter XML."),
  
  heading2("3.1 Persona 1: Konsultan Pajak"),
  makeTable(
    ["Atribut", "Detail"],
    [
      ["Nama", "Budi Santoso (Konsultan Pajak Senior)"],
      ["Usia", "35\u201345 tahun"],
      ["Lokasi", "Jakarta, kantor KAP (Kantor Akuntan Publik)"],
      ["Klien", "20\u201350 klien per tahun (WP Badan & OP)"],
      ["Frekuensi", "Harian di musim SPT, mingguan di luar musim SPT"],
      ["Keahlian IT", "Menengah \u2014 mahir Excel, familiar dengan software pajak"],
      ["Pain Point", "Mengelola banyak file converter, risiko kirim data klien ke pihak ketiga"],
      ["Kebutuhan Utama", "Batch processing, validasi otomatis, privasi data klien, efisiensi waktu"],
      ["Budget", "Bersedia membayar langganan bulanan jika value jelas"],
    ],
    [3000, 6360]
  ),
  tableCaption("Tabel 3.1 \u2014 Persona Konsultan Pajak"),
  
  heading2("3.2 Persona 2: Tax Staff Korporat"),
  makeTable(
    ["Atribut", "Detail"],
    [
      ["Nama", "Sari Dewi (Staf Perpajakan)"],
      ["Usia", "25\u201335 tahun"],
      ["Lokasi", "Kantor pusat perusahaan swasta nasional"],
      ["Tanggung Jawab", "Pelaporan PPh, PPN, dan SPT Tahunan perusahaan"],
      ["Frekuensi", "Bulanan (SPT Masa), tahunan (SPT Tahunan)"],
      ["Keahlian IT", "Menengah \u2014 pengguna Excel daily, paham format data"],
      ["Pain Point", "Tekanan akurasi, deadline ketat, banyaknya jenis laporan"],
      ["Kebutuhan Utama", "Akurasi tinggi, validasi format, preview sebelum submit"],
      ["Budget", "Akan meminta approval dari manajemen, preferensi gratis/freemium"],
    ],
    [3000, 6360]
  ),
  tableCaption("Tabel 3.2 \u2014 Persona Tax Staff Korporat"),
  
  heading2("3.3 Persona 3: WP Orang Pribadi"),
  makeTable(
    ["Atribut", "Detail"],
    [
      ["Nama", "Andi Wijaya (WP OP)"],
      ["Usia", "30\u201350 tahun"],
      ["Lokasi", "Kota-kota besar di Indonesia"],
      ["Pekerjaan", "Karyawan swasta / freelancer"],
      ["Frekuensi", "Sekali setahun (SPT Tahunan Maret\u2013Maret)"],
      ["Keahlian IT", "Dasar \u2014 bisa mengisi formulir online, kurang familiar dengan XML"],
      ["Pain Point", "Format XML membingungkan, tidak paham teknis, takut salah"],
      ["Kebutuhan Utama", "Simplicity, panduan langkah-demi-langkah, hasil yang langsung benar"],
      ["Budget", "Gratis \u2014 tidak akan membayar untuk sekali pakai setahun"],
    ],
    [3000, 6360]
  ),
  tableCaption("Tabel 3.3 \u2014 Persona WP Orang Pribadi"),
];

// --- 4. Template Inventory Table (CRITICAL) ---
const bupotRows = [
  ["1", "BPMP (Bupot PPh 21/26 Pegawai Tetap)", "BPMP Excel to XML v.3.xlsx", "bpmp.zip", "17/04/2025", "7/11/2024"],
  ["2", "BP21 (Bupot PPh Final/Tdk Final Selain PT)", "BP21 Excel to XML v.4.xlsx", "bp21.zip", "17/04/2025", "7/11/2024"],
  ["3", "BPA1 (Bupot PPh Pasal 4(2)/15)", "BPA1 Excel to XML.xlsx", "bpa1.zip", "7/11/2024", "7/11/2024"],
  ["4", "BPA2 (Bupot PPh 4(2) Bukan WP)", "BPA2 Excel to XML.xlsx", "bpa2.zip", "27/01/2026", "7/11/2024"],
  ["5", "BP26 (Bupot PPh Pasal 26)", "BP26 Excel to XML.xlsx", "bp26.zip", "7/11/2024", "7/11/2024"],
  ["6", "BPNR (Bupot PPh Final WP Non-Residen)", "BPNR Excel to XML v.2.xlsx", "bpnr.zip", "22/01/2025", "7/11/2024"],
  ["7", "BPCY (Bupot PPh Cryptocurrency)", "BPCY Excel to XML v.3.xlsx", "bpcy.zip", "30/09/2025", "7/11/2024"],
  ["8", "BPPU (Bupot PP 23/26 WP Patuh)", "BPPU Excel to XML v.3.xlsx", "bppu.zip", "30/09/2025", "7/11/2024"],
  ["9", "BPSP (Bupot PP 23/26 Bukan WP Patuh)", "BPSP Excel to XML v.3.xlsx", "bpsp.zip", "30/09/2025", "7/11/2024"],
  ["10", "DDBU (Bukti Potong Dividen)", "DDBU Excel to XML v.2.xlsx", "ddbu.zip", "17/09/2025", "7/11/2024"],
];

const efakturRows = [
  ["11", "Faktur Keluaran", "Faktur PK Template v.1.4.xml.zip", "\u2014", "23/01/2026"],
  ["12", "Retur Faktur Masukan", "Retur Faktur PM Template v.1.1.xml.zip", "\u2014", "23/01/2026"],
  ["13", "Dok Lain Keluaran", "Create DOk Lain Keluaran.xlsx", "Dok Lain Keluaran.xml.zip", "7/11/2024"],
  ["14", "Dok Lain Masukan", "Create DOk Lain Masukan.xlsx", "Dok Lain Masukan.xml.zip", "7/11/2024"],
  ["15", "Retur Dok Lain Keluaran", "Retur DOk Lain Keluaran.xlsx", "Retur Dok Lain Keluaran.xml.zip", "7/11/2024"],
  ["16", "Retur Dok Lain Masukan", "Retur DOk Lain Masukan.xlsx", "Retur Dok Lain Masukan.xml.zip", "7/11/2024"],
  ["17", "Detil Transaksi PMSE", "Detil Transaksi PMSE v1.xlsx", "\u2014", "16/09/2025"],
  ["18", "Faktur Pajak Domestik", "TemplateDomestikBaru v1_4.zip", "\u2014", "4/02/2025"],
];

const sptBadanRows = [
  ["19", "Lampiran 9: Penyusutan & Amortisasi", "Badan_Converter.PenyusutanAmortisasi.zip", "CIT_L9_Depreciation_Template.zip", "28/02/2026"],
  ["20", "Lampiran 10A: Transaksi Hub. Istimewa", "CIT_L10A_Declaration TRP_Template.xlsx", "CIT_L10A_...zip", "7/11/2024"],
  ["21", "Lampiran 11A: Piutang Tak Tertagih", "CIT_L11A_Uncollectible_Debt_Template.xlsx", "CIT_L11A_...zip", "7/11/2024"],
  ["22", "Lampiran 11A: Biaya Promosi", "CIT_L11A_Promotion_Expense_Template.xlsx", "CIT_L11A_...zip", "7/11/2024"],
  ["23", "Lampiran 11A: Biaya Entertainment", "CIT_L11A_Entertainment_Expense_Template.xlsx", "CIT_L11A_...zip", "7/11/2024"],
  ["24", "Lampiran 11A: Daftar Debitur NPL", "CIT_L11A_NPL_Debtors_Template.xlsx", "CIT_L11A_...zip", "7/11/2024"],
];

const sptOPRows = [
  ["25", "Lampiran 3C: Penyusutan & Amortisasi", "OP_ConverterPenyusutanAmortisasi.zip", "PIT_L3C_Depreciation_Template.xml.zip", "28/02/2026"],
  ["26", "Lampiran 3D: Piutang Tak Tertagih", "PIT_L3D_Bad_Debt_Template.xlsx", "PIT_L3D_Bad_Debt_Template.xml.zip", "7/11/2024"],
  ["27", "Lampiran 3D: Biaya Promosi", "PIT_L3D_Promotion_Expense_Template.xlsx", "PIT_L3D_Promotion_Expense_Template.xml.zip", "7/11/2024"],
  ["28", "Lampiran 3D: Biaya Entertainment", "PIT_L3D_Entertainment_Expense_Template.xlsx", "PIT_L3D_Entertainment_Expense_Template.xml.zip", "7/11/2024"],
];

const sptMasaPPNRows = [
  ["29", "Lampiran C SPT Masa PPN", "\u2014", "Sample Lampiran C Template v.1.1.xml.zip", "23/01/2026"],
  ["30", "SPT PPN Digunggung", "\u2014", "SPT PPN Digunggung.xml.zip", "7/11/2024"],
  ["31", "DRKB (Rekonsiliasi Konsolidasi)", "DRKB.xlsx", "DRKB.xml.zip", "7/11/2024"],
  ["32", "Retail XML Induk IA5 IA9 IB", "Retail_XML Induk IA5 IA9 dan IB.xlsx", "\u2014", "8/10/2025"],
];

const beaMeteraiRows = [
  ["33", "Lampiran 3 SPT Bea Meterai", "Stamp Duty L3.xlsx", "Bea Meterai Lampiran L3.xml.zip", "7/11/2024"],
  ["34", "Lampiran 4 SPT Bea Meterai", "Stamp Duty L4.xlsx", "Bea Meterai Lampiran L4.xml.zip", "7/11/2024"],
];

const daftarHartaRows = [
  ["35", "Daftar Harta SPT Tahunan OP", "\u2014", "Lampiran SPT OP_Daftar Harta.zip", "3/2026"],
];

const w1 = [500, 2400, 2100, 2100, 1160, 1100];
const w2 = [500, 2400, 2600, 2000, 1860];
const w3 = [500, 2400, 2300, 2300, 1860];
const w4 = [500, 2600, 2700, 2100, 1460];

const section4 = [
  heading1("4. Inventaris Lengkap Template XML DJP Coretax"),
  bodyP("Berikut adalah daftar lengkap seluruh 35 tipe template XML yang digunakan dalam sistem Coretax DJP, diorganisir berdasarkan 7 kategori dokumen. Data ini bersumber dari halaman resmi DJP di pajak.go.id. Setiap template memiliki file converter dan/atau file template XML yang dapat diunduh."),
  
  heading2("4.1 Kategori 1: Bukti Pemotongan (Bupot) PPh"),
  bodyP("Kategori ini mencakup seluruh jenis Bukti Pemotongan Pajak Penghasilan yang wajib dilaporkan oleh pemotong pajak. Terdapat 10 tipe dokumen dalam kategori ini, menjadikannya kategori terbesar."),
  makeTable(
    ["No", "Jenis Dokumen", "File Converter", "File Template XML", "Update Conv.", "Update Template"],
    bupotRows, w1
  ),
  tableCaption("Tabel 4.1 \u2014 Kategori 1: Bukti Pemotongan (Bupot) PPh (10 Template)"),
  
  heading2("4.2 Kategori 2: Faktur Pajak (e-Faktur)"),
  bodyP("Kategori ini mencakup seluruh dokumen terkait Faktur Pajak elektronik, termasuk Faktur Keluaran, Faktur Masukan, Retur, dan Dokumen Lain. Terdapat 8 tipe dokumen dalam kategori ini."),
  makeTable(
    ["No", "Jenis Dokumen", "File Converter / Template", "File Template XML", "Last Update"],
    efakturRows, w2
  ),
  tableCaption("Tabel 4.2 \u2014 Kategori 2: Faktur Pajak (e-Faktur) (8 Template)"),
  
  heading2("4.3 Kategori 3: SPT Tahunan Badan"),
  bodyP("Kategori ini mencakup lampiran-lampiran SPT Tahunan untuk Wajib Pajak Badan, termasuk penyusutan, amortisasi, transaksi hub istimewa, dan berbagai jenis biaya yang perlu dilaporkan. Terdapat 6 tipe dokumen."),
  makeTable(
    ["No", "Jenis Dokumen", "File Converter", "File Template XML", "Last Update"],
    sptBadanRows, w3
  ),
  tableCaption("Tabel 4.3 \u2014 Kategori 3: SPT Tahunan Badan (6 Template)"),
  
  heading2("4.4 Kategori 4: SPT Tahunan Orang Pribadi"),
  bodyP("Kategori ini mencakup lampiran SPT Tahunan untuk Wajib Pajak Orang Pribadi, khususnya yang berkaitan dengan penyusutan, piutang tak tertagih, biaya promosi, dan biaya entertainment. Terdapat 4 tipe dokumen."),
  makeTable(
    ["No", "Jenis Dokumen", "File Converter", "File Template XML", "Last Update"],
    sptOPRows, w3
  ),
  tableCaption("Tabel 4.4 \u2014 Kategori 4: SPT Tahunan Orang Pribadi (4 Template)"),
  
  heading2("4.5 Kategori 5: SPT Masa PPN"),
  bodyP("Kategori ini mencakup dokumen-dokumen pelaporan SPT Masa Pajak Pertambahan Nilai, termasuk Lampiran C, SPT PPN Digunggung, dan dokumen rekonsiliasi. Terdapat 4 tipe dokumen."),
  makeTable(
    ["No", "Jenis Dokumen", "File Converter", "File Template XML", "Last Update"],
    sptMasaPPNRows, w3
  ),
  tableCaption("Tabel 4.5 \u2014 Kategori 5: SPT Masa PPN (4 Template)"),
  
  heading2("4.6 Kategori 6: SPT Bea Meterai"),
  bodyP("Kategori ini mencakup lampiran SPT untuk pelaporan Bea Meterai, termasuk Lampiran 3 dan Lampiran 4. Terdapat 2 tipe dokumen."),
  makeTable(
    ["No", "Jenis Dokumen", "File Converter", "File Template XML", "Last Update"],
    beaMeteraiRows, w3
  ),
  tableCaption("Tabel 4.6 \u2014 Kategori 6: SPT Bea Meterai (2 Template)"),
  
  heading2("4.7 Kategori 7: SPT Tahunan OP \u2014 Daftar Harta"),
  bodyP("Kategori ini mencakup template untuk pelaporan Daftar Harta dalam SPT Tahunan Orang Pribadi. Terdapat 1 tipe dokumen."),
  makeTable(
    ["No", "Jenis Dokumen", "File Converter", "File Template XML", "Last Update"],
    daftarHartaRows, w4
  ),
  tableCaption("Tabel 4.7 \u2014 Kategori 7: SPT Tahunan OP \u2014 Daftar Harta (1 Template)"),
  
  heading2("4.8 Ringkasan Inventaris"),
  bodyP("Total terdapat 35 tipe template XML yang terorganisir dalam 7 kategori. Distribusi template per kategori adalah sebagai berikut:"),
  makeTable(
    ["No", "Kategori", "Jumlah Template", "Persentase"],
    [
      ["1", "Bukti Pemotongan (Bupot) PPh", "10", "28,6%"],
      ["2", "Faktur Pajak (e-Faktur)", "8", "22,9%"],
      ["3", "SPT Tahunan Badan", "6", "17,1%"],
      ["4", "SPT Tahunan Orang Pribadi", "4", "11,4%"],
      ["5", "SPT Masa PPN", "4", "11,4%"],
      ["6", "SPT Bea Meterai", "2", "5,7%"],
      ["7", "SPT Tahunan OP \u2014 Daftar Harta", "1", "2,9%"],
      ["", "TOTAL", "35", "100%"],
    ],
    [1200, 4000, 2000, 2160]
  ),
  tableCaption("Tabel 4.8 \u2014 Ringkasan Distribusi Template per Kategori"),
];

// --- 5. Technical Architecture ---
const section5 = [
  heading1("5. Arsitektur Teknis"),
  bodyP("Bagian ini menjelaskan arsitektur teknis secara detail dari Coretax XML Converter, mencakup prinsip privacy-first, tech stack yang digunakan, dan alur data dari input hingga output XML."),
  
  heading2("5.1 Arsitektur Privacy-First"),
  bodyP("Prinsip utama dari produk ini adalah memastikan bahwa seluruh pemrosesan data terjadi di sisi klien (browser pengguna), tanpa ada transmisi data ke server manapun. Pendekatan ini membedakan produk ini dari solusi DJP yang berbasis Excel/VBA."),
  
  heading3("5.1.1 Prinsip Desain"),
  bulletItem(b20, [boldRun("Zero Server Processing:"), bodyRun(" Tidak ada API endpoint yang menerima data pengguna. Server hanya menyajikan file statis (HTML, CSS, JavaScript).")]),
  bulletItem(b21, [boldRun("Browser-Only Processing:"), bodyRun(" Seluruh parsing Excel/CSV, validasi data, mapping ke XML schema, dan generasi file XML terjadi di dalam browser menggunakan JavaScript.")]),
  bulletItem(b22, [boldRun("No Persistent Storage:"), bodyRun(" Data tidak disimpan di localStorage, sessionStorage, IndexedDB, atau cookies. Setelah tab browser ditutup, semua data hilang.")]),
  bulletItem(b23, [boldRun("No Telemetry:"), bodyRun(" Tidak ada analytics, tracking pixels, atau telemetry yang mengirim informasi penggunaan.")]),
  bulletItem(b24, [boldRun("Open Source:"), bodyRun(" Kode sumber sepenuhnya terbuka untuk audit keamanan oleh komunitas perpajakan Indonesia.")]),
  
  heading3("5.1.2 Diagram Arsitektur"),
  codeBlock("\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510"),
  codeBlock("\u2502           BROWSER (Client-Side)             \u2502"),
  codeBlock("\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524"),
  codeBlock("\u2502  Input Layer:                            \u2502"),
  codeBlock("\u2502  [File Upload] [Clipboard Paste] [Form]  \u2502"),
  codeBlock("\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524"),
  codeBlock("\u2502  Processing Layer (Web Worker):           \u2502"),
  codeBlock("\u2502  SheetJS \u2192 Parse \u2192 Validate \u2192 Map \u2192 XML  \u2502"),
  codeBlock("\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524"),
  codeBlock("\u2502  Output Layer:                            \u2502"),
  codeBlock("\u2502  [XML Preview] [Download .xml] [.zip]     \u2502"),
  codeBlock("\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518"),
  codeBlock("         \u25BC (hanya request file statis)"),
  codeBlock("\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510"),
  codeBlock("\u2502  SERVER (Static Only \u2014 Vercel/CF Pages) \u2502"),
  codeBlock("\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518"),
  
  heading2("5.2 Tech Stack"),
  makeTable(
    ["Komponen", "Teknologi", "Deskripsi"],
    [
      ["Framework", "Next.js 15 + React", "App Router, TypeScript, SSR/SSG untuk halaman statis"],
      ["Styling", "Tailwind CSS 4 + shadcn/ui", "Component library, responsif, aksesibel"],
      ["State Management", "Zustand + TanStack Query", "Client state & server state management"],
      ["Excel Parsing", "SheetJS (xlsx)", "Parsing file .xlsx, .xls di browser"],
      ["CSV Parsing", "PapaParse", "Parsing file CSV dengan berbagai delimiter"],
      ["XML Generation", "DOM API (browser native)", "XMLSerializer & DOMParser bawaan browser"],
      ["XML Validation", "Custom Validator", "Validasi berdasarkan analisis template DJP"],
      ["File Download", "Blob API + JSZip", "Download file .xml individual atau .zip batch"],
      ["UI Spreadsheet", "TanStack Table", "Editor tabel interaktif seperti Google Sheets"],
      ["Build Tool", "Next.js CLI", "Optimasi bundel, code splitting, tree shaking"],
      ["Hosting", "Vercel / Cloudflare Pages", "Static hosting gratis, CDN global, HTTPS"],
      ["Web Worker", "Comlink / native Worker", "Pemrosesan berat di background thread"],
    ],
    [2200, 2400, 4760]
  ),
  tableCaption("Tabel 5.1 \u2014 Tech Stack Detail"),
  
  heading2("5.3 Alur Data (Data Flow)"),
  bodyP("Berikut adalah alur data lengkap dari input pengguna hingga file XML yang siap diunduh:"),
  numItem(n1, [boldRun("Input Data: "), bodyRun("Pengguna memasukkan data melalui tiga metode: upload file (.xlsx/.xls/.csv), paste dari clipboard (tab-separated dari Excel), atau input manual melalui formulir dinamis.")]),
  numItem(n2, [boldRun("Parse Data: "), bodyRun("SheetJS atau PapaParse mem-parsing data mentah menjadi array of objects JavaScript. Setiap baris data menjadi satu record.")]),
  numItem(n3, [boldRun("Validasi Data: "), bodyRun("Custom validator memeriksa format NPWP (15 digit), format tanggal (DD/MM/YYYY), batasan angka, field wajib, dan aturan spesifik per template.")]),
  numItem(n4, [boldRun("Map ke XML Schema: "), bodyRun("Data yang sudah tervalidasi di-mapping ke struktur XML sesuai template yang dipilih. Setiap template memiliki schema mapper yang berbeda.")]),
  numItem(n5, [boldRun("Generate XML: "), bodyRun("Browser DOM API menghasilkan dokumen XML. XMLSerializer mengubah DOM menjadi string XML yang well-formed.")]),
  numItem(n6, [boldRun("Preview: "), bodyRun("XML ditampilkan dengan syntax highlighting. Pengguna dapat membandingkan data input dengan output XML secara side-by-side.")]),
  numItem(n7, [boldRun("Download: "), bodyRun("File XML diunduh melalui Blob API. Untuk batch processing, multiple files diunduh sebagai .zip menggunakan JSZip.")]),
];

// --- 6. Feature Specifications ---
const section6 = [
  heading1("6. Spesifikasi Fitur"),
  bodyP("Bagian ini mendefinisikan secara detail setiap fitur yang akan dikembangkan dalam produk Coretax XML Converter."),
  
  heading2("6.1 Halaman Pemilihan Template"),
  bodyP("Halaman ini merupakan entry point utama pengguna setelah membuka aplikasi. Pengguna memilih template XML yang sesuai dengan dokumen perpajakan yang ingin dikonversi."),
  
  heading3("6.1.1 Layout & Desain"),
  bulletItem(b25, "Grid/card layout responsif yang menampilkan seluruh 35 tipe template, dikelompokkan dalam 7 kategori dokumen."),
  bulletItem(b26, "Setiap card menampilkan: nama template, kode singkat, ikon kategori, tanggal update terakhir, dan indikator popularitas."),
  bulletItem(b27, "Accordion atau tab navigation untuk berpindah antar kategori."),
  bulletItem(b28, "Search bar dengan filter berdasarkan nama template, kode, atau kategori."),
  bulletItem(b29, "Badge indikator untuk template yang paling sering digunakan (misal: BPMP, BP21, Faktur PK)."),
  
  heading3("6.1.2 Interaksi"),
  bulletItem(b30, "Hover effect pada card untuk menampilkan deskripsi singkat template."),
  bulletItem(b31, "Klik card untuk memasuki workflow konversi dengan template yang dipilih."),
  bulletItem(b32, "Breadcrumb navigation untuk tracking posisi pengguna dalam workflow."),
  
  heading2("6.2 Import Data (3 Metode)"),
  heading3("6.2.1 Upload File"),
  bulletItem(b33, "Drag-and-drop zone dengan dukungan file .xlsx, .xls, dan .csv."),
  bulletItem(b34, "Validasi file type dan size sebelum pemrosesan (maks 10MB per file)."),
  bulletItem(b35, "Deteksi otomatis encoding file (UTF-8, Windows-1252, ISO-8859-1)."),
  bulletItem(b36, "Preview ringkas data setelah upload sebelum masuk editor."),
  
  heading3("6.2.2 Paste Data"),
  bulletItem(b37, "Area teks besar untuk paste data dari Excel (tab-separated values)."),
  bulletItem(b38, "Deteksi otomatis delimiter (tab, comma, semicolon)."),
  bulletItem(b39, "Parse real-time saat user menempelkan data."),
  
  heading3("6.2.3 Input Manual"),
  bulletItem(b40, "Formulir dinamis yang field-nya sesuai dengan template yang dipilih."),
  bulletItem(b41, "Field-field diorganisir secara logis berdasarkan grouping template."),
  bulletItem(b42, "Input masking untuk NPWP (auto-format 15 digit), tanggal, dan currency."),
  bulletItem(b43, "Auto-save draft ke memory browser (tidak ke storage)."),
  
  heading2("6.3 Data Editor"),
  bodyP("Data editor merupakan fitur inti yang memungkinkan pengguna memview, mengedit, dan memvalidasi data sebelum konversi ke XML."),
  bulletItem(b44, [boldRun("Spreadsheet-like Table Editor:"), bodyRun(" Tampilan tabel interaktif mirip Google Sheets menggunakan TanStack Table. Edit inline pada setiap cell, navigasi keyboard antar cell.")]),
  bulletItem(b45, [boldRun("Row Management:"), bodyRun(" Tambah dan hapus baris data. Duplikasi baris untuk data yang mirip. Drag-and-drop untuk reorder baris.")]),
  bulletItem(b46, [boldRun("Auto-formatting:"), bodyRun(" Format otomatis untuk kolom currency (Rp 1.234.567,00), tanggal (DD/MM/YYYY), dan persentase. Alignment kanan untuk angka.")]),
  bulletItem(b47, [boldRun("Data Validation:"), bodyRun(" Validasi real-time per cell dengan indikator error (border merah, tooltip pesan error). Validasi NPWP, amount, dan required fields.")]),
  bulletItem(b48, [boldRun("Undo/Redo:"), bodyRun(" History stack untuk undo/redo operasi edit. Ctrl+Z / Ctrl+Y support.")]),
  
  heading2("6.4 XML Preview"),
  bulletItem(b49, [boldRun("Side-by-Side Preview:"), bodyRun(" Layout split view yang menampilkan data tabel di panel kiri dan XML output di panel kanan. Scroll sync antara kedua panel.")]),
  bulletItem(b50, [boldRun("Syntax Highlighting:"), bodyRun(" XML ditampilkan dengan warna berbeda untuk tag, attribute, dan value (mirip VS Code). Line numbers untuk referensi.")]),
  bodyP("Fitur tambahan yang akan tersedia pada XML preview:"),
  bulletItem(newBulletRef(), "Line-by-line mapping yang menunjukkan baris data mana yang menghasilkan elemen XML tertentu."),
  bulletItem(newBulletRef(), "XML validation dengan error highlighting \u2014 elemen yang bermasalah ditandai warna merah."),
  bulletItem(newBulletRef(), "Warnings untuk kesalahan umum: field wajib kosong, format NPWP salah, amount negatif."),
  bulletItem(newBulletRef(), "Collapse/expand XML elements untuk navigasi yang lebih mudah pada dokumen besar."),
  
  heading2("6.5 Download & Export"),
  bulletItem(newBulletRef(), [boldRun("Download XML Individual:"), bodyRun(" Unduh file .xml per record atau per batch data. Nama file auto-generated berdasarkan template dan timestamp.")]),
  bulletItem(newBulletRef(), [boldRun("Download sebagai ZIP:"), bodyRun(" Untuk template yang menghasilkan multiple XML files (misal: batch Bupot), semua file dikemas dalam satu .zip.")]),
  bulletItem(newBulletRef(), [boldRun("Copy to Clipboard:"), bodyRun(" Salin seluruh XML ke clipboard untuk paste langsung ke aplikasi lain.")]),
  bulletItem(newBulletRef(), [boldRun("Batch Processing:"), bodyRun(" Upload multiple Excel files sekaligus. Pilih template yang sama untuk semua file atau template berbeda per file. Convert all dan download sebagai zip.")]),
];

// --- 7. XML Schema Analysis ---
const section7 = [
  heading1("7. Analisis Skema XML per Template"),
  bodyP("Bagian ini mendokumentasikan struktur XML untuk template-template utama yang akan didukung oleh converter. Analisis ini dilakukan berdasarkan file template resmi DJP yang tersedia di pajak.go.id."),
  
  heading2("7.1 BPMP (Bukti Pemotongan PPh 21/26 Pegawai Tetap)"),
  heading3("7.1.1 Struktur XML"),
  bodyP("BPMP adalah template yang paling banyak digunakan karena hampir seluruh perusahaan memiliki pegawai tetap. Berikut adalah analisis struktur XML-nya:"),
  bodyP([boldRun("Root Element:"), bodyRun(" <BPMP>")]),
  bodyP([boldRun("Namespace:"), bodyRun(" xmlns=\"http://www.djp.go.id/xml/bpmp\"")]),
  
  makeTable(
    ["Elemen", "Level", "Required", "Tipe Data", "Deskripsi"],
    [
      ["BPMP", "Root", "Ya", "\u2014", "Elemen root dokumen BPMP"],
      ["  /BPMP/Header", "Child", "Ya", "\u2014", "Header informasi pemotong pajak"],
      ["  /BPMP/Header/KdForm", "Child", "Ya", "String(3)", "Kode formulir (misal: 1721)"],
      ["  /BPMP/Header/NpwpPengurus", "Child", "Ya", "String(15)", "NPWP pemotong pajak"],
      ["  /BPMP/Header/NamaPengurus", "Child", "Ya", "String(100)", "Nama pemotong pajak"],
      ["  /BPMP/Header/MasaPajak", "Child", "Ya", "String(2)", "Masa pajak (01-12)"],
      ["  /BPMP/Header/TahunPajak", "Child", "Ya", "String(4)", "Tahun pajak"],
      ["  /BPMP/Header/JmlPegawai", "Child", "Ya", "Integer", "Jumlah pegawai dalam Bukti Potong"],
      ["  /BPMP/DetailBuktiPotong", "Child", "Ya", "\u2014", "Container daftar bukti potong"],
      ["  /BPMP/DetailBuktiPotong/BuktiPotong", "Repeated", "Ya", "\u2014", "Detail per pegawai"],
      ["    /BuktiPotong/NpwpPenerima", "Child", "Ya", "String(15)", "NPWP pegawai"],
      ["    /BuktiPotong/NamaPenerima", "Child", "Ya", "String(100)", "Nama pegawai"],
      ["    /BuktiPotong/PenghasilanBruto", "Child", "Ya", "Decimal(15,2)", "Penghasilan bruto"],
      ["    /BuktiPotong/Ptkp", "Child", "Ya", "Decimal(15,2)", "PTKP yang berlaku"],
      ["    /BuktiPotong/PphDipotong", "Child", "Ya", "Decimal(15,2)", "PPh yang dipotong"],
    ],
    [2800, 1200, 1000, 1400, 2960]
  ),
  tableCaption("Tabel 7.1 \u2014 Skema XML BPMP"),
  
  heading3("7.1.2 Contoh XML BPMP"),
  codeBlock("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"),
  codeBlock("<BPMP xmlns=\"http://www.djp.go.id/xml/bpmp\">"),
  codeBlock("  <Header>"),
  codeBlock("    <KdForm>1721</KdForm>"),
  codeBlock("    <NpwpPengurus>012345678901000</NpwpPengurus>"),
  codeBlock("    <NamaPengurus>PT MAJU BERSAMA</NamaPengurus>"),
  codeBlock("    <MasaPajak>06</MasaPajak>"),
  codeBlock("    <TahunPajak>2025</TahunPajak>"),
  codeBlock("    <JmlPegawai>2</JmlPegawai>"),
  codeBlock("  </Header>"),
  codeBlock("  <DetailBuktiPotong>"),
  codeBlock("    <BuktiPotong>"),
  codeBlock("      <NpwpPenerima>987654321098000</NpwpPenerima>"),
  codeBlock("      <NamaPenerima>Andi Wijaya</NamaPenerima>"),
  codeBlock("      <PenghasilanBruto>15000000.00</PenghasilanBruto>"),
  codeBlock("      <Ptkp>5400000.00</Ptkp>"),
  codeBlock("      <PphDipotong>720000.00</PphDipotong>"),
  codeBlock("    </BuktiPotong>"),
  codeBlock("  </DetailBuktiPotong>"),
  codeBlock("</BPMP>"),
  
  heading2("7.2 Faktur Pajak Keluaran (Faktur PK)"),
  heading3("7.2.1 Struktur XML"),
  bodyP("Faktur Pajak Keluaran merupakan dokumen PPN paling fundamental. Struktur XML-nya lebih kompleks dibanding BPMP karena mencakup informasi faktur, detail barang/jasa, dan perhitungan PPN."),
  bodyP([boldRun("Root Element:"), bodyRun(" <FakturPajak>")]),
  bodyP([boldRun("Namespace:"), bodyRun(" xmlns=\"http://www.djp.go.id/xml/fakturpajak\"")]),
  
  makeTable(
    ["Elemen", "Level", "Required", "Tipe Data", "Deskripsi"],
    [
      ["FakturPajak", "Root", "Ya", "\u2014", "Elemen root dokumen Faktur Pajak"],
      ["  /FakturPajak/KdFaktur", "Child", "Ya", "String(2)", "Kode jenis faktur (07/08/09)"],
      ["  /FakturPajak/NoFaktur", "Child", "Ya", "String(20)", "Nomor faktur pajak"],
      ["  /FakturPajak/TglFaktur", "Child", "Ya", "Date", "Tanggal faktur (YYYY-MM-DD)"],
      ["  /FakturPajak/NpwpPenjual", "Child", "Ya", "String(15)", "NPWP penjual/pengusaha kena pajak"],
      ["  /FakturPajak/NamaPenjual", "Child", "Ya", "String(100)", "Nama PKP penjual"],
      ["  /FakturPajak/NpwpPembeli", "Child", "Ya", "String(15)", "NPWP pembeli"],
      ["  /FakturPajak/NamaPembeli", "Child", "Ya", "String(100)", "Nama pembeli"],
      ["  /FakturPajak/IsCreditNote", "Child", "Ya", "Boolean", "Apakah faktur retur (0/1)"],
      ["  /FakturPajak/DetailBarang", "Child", "Ya", "\u2014", "Container detail barang/jasa"],
      ["    /DetailBarang/Barang", "Repeated", "Ya", "\u2014", "Detail per barang/jasa"],
      ["      /Barang/NamaBarang", "Child", "Ya", "String(200)", "Nama barang/jasa"],
      ["      /Barang/HargaSatuan", "Child", "Ya", "Decimal(18,2)", "Harga satuan sebelum PPN"],
      ["      /Barang/JumlahBarang", "Child", "Ya", "Decimal(12,2)", "Jumlah barang"],
      ["      /Barang/HargaTotal", "Child", "Ya", "Decimal(18,2)", "Harga total (DPP)"],
      ["      /Barang/Ppn", "Child", "Ya", "Decimal(18,2)", "PPN yang dikenakan"],
      ["  /FakturPajak/JmlDpp", "Child", "Ya", "Decimal(18,2)", "Total DPP"],
      ["  /FakturPajak/JmlPpn", "Child", "Ya", "Decimal(18,2)", "Total PPN"],
      ["  /FakturPajak/JmlPpnBm", "Child", "Ya", "Decimal(18,2)", "Total PPnBM"],
    ],
    [2800, 1200, 1000, 1400, 2960]
  ),
  tableCaption("Tabel 7.2 \u2014 Skema XML Faktur Pajak Keluaran"),
  
  heading2("7.3 Lampiran C SPT Masa PPN"),
  heading3("7.3.1 Struktur XML"),
  bodyP("Lampiran C merupakan dokumen kompleks yang melaporkan seluruh transaksi PPN dalam satu masa pajak. Struktur XML-nya mencakup ringkasan dan transaksi detail."),
  bodyP([boldRun("Root Element:"), bodyRun(" <LampiranC>")]),
  bodyP([boldRun("Namespace:"), bodyRun(" xmlns=\"http://www.djp.go.id/xml/sptmasappn\"")]),
  
  makeTable(
    ["Elemen", "Level", "Required", "Tipe Data", "Deskripsi"],
    [
      ["LampiranC", "Root", "Ya", "\u2014", "Elemen root Lampiran C"],
      ["  /LampiranC/Header", "Child", "Ya", "\u2014", "Header SPT Masa PPN"],
      ["  /LampiranC/Header/Npwp", "Child", "Ya", "String(15)", "NPWP PKP"],
      ["  /LampiranC/Header/Masa", "Child", "Ya", "String(2)", "Masa pajak (01-12)"],
      ["  /LampiranC/Header/Tahun", "Child", "Ya", "String(4)", "Tahun pajak"],
      ["  /LampiranC/Header/Pembetulan", "Child", "Ya", "Integer", "Ke berapa kali pembetulan"],
      ["  /LampiranC/DaftarTransaksi", "Child", "Ya", "\u2014", "Container transaksi"],
      ["    /DaftarTransaksi/Transaksi", "Repeated", "Ya", "\u2014", "Detail per transaksi"],
      ["      /Transaksi/JenisDokumen", "Child", "Ya", "String(50)", "Jenis dokumen pendukung"],
      ["      /Transaksi/NpwpLawanTransaksi", "Child", "Ya", "String(15)", "NPWP lawan transaksi"],
      ["      /Transaksi/NamaLawanTransaksi", "Child", "Ya", "String(100)", "Nama lawan transaksi"],
      ["      /Transaksi/Dpp", "Child", "Ya", "Decimal(18,2)", "Dasar Pengenaan Pajak"],
      ["      /Transaksi/Ppn", "Child", "Ya", "Decimal(18,2)", "PPN"],
      ["      /Transaksi/PpnBm", "Child", "Ya", "Decimal(18,2)", "PPnBM"],
      ["      /Transaksi/TanggalDokumen", "Child", "Ya", "Date", "Tanggal dokumen"],
    ],
    [2800, 1200, 1000, 1400, 2960]
  ),
  tableCaption("Tabel 7.3 \u2014 Skema XML Lampiran C SPT Masa PPN"),
];

// --- 8. UI/UX Wireframe Description ---
const section8 = [
  heading1("8. Deskripsi Wireframe UI/UX"),
  bodyP("Bagian ini mendeskripsikan layout dan komponen setiap halaman dalam aplikasi Coretax XML Converter."),
  
  heading2("8.1 Landing Page"),
  bodyP("Halaman pertama yang dilihat pengguna. Bertujuan untuk menjelaskan value proposition dan mengarahkan pengguna ke template selection."),
  bulletItem(newBulletRef(), [boldRun("Header:"), bodyRun(" Logo aplikasi, tagline \u201cAll-in-One XML Converter untuk Coretax DJP\u201d, dan tombol CTA \u201cMulai Konversi\u201d.")]),
  bulletItem(newBulletRef(), [boldRun("Hero Section:"), bodyRun(" Ilustrasi sederhana workflow (Import \u2192 Convert \u2192 Download), headline bold, dan badge \u201c100% Client-Side, Zero Data Transmission\u201d.")]),
  bulletItem(newBulletRef(), [boldRun("Feature Grid:"), bodyRun(" 3\u20134 card fitur utama: Privacy-First, 35 Template Support, 3 Input Methods, Batch Processing.")]),
  bulletItem(newBulletRef(), [boldRun("How It Works:"), bodyRun(" 4 langkah visual: (1) Pilih Template, (2) Import Data, (3) Review & Validate, (4) Download XML.")]),
  bulletItem(newBulletRef(), [boldRun("Footer:"), bodyRun(" Link ke dokumentasi, GitHub repo, disclaimer, dan versi aplikasi.")]),
  
  heading2("8.2 Template Selection Page"),
  bodyP("Halaman utama pemilihan template. Grid layout dengan filter dan search."),
  bulletItem(newBulletRef(), [boldRun("Top Bar:"), bodyRun(" Search input, filter dropdown (kategori), sort dropdown (popularitas/abjad/update).")]),
  bulletItem(newBulletRef(), [boldRun("Category Tabs:"), bodyRun(" Tab horizontal untuk 7 kategori. Setiap tab menampilkan badge jumlah template.")]),
  bulletItem(newBulletRef(), [boldRun("Template Grid:"), bodyRun(" Card grid 3 kolom (desktop) / 1 kolom (mobile). Setiap card: icon, nama template, kode, tanggal update, badge popularitas.")]),
  bulletItem(newBulletRef(), [boldRun("Quick Info Panel:"), bodyRun(" Panel samping yang muncul saat card diklik, menampilkan deskripsi lengkap, field yang dibutuhkan, dan link ke template DJP resmi.")]),
  
  heading2("8.3 Import Page"),
  bodyP("Halaman untuk mengimpor data ke dalam sistem."),
  bulletItem(newBulletRef(), [boldRun("Template Info Bar:"), bodyRun(" Nama template yang dipilih, icon kategori, dan breadcrumb navigasi.")]),
  bulletItem(newBulletRef(), [boldRun("Tab Input Methods:"), bodyRun(" 3 tab: Upload File, Paste Data, Input Manual. Active tab highlighted.")]),
  bulletItem(newBulletRef(), [boldRun("Upload Area (Tab 1):"), bodyRun(" Drop zone besar dengan dashed border. Drag file atau klik untuk browse. Progress bar saat upload. Preview ringkas tabel.")]),
  bulletItem(newBulletRef(), [boldRun("Paste Area (Tab 2):"), bodyRun(" Textarea monospace. Info hint: \u201cPaste dari Excel (Ctrl+C dari Excel, Ctrl+V di sini)\u201d. Tombol Parse.")]),
  bulletItem(newBulletRef(), [boldRun("Form Area (Tab 3):"), bodyRun(" Dynamic form fields berdasarkan template. Grouped sections. Tombol Tambah Baris.")]),
  bulletItem(newBulletRef(), [boldRun("Next Button:"), bodyRun(" Tombol besar \u201cLanjut ke Editor\u201d yang enabled setelah data berhasil diimport.")]),
  
  heading2("8.4 Data Editor Page"),
  bodyP("Halaman editor data spreadsheet-like. Ini adalah halaman terpenting di mana pengguna mengedit dan memvalidasi data."),
  bulletItem(newBulletRef(), [boldRun("Toolbar:"), bodyRun(" Undo, Redo, Tambah Baris, Hapus Baris, Auto-Format, Validate, Clear. Dropdown template info.")]),
  bulletItem(newBulletRef(), [boldRun("Data Table:"), bodyRun(" Spreadsheet interaktif. Column headers sesuai template. Sortable columns. Resizable columns. Fixed header row.")]),
  bulletItem(newBulletRef(), [boldRun("Cell Editor:"), bodyRun(" Inline editing on double-click. Input masking per tipe data. Error indicator on invalid cells.")]),
  bulletItem(newBulletRef(), [boldRun("Status Bar:"), bodyRun(" Total rows, jumlah error, jumlah warning. Progress indicator validasi.")]),
  bulletItem(newBulletRef(), [boldRun("Navigation Buttons:"), bodyRun(" \u201cKembali ke Import\u201d dan \u201cLanjut ke Preview XML\u201d.")]),
  
  heading2("8.5 Preview Page"),
  bodyP("Halaman preview XML dengan layout split view."),
  bulletItem(newBulletRef(), [boldRun("Split Layout:"), bodyRun(" 50/50 horizontal split. Panel kiri: Data Table (read-only, scrollable). Panel kanan: XML Viewer (syntax highlighted).")]),
  bulletItem(newBulletRef(), [boldRun("Sync Scroll:"), bodyRun(" Scroll synchronization antara kedua panel. Click baris data highlights XML element terkait.")]),
  bulletItem(newBulletRef(), [boldRun("XML Viewer Features:"), bodyRun(" Line numbers, syntax highlighting, collapsible elements, search dalam XML.")]),
  bulletItem(newBulletRef(), [boldRun("Validation Panel:"), bodyRun(" Panel bawah menampilkan list error dan warning. Click error untuk jump ke element terkait.")]),
  bulletItem(newBulletRef(), [boldRun("Action Buttons:"), bodyRun(" \u201cKembali ke Editor\u201d dan \u201cDownload XML\u201d.")]),
  
  heading2("8.6 Download Page"),
  bodyP("Halaman terakhir yang menampilkan konfirmasi dan opsi download."),
  bulletItem(newBulletRef(), [boldRun("Success State:"), bodyRun(" Ikon centang hijau, pesan sukses, ringkasan: jumlah record, template yang digunakan, ukuran file.")]),
  bulletItem(newBulletRef(), [boldRun("Download Options:"), bodyRun(" Tombol besar \u201cDownload XML\u201d, \u201cDownload ZIP\u201d (jika batch), \u201cCopy to Clipboard\u201d.")]),
  bulletItem(newBulletRef(), [boldRun("Action Options:"), bodyRun(" \u201cConvert Data Lain\u201d (kembali ke template selection), \u201cStart Over\u201d.")]),
  bulletItem(newBulletRef(), [boldRun("Info Box:"), bodyRun(" Panduan langkah selanjutnya: \u201cUpload file XML ini ke Coretax DJP melalui pajak.go.id\u201d.")]),
];

// --- 9. Validation Rules ---
const section9 = [
  heading1("9. Aturan Validasi"),
  bodyP("Sistem validasi merupakan komponen kritis yang memastikan data yang dikonversi ke XML sesuai dengan spesifikasi DJP Coretax. Berikut adalah aturan validasi yang akan diimplementasikan."),
  
  heading2("9.1 Validasi NPWP"),
  makeTable(
    ["Aturan", "Detail", "Pesan Error"],
    [
      ["Panjang digit", "Harus tepat 15 digit angka", "NPWP harus terdiri dari 15 digit angka"],
      ["Digit pertama", "Harus 0, 1, 2, atau 3", "Digit pertama NPWP harus 0, 1, 2, atau 3"],
      ["Format", "Hanya angka, tanpa spasi/titik/dash", "NPWP hanya boleh berisi angka"],
      ["Nihil", "Diperbolehkan: 000000000000000", "\u2014"],
      ["Validasi algoritma", "Digit ke-10 dan ke-12 harus mengikuti formula mod 10", "NPWP tidak valid berdasarkan algoritma DJP"],
    ],
    [2200, 3800, 3360]
  ),
  tableCaption("Tabel 9.1 \u2014 Aturan Validasi NPWP"),
  
  heading2("9.2 Validasi Angka dan Mata Uang"),
  makeTable(
    ["Aturan", "Detail", "Pesan Error"],
    [
      ["Non-negatif", "Nilai harus >= 0", "Nilai tidak boleh negatif"],
      ["Desimal maks", "Maks 2 digit desimal", "Nilai tidak boleh lebih dari 2 desimal"],
      ["Pemisah ribuan", "Gunakan titik (.) sebagai pemisah ribuan", "Gunakan format angka yang valid"],
      ["Pemisah desimal", "Gunakan koma (,) sebagai pemisah desimal", "Gunakan koma untuk desimal"],
      ["Batas maksimal", "Varies per field (misal: DPP maks 99.999.999.999.999)", "Nilai melebihi batas maksimum untuk field ini"],
    ],
    [2200, 3800, 3360]
  ),
  tableCaption("Tabel 9.2 \u2014 Aturan Validasi Angka dan Mata Uang"),
  
  heading2("9.3 Validasi Tanggal"),
  makeTable(
    ["Aturan", "Detail", "Pesan Error"],
    [
      ["Format", "DD/MM/YYYY atau YYYY-MM-DD", "Format tanggal harus DD/MM/YYYY atau YYYY-MM-DD"],
      ["Bulan valid", "01\u201312", "Bulan harus antara 01-12"],
      ["Hari valid", "Sesuai bulan (termasuk tahun kabisat)", "Tanggal tidak valid untuk bulan tersebut"],
      ["Masa pajak", "01\u201312", "Masa pajak harus antara 01-12"],
      ["Tahun", "4 digit, >= 1900", "Tahun harus 4 digit dan >= 1900"],
    ],
    [2200, 3800, 3360]
  ),
  tableCaption("Tabel 9.3 \u2014 Aturan Validasi Tanggal"),
  
  heading2("9.4 Validasi XML"),
  bulletItem(newBulletRef(), [boldRun("Well-formedness:"), bodyRun(" Memastikan XML yang dihasilkan well-formed (semua tag ditutup, attribute ter-quote, encoding benar).")]),
  bulletItem(newBulletRef(), [boldRun("Required Elements:"), bodyRun(" Setiap elemen yang required harus ada dan tidak kosong.")]),
  bulletItem(newBulletRef(), [boldRun("Data Type Check:"), bodyRun(" Value dalam XML harus sesuai tipe data yang didefinisikan dalam schema.")]),
  bulletItem(newBulletRef(), [boldRun("Cross-Field Validation:"), bodyRun(" Misalnya: PTKP status PTKP/0 harus 0, jumlah PPh tidak boleh melebihi bruto.")]),
  bulletItem(newBulletRef(), [boldRun("Namespace Validation:"), bodyRun(" Root element harus memiliki namespace yang benar sesuai template.")]),
];

// --- 10. Security & Privacy ---
const section10 = [
  heading1("10. Keamanan & Privasi"),
  bodyP("Keamanan data perpajakan merupakan prioritas utama dalam pengembangan produk ini. Berikut adalah strategi keamanan yang akan diimplementasikan."),
  
  heading2("10.1 Zero Server-Side Data Storage"),
  bodyP("Seluruh pemrosesan data terjadi di sisi klien (browser). Server hanya menyajikan file statis (HTML, CSS, JavaScript). Tidak ada database, tidak ada API endpoint yang menerima data, dan tidak ada server-side processing. Ini berarti bahkan jika server diretas, tidak ada data pengguna yang dapat dicuri."),
  
  heading2("10.2 No Cookies / LocalStorage untuk Data Sensitif"),
  bodyP("Data yang diinput pengguna (NPWP, penghasilan, transaksi) tidak disimpan di cookies, localStorage, sessionStorage, atau IndexedDB. Data hanya hidup dalam memory browser selama sesi aktif. Ketika pengguna menutup tab atau navigasi ke halaman lain, semua data di memory akan di-clear oleh garbage collector JavaScript."),
  
  heading2("10.3 Content Security Policy (CSP)"),
  bodyP("Aplikasi akan mengimplementasikan header CSP yang ketat untuk mencegah serangan XSS (Cross-Site Scripting) dan injeksi kode berbahaya. CSP akan membatasi sumber script, style, dan resource yang boleh dimuat oleh browser."),
  codeBlock("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"),
  
  heading2("10.4 Web Worker untuk Non-Blocking Processing"),
  bodyP("Pemrosesan berat (parsing file Excel besar, validasi batch, generasi XML untuk ratusan record) akan dilakukan di dalam Web Worker. Ini memastikan bahwa UI tetap responsif selama pemrosesan berlangsung, dan juga menyediakan isolasi memory yang lebih baik."),
  
  heading2("10.5 Open Source untuk Community Audit"),
  bodyP("Kode sumber aplikasi akan dipublikasikan secara terbuka di GitHub dengan lisensi MIT. Hal ini memungkinkan komunitas perpajakan Indonesia, developer, dan security researcher untuk melakukan audit keamanan secara independen. Transparansi ini merupakan keunggulan kompetitif dibandingkan converter DJP yang berbasis VBA tertutup."),
];

// --- 11. Implementation Roadmap ---
const section11 = [
  heading1("11. Roadmap Implementasi"),
  bodyP("Pengembangan Coretax XML Converter akan dilakukan dalam 4 fase selama total 14 minggu. Setiap fase memiliki deliverable yang jelas dan dapat digunakan oleh pengguna."),
  
  heading2("11.1 Fase 1: MVP (Minggu 1\u20134)"),
  makeTable(
    ["Item", "Detail", "Prioritas"],
    [
      ["Infrastruktur Core", "Setup project Next.js, Tailwind, shadcn/ui, base layout", "Tinggi"],
      ["Template Selection Page", "Grid layout 7 kategori, 35 template cards, search/filter", "Tinggi"],
      ["File Upload & Parsing", "Upload .xlsx/.xls/.csv, parsing dengan SheetJS/PapaParse", "Tinggi"],
      ["Data Editor (Basic)", "Tabel view, inline edit, add/delete rows, sort columns", "Tinggi"],
      ["XML Generator \u2014 BPMP", "Schema mapper BPMP, XML generation, download .xml", "Tinggi"],
      ["XML Generator \u2014 BP21", "Schema mapper BP21, XML generation, download .xml", "Tinggi"],
      ["XML Generator \u2014 BPA1", "Schema mapper BPA1, XML generation, download .xml", "Tinggi"],
      ["XML Generator \u2014 Faktur PK", "Schema mapper Faktur Keluaran, XML generation", "Tinggi"],
      ["XML Generator \u2014 Lampiran C", "Schema mapper Lampiran C, XML generation", "Tinggi"],
      ["Basic Validation", "NPWP format, required fields, number ranges", "Tinggi"],
      ["XML Preview", "Syntax highlighting, basic viewer", "Sedang"],
    ],
    [2400, 4760, 2200]
  ),
  tableCaption("Tabel 11.1 \u2014 Roadmap Fase 1: MVP (4 Minggu)"),
  
  heading2("11.2 Fase 2: Template Expansion (Minggu 5\u20138)"),
  makeTable(
    ["Item", "Detail", "Prioritas"],
    [
      ["Bupot Templates (5 remaining)", "BPA2, BP26, BPNR, BPCY, DDBU", "Tinggi"],
      ["PP 23/26 Templates", "BPPU, BPSP", "Tinggi"],
      ["e-Faktur Templates", "Retur PM, Dok Lain Keluaran/Masukan, Retur Dok Lain, PMSE, Domestik", "Tinggi"],
      ["SPT Masa PPN Templates", "SPT PPN Digunggung, DRKB, Retail XML", "Sedang"],
      ["Paste Data Input", "Clipboard paste, auto-detect delimiter", "Sedang"],
      ["Manual Input Forms", "Dynamic forms per template, input masking", "Sedang"],
      ["Advanced Validation", "Cross-field validation, custom rules per template", "Sedang"],
    ],
    [2400, 4760, 2200]
  ),
  tableCaption("Tabel 11.2 \u2014 Roadmap Fase 2: Template Expansion (4 Minggu)"),
  
  heading2("11.3 Fase 3: Advanced Features (Minggu 9\u201312)"),
  makeTable(
    ["Item", "Detail", "Prioritas"],
    [
      ["SPT Tahunan Badan", "Lampiran 9, 10A, 11A (4 template)", "Sedang"],
      ["SPT Tahunan OP", "Lampiran 3C, 3D (4 template)", "Sedang"],
      ["SPT Bea Meterai", "Lampiran 3, 4 (2 template)", "Sedang"],
      ["Daftar Harta OP", "Template Daftar Harta", "Rendah"],
      ["Batch Processing", "Multiple file upload, batch convert, ZIP download", "Tinggi"],
      ["Web Worker Integration", "Non-blocking processing for large datasets", "Sedang"],
      ["Side-by-Side Preview", "Split view data table + XML with sync scroll", "Sedang"],
    ],
    [2400, 4760, 2200]
  ),
  tableCaption("Tabel 11.3 \u2014 Roadmap Fase 3: Advanced Features (4 Minggu)"),
  
  heading2("11.4 Fase 4: Polish & Deploy (Minggu 13\u201314)"),
  makeTable(
    ["Item", "Detail", "Prioritas"],
    [
      ["UI Polish", "Responsive design final, animations, loading states", "Tinggi"],
      ["Error Handling", "Graceful error handling, user-friendly error messages", "Tinggi"],
      ["Testing", "Cross-browser testing (Chrome, Firefox, Safari, Edge)", "Tinggi"],
      ["Performance", "Bundle optimization, lazy loading, code splitting", "Sedang"],
      ["Deployment", "Deploy ke Vercel/CF Pages, custom domain, HTTPS", "Tinggi"],
      ["Documentation", "User guide, FAQ, video tutorial", "Sedang"],
      ["Open Source Release", "GitHub repo setup, README, CONTRIBUTING guide", "Sedang"],
    ],
    [2400, 4760, 2200]
  ),
  tableCaption("Tabel 11.4 \u2014 Roadmap Fase 4: Polish & Deploy (2 Minggu)"),
];

// --- 12. Reference Links ---
const section12 = [
  heading1("12. Tautan Referensi"),
  bodyP("Berikut adalah tautan-tautan referensi yang relevan untuk pengembangan dan pemahaman konteks produk ini."),
  
  heading2("12.1 Referensi Resmi DJP"),
  bulletItem(newBulletRef(), [boldRun("Template XML & Converter Excel-ke-XML:"), bodyRun("")]),
  new Paragraph({
    spacing: { line: LINE_SPACING, after: 100 },
    indent: { left: 720 },
    children: [new ExternalHyperlink({
      children: [new TextRun({ text: "https://www.pajak.go.id/id/reformdjp/coretax/template-xml-dan-converter-excel-ke-xml", style: "Hyperlink", font: FONT_BODY, size: BODY_SIZE })],
      link: "https://www.pajak.go.id/id/reformdjp/coretax/template-xml-dan-converter-excel-ke-xml",
    })],
  }),
  bulletItem(newBulletRef(), [boldRun("PER-11/PJ/2025:"), bodyRun(" Peraturan Direktur Jenderal Pajak tentang Format SPT, Bukti Pemotongan, dan Faktur Pajak era Coretax.")]),
  bulletItem(newBulletRef(), [boldRun("Portal Coretax DJP:"), bodyRun(" https://coretax.pajak.go.id")]),
  
  heading2("12.2 Teknologi & Library"),
  bulletItem(newBulletRef(), [boldRun("SheetJS (xlsx):"), bodyRun(" https://sheetjs.com \u2014 Library parsing Excel di browser.")]),
  bulletItem(newBulletRef(), [boldRun("PapaParse:"), bodyRun(" https://www.papaparse.com \u2014 Library parsing CSV di browser.")]),
  bulletItem(newBulletRef(), [boldRun("Next.js:"), bodyRun(" https://nextjs.org \u2014 React framework untuk production.")]),
  bulletItem(newBulletRef(), [boldRun("shadcn/ui:"), bodyRun(" https://ui.shadcn.com \u2014 Component library berbasis Radix UI.")]),
  bulletItem(newBulletRef(), [boldRun("JSZip:"), bodyRun(" https://stuk.github.io/jszip/ \u2014 Library untuk membuat file ZIP di browser.")]),
  
  heading2("12.3 Sumber Belajar Perpajakan"),
  bulletItem(newBulletRef(), [boldRun("DDTC:"), bodyRun(" https://perpajakan.ddtc.co.id \u2014 Database sumber hukum perpajakan.")]),
  bulletItem(newBulletRef(), [boldRun("Ortax:"), bodyRun(" https://datacenter.ortax.org \u2014 Database aturan pajak Indonesia.")]),
  bulletItem(newBulletRef(), [boldRun("Peraturan.go.id:"), bodyRun(" https://peraturan.go.id \u2014 Portal peraturan pemerintah Indonesia.")]),
];

// --- 13. Appendix: XML Schema Examples ---
const section13 = [
  heading1("13. Lampiran: Contoh Skema XML Lengkap"),
  bodyP("Bagian ini menyajikan contoh lengkap struktur XML untuk tiga template utama yang akan didukung oleh converter. Contoh-contoh ini berdasarkan analisis terhadap file template resmi DJP."),
  
  heading2("13.1 BPMP \u2014 Struktur XML Lengkap"),
  bodyP("Berikut adalah contoh lengkap file XML BPMP yang dihasilkan oleh converter untuk data 2 pegawai tetap. Contoh ini mencakup seluruh elemen yang diperlukan oleh sistem Coretax DJP."),
  codeBlock("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"),
  codeBlock("<BPMP xmlns=\"http://www.djp.go.id/xml/bpmp\">"),
  codeBlock("  <Header>"),
  codeBlock("    <KdForm>1721-A1</KdForm>"),
  codeBlock("    <KdAsalBuktiPotong>1</KdAsalBuktiPotong>"),
  codeBlock("    <NpwpPengurus>012345678901000</NpwpPengurus>"),
  codeBlock("    <NamaPengurus>PT MAJU BERSAMA SEJAHTERA</NamaPengurus>"),
  codeBlock("    <AlamatPengurus>Jl. Sudirman No. 123, Jakarta Pusat</AlamatPengurus>"),
  codeBlock("    <MasaPajak>06</MasaPajak>"),
  codeBlock("    <TahunPajak>2025</TahunPajak>"),
  codeBlock("    <PembetulanKe>0</PembetulanKe>"),
  codeBlock("    <JmlPegawai>2</JmlPegawai>"),
  codeBlock("    <JmlBuktiPotong>2</JmlBuktiPotong>"),
  codeBlock("    <PenghasilanBrutoTotal>30000000.00</PenghasilanBrutoTotal>"),
  codeBlock("    <PphDipotongTotal>1440000.00</PphDipotongTotal>"),
  codeBlock("  </Header>"),
  codeBlock("  <DetailBuktiPotong>"),
  codeBlock("    <BuktiPotong>"),
  codeBlock("      <NpwpPenerima>987654321098000</NpwpPenerima>"),
  codeBlock("      <NamaPenerima>Andi Wijaya</NamaPenerima>"),
  codeBlock("      <StatusPtkp>TK/1</StatusPtkp>"),
  codeBlock("      <PenghasilanBruto>15000000.00</PenghasilanBruto>"),
  codeBlock("      <BiayaJabatan>375000.00</BiayaJabatan>"),
  codeBlock("      <IuranPensiun>600000.00</IuranPensiun>"),
  codeBlock("      <Ptkp>5400000.00</Ptkp>"),
  codeBlock("      <PenghasilanNeto>14025000.00</PenghasilanNeto>"),
  codeBlock("      <PphDipotong>720000.00</PphDipotong>"),
  codeBlock("    </BuktiPotong>"),
  codeBlock("    <BuktiPotong>"),
  codeBlock("      <NpwpPenerima>876543210987000</NpwpPenerima>"),
  codeBlock("      <NamaPenerima>Sari Dewi</NamaPenerima>"),
  codeBlock("      <StatusPtkp>K/0</StatusPtkp>"),
  codeBlock("      <PenghasilanBruto>15000000.00</PenghasilanBruto>"),
  codeBlock("      <BiayaJabatan>375000.00</BiayaJabatan>"),
  codeBlock("      <IuranPensiun>600000.00</IuranPensiun>"),
  codeBlock("      <Ptkp>6750000.00</Ptkp>"),
  codeBlock("      <PenghasilanNeto>14025000.00</PenghasilanNeto>"),
  codeBlock("      <PphDipotong>720000.00</PphDipotong>"),
  codeBlock("    </BuktiPotong>"),
  codeBlock("  </DetailBuktiPotong>"),
  codeBlock("</BPMP>"),
  
  heading2("13.2 Faktur Pajak Keluaran \u2014 Struktur XML Lengkap"),
  bodyP("Contoh lengkap Faktur Pajak Keluaran untuk penjualan 2 jenis barang:"),
  codeBlock("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"),
  codeBlock("<FakturPajak xmlns=\"http://www.djp.go.id/xml/fakturpajak\">"),
  codeBlock("  <KdFaktur>07</KdFaktur>"),
  codeBlock("  <NoFaktur>010000000000007</NoFaktur>"),
  codeBlock("  <TglFaktur>2025-06-15</TglFaktur>"),
  codeBlock("  <NpwpPenjual>012345678901000</NpwpPenjual>"),
  codeBlock("  <NamaPenjual>PT MAJU BERSAMA SEJAHTERA</NamaPenjual>"),
  codeBlock("  <AlamatPenjual>Jl. Sudirman No. 123, Jakarta</AlamatPenjual>"),
  codeBlock("  <NpwpPembeli>987654321098000</NpwpPembeli>"),
  codeBlock("  <NamaPembeli>CV Teknologi Mandiri</NamaPembeli>"),
  codeBlock("  <AlamatPembeli>Jl. Gatot Subroto No. 45, Bandung</AlamatPembeli>"),
  codeBlock("  <IsCreditNote>0</IsCreditNote>"),
  codeBlock("  <DetailBarang>"),
  codeBlock("    <Barang>"),
  codeBlock("      <NamaBarang>Laptop ASUS ROG Strix G16</NamaBarang>"),
  codeBlock("      <HargaSatuan>25000000.00</HargaSatuan>"),
  codeBlock("      <JumlahBarang>2.00</JumlahBarang>"),
  codeBlock("      <HargaTotal>50000000.00</HargaTotal>"),
  codeBlock("      <Diskon>0.00</Diskon>"),
  codeBlock("      <Dpp>50000000.00</Dpp>"),
  codeBlock("      <Ppn>5000000.00</Ppn>"),
  codeBlock("      <PpnBm>0.00</PpnBm>"),
  codeBlock("    </Barang>"),
  codeBlock("    <Barang>"),
  codeBlock("      <NamaBarang>Monitor LG UltraWide 34 inch</NamaBarang>"),
  codeBlock("      <HargaSatuan>8500000.00</HargaSatuan>"),
  codeBlock("      <JumlahBarang>5.00</JumlahBarang>"),
  codeBlock("      <HargaTotal>42500000.00</HargaTotal>"),
  codeBlock("      <Diskon>0.00</Diskon>"),
  codeBlock("      <Dpp>42500000.00</Dpp>"),
  codeBlock("      <Ppn>4250000.00</Ppn>"),
  codeBlock("      <PpnBm>0.00</PpnBm>"),
  codeBlock("    </Barang>"),
  codeBlock("  </DetailBarang>"),
  codeBlock("  <JmlDpp>92500000.00</JmlDpp>"),
  codeBlock("  <JmlPpn>9250000.00</JmlPpn>"),
  codeBlock("  <JmlPpnBm>0.00</JmlPpnBm>"),
  codeBlock("</FakturPajak>"),
  
  heading2("13.3 Lampiran C SPT Masa PPN \u2014 Struktur XML Lengkap"),
  bodyP("Contoh Lampiran C untuk SPT Masa PPN Juni 2025 dengan 3 transaksi:"),
  codeBlock("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"),
  codeBlock("<LampiranC xmlns=\"http://www.djp.go.id/xml/sptmasappn\">"),
  codeBlock("  <Header>"),
  codeBlock("    <Npwp>012345678901000</Npwp>"),
  codeBlock("    <Nama>PT MAJU BERSAMA SEJAHTERA</Nama>"),
  codeBlock("    <Alamat>Jl. Sudirman No. 123, Jakarta Pusat</Alamat>"),
  codeBlock("    <Masa>06</Masa>"),
  codeBlock("    <Tahun>2025</Tahun>"),
  codeBlock("    <PembetulanKe>0</PembetulanKe>"),
  codeBlock("  </Header>"),
  codeBlock("  <DaftarTransaksi>"),
  codeBlock("    <Transaksi>"),
  codeBlock("      <JenisDokumen>Faktur Pajak Keluaran</JenisDokumen>"),
  codeBlock("      <NoDokumen>010000000000007</NoDokumen>"),
  codeBlock("      <TanggalDokumen>2025-06-15</TanggalDokumen>"),
  codeBlock("      <NpwpLawanTransaksi>987654321098000</NpwpLawanTransaksi>"),
  codeBlock("      <NamaLawanTransaksi>CV Teknologi Mandiri</NamaLawanTransaksi>"),
  codeBlock("      <Dpp>92500000.00</Dpp>"),
  codeBlock("      <Ppn>9250000.00</Ppn>"),
  codeBlock("      <PpnBm>0.00</PpnBm>"),
  codeBlock("    </Transaksi>"),
  codeBlock("    <Transaksi>"),
  codeBlock("      <JenisDokumen>Faktur Pajak Keluaran</JenisDokumen>"),
  codeBlock("      <NoDokumen>010000000000008</NoDokumen>"),
  codeBlock("      <TanggalDokumen>2025-06-20</TanggalDokumen>"),
  codeBlock("      <NpwpLawanTransaksi>112233445566000</NpwpLawanTransaksi>"),
  codeBlock("      <NamaLawanTransaksi>PT Global Sentosa</NamaLawanTransaksi>"),
  codeBlock("      <Dpp>35000000.00</Dpp>"),
  codeBlock("      <Ppn>3500000.00</Ppn>"),
  codeBlock("      <PpnBm>0.00</PpnBm>"),
  codeBlock("    </Transaksi>"),
  codeBlock("  </DaftarTransaksi>"),
  codeBlock("  <Ringkasan>"),
  codeBlock("    <JmlDppFakturKeluaran>127500000.00</JmlDppFakturKeluaran>"),
  codeBlock("    <JmlPpnFakturKeluaran>12750000.00</JmlPpnFakturKeluaran>"),
  codeBlock("    <JmlPpnBmFakturKeluaran>0.00</JmlPpnBmFakturKeluaran>"),
  codeBlock("  </Ringkasan>"),
  codeBlock("</LampiranC>"),
  
  heading2("13.4 Mapping Data Excel ke XML"),
  bodyP("Berikut adalah contoh mapping kolom Excel ke elemen XML untuk template BPMP:"),
  makeTable(
    ["Kolom Excel", "Elemen XML", "Tipe Data", "Validasi"],
    [
      ["NPWP Pemotong", "/BPMP/Header/NpwpPengurus", "String(15)", "15 digit, mulai 0-3"],
      ["Nama Pemotong", "/BPMP/Header/NamaPengurus", "String(100)", "Required, max 100 char"],
      ["Masa Pajak", "/BPMP/Header/MasaPajak", "String(2)", "01-12"],
      ["Tahun Pajak", "/BPMP/Header/TahunPajak", "String(4)", "4 digit >= 1900"],
      ["NPWP Pegawai", "/BPMP/DetailBuktiPotong/BuktiPotong/NpwpPenerima", "String(15)", "15 digit, mulai 0-3"],
      ["Nama Pegawai", "/BPMP/DetailBuktiPotong/BuktiPotong/NamaPenerima", "String(100)", "Required"],
      ["Status PTKP", "/BPMP/DetailBuktiPotong/BuktiPotong/StatusPtkp", "String(5)", "TK/0, TK/1, K/0, K/1, K/2, K/3"],
      ["Bruto", "/BPMP/DetailBuktiPotong/BuktiPotong/PenghasilanBruto", "Decimal", "Non-negatif, 2 desimal"],
      ["Biaya Jabatan", "/BPMP/DetailBuktiPotong/BuktiPotong/BiayaJabatan", "Decimal", "Non-negatif, 2 desimal"],
      ["PTKP", "/BPMP/DetailBuktiPotong/BuktiPotong/Ptkp", "Decimal", "Non-negatif, 2 desimal"],
      ["PPh Dipotong", "/BPMP/DetailBuktiPotong/BuktiPotong/PphDipotong", "Decimal", "Non-negatif, 2 desimal"],
    ],
    [2200, 3400, 1600, 2160]
  ),
  tableCaption("Tabel 13.1 \u2014 Mapping Kolom Excel ke Elemen XML untuk BPMP"),
];

// ====================================================================
// BACK COVER
// ====================================================================
const backCoverSection = {
  properties: {
    page: {
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    },
  },
  children: [
    emptyP(4000),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", font: FONT_BODY, size: 20, color: C.accentLine })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: "PRD: Coretax XML Converter \u2014 All-in-One", font: FONT_HEADING, size: 32, color: C.primary, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Versi 1.0 | Juni 2025", font: FONT_BODY, size: 22, color: C.secondary })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", font: FONT_BODY, size: 20, color: C.accentLine })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Dokumen ini bersifat rahasia dan hanya untuk keperluan pengembangan internal.", font: FONT_BODY, size: 18, color: C.accent })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Dilarang mendistribusikan tanpa izin tertulis.", font: FONT_BODY, size: 18, color: C.accent })],
    }),
  ],
};

// ====================================================================
// ASSEMBLE DOCUMENT
// ====================================================================
const mainSection = {
  properties: {
    page: {
      margin: { top: 1800, bottom: 1440, left: 1440, right: 1440 },
    },
  },
  headers: {
    default: new Header({
      children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "PRD: Coretax XML Converter \u2014 All-in-One", font: FONT_BODY, size: 16, color: C.accent })],
      })],
    }),
  },
  footers: {
    default: new Footer({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "\u2014 ", font: FONT_BODY, size: 18, color: C.secondary }),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT_BODY, size: 18, color: C.secondary }),
          new TextRun({ text: " \u2014", font: FONT_BODY, size: 18, color: C.secondary }),
        ],
      })],
    }),
  },
  children: [
    ...section1,
    ...section2,
    ...section3,
    ...section4,
    ...section5,
    ...section6,
    ...section7,
    ...section8,
    ...section9,
    ...section10,
    ...section11,
    ...section12,
    ...section13,
  ],
};

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT_BODY, size: BODY_SIZE, color: C.body },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: H1_SIZE, bold: true, color: C.primary, font: FONT_HEADING },
        paragraph: { spacing: { before: 600, after: 300, line: LINE_SPACING }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: H2_SIZE, bold: true, color: C.primary, font: FONT_HEADING },
        paragraph: { spacing: { before: 400, after: 200, line: LINE_SPACING }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: H3_SIZE, bold: true, color: C.body, font: FONT_HEADING },
        paragraph: { spacing: { before: 300, after: 150, line: LINE_SPACING }, outlineLevel: 2 },
      },
    ],
  },
  numbering: { config: numberingConfig },
  sections: [coverSection, tocSection, mainSection, backCoverSection],
});

// Generate DOCX
const OUTPUT = "/home/z/my-project/download/PRD_Coretax_XML_Converter.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUTPUT, buffer);
  console.log("Document generated:", OUTPUT);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
