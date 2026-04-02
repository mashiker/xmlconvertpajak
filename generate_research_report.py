import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import cm, inch
from reportlab.platypus import (
    Paragraph, Spacer, Table, TableStyle, PageBreak, Image
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.platypus import SimpleDocTemplate
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Font registration
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('Calibri', '/usr/share/fonts/truetype/english/calibri-regular.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))

registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')
registerFontFamily('Calibri', normal='Calibri', bold='Calibri')

# Colors
EMERALD = colors.HexColor('#059669')
DARK = colors.HexColor('#0f172a')
GRAY = colors.HexColor('#64748b')
LIGHT_GRAY = colors.HexColor('#f1f5f9')
TABLE_HEADER = colors.HexColor('#1F4E79')
TABLE_ODD = colors.HexColor('#F5F5F5')

# Styles
cover_title = ParagraphStyle('CoverTitle', fontName='Times New Roman', fontSize=36, leading=44, alignment=TA_CENTER, textColor=DARK, spaceAfter=24)
cover_sub = ParagraphStyle('CoverSub', fontName='Calibri', fontSize=16, leading=22, alignment=TA_CENTER, textColor=GRAY, spaceAfter=12)
cover_info = ParagraphStyle('CoverInfo', fontName='Calibri', fontSize=12, leading=18, alignment=TA_CENTER, textColor=GRAY)

h1 = ParagraphStyle('H1', fontName='Times New Roman', fontSize=20, leading=26, textColor=DARK, spaceBefore=18, spaceAfter=12)
h2 = ParagraphStyle('H2', fontName='Times New Roman', fontSize=15, leading=20, textColor=DARK, spaceBefore=14, spaceAfter=8)
h3 = ParagraphStyle('H3', fontName='Times New Roman', fontSize=12, leading=16, textColor=DARK, spaceBefore=10, spaceAfter=6)

body = ParagraphStyle('Body', fontName='Calibri', fontSize=10.5, leading=17, alignment=TA_JUSTIFY, spaceAfter=6)
body_bold = ParagraphStyle('BodyBold', fontName='Calibri', fontSize=10.5, leading=17, alignment=TA_JUSTIFY, spaceAfter=6, textColor=DARK)
bullet = ParagraphStyle('Bullet', fontName='Calibri', fontSize=10.5, leading=17, alignment=TA_LEFT, spaceAfter=4, leftIndent=20, bulletIndent=8)

tbl_header = ParagraphStyle('TblH', fontName='Times New Roman', fontSize=10, leading=14, alignment=TA_CENTER, textColor=colors.white)
tbl_cell = ParagraphStyle('TblC', fontName='Calibri', fontSize=9.5, leading=14, alignment=TA_CENTER)
tbl_cell_left = ParagraphStyle('TblCL', fontName='Calibri', fontSize=9.5, leading=14, alignment=TA_LEFT)

caption_style = ParagraphStyle('Caption', fontName='Calibri', fontSize=9, leading=13, alignment=TA_CENTER, textColor=GRAY, spaceBefore=4, spaceAfter=6)

# TOC styles
toc_h1 = ParagraphStyle('TOCH1', fontName='Times New Roman', fontSize=13, leftIndent=20, leading=22)
toc_h2 = ParagraphStyle('TOCH2', fontName='Times New Roman', fontSize=11, leftIndent=40, leading=18)

class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            self.notify('TOCEntry', (level, text, self.page))

def heading(text, style, level=0):
    p = Paragraph(f'<b>{text}</b>', style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    return p

def make_table(headers, rows, col_widths):
    data = [[Paragraph(f'<b>{h}</b>', tbl_header) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), tbl_cell_left if i == 0 else tbl_cell) for i, c in enumerate(row)])
    t = Table(data, colWidths=col_widths)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    for i in range(1, len(data)):
        bg = colors.white if i % 2 == 1 else TABLE_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

# Build
output = '/home/z/my-project/download/Riset_Spreadsheet_XML_Converter.pdf'
doc = TocDocTemplate(output, pagesize=A4,
    topMargin=2*cm, bottomMargin=2*cm, leftMargin=2.2*cm, rightMargin=2.2*cm,
    title='Riset_Spreadsheet_XML_Converter', author='Z.ai', creator='Z.ai',
    subject='Riset mendalam implementasi spreadsheet/Excel-like interface untuk Coretax XML Converter')

story = []

# Cover Page
story.append(Spacer(1, 100))
story.append(Paragraph('<b>Spreadsheet-Based Data Entry</b>', cover_title))
story.append(Spacer(1, 12))
story.append(Paragraph('<b>Riset Mendalam untuk Coretax XML Converter</b>', cover_sub))
story.append(Spacer(1, 36))
story.append(Paragraph('Analisis komprehensif library, UX pattern, dan rekomendasi implementasi', cover_info))
story.append(Spacer(1, 12))
story.append(Paragraph('Menggantikan form-based input dengan spreadsheet/Excel-like interface', cover_info))
story.append(Spacer(1, 60))
story.append(Paragraph('<b>alatpajak.id</b>', ParagraphStyle('Brand', fontName='Calibri', fontSize=14, alignment=TA_CENTER, textColor=EMERALD)))
story.append(Spacer(1, 8))
story.append(Paragraph('April 2026', cover_info))
story.append(PageBreak())

# TOC
story.append(Paragraph('<b>Daftar Isi</b>', ParagraphStyle('TOCTitle', fontName='Times New Roman', fontSize=20, alignment=TA_LEFT, textColor=DARK)))
story.append(Spacer(1, 12))
toc = TableOfContents()
toc.levelStyles = [toc_h1, toc_h2]
story.append(toc)
story.append(PageBreak())

# 1. EXECUTIVE SUMMARY
story.append(heading('1. Executive Summary', h1, 0))
story.append(Paragraph(
    'Riset ini bertujuan mengevaluasi pendekatan penggantian form-based input dengan spreadsheet/Excel-like interface pada website Coretax XML Converter (alatpajak.id). '
    'Saat ini, website menggunakan wizard formulir bertahap (step-by-step) untuk mengumpulkan data pajak dari pengguna, kemudian mengonversinya ke format XML DJP Coretax. '
    'Pendekatan ini memiliki beberapa keterbatasan: pengalaman pengguna yang kurang familiar bagi akuntan/pajak yang terbiasa bekerja di Excel, '
    'kecepatan input data yang lebih lambat untuk data berulang, dan kesulitan dalam melakukan copy-paste data dari spreadsheet yang sudah ada.', body))
story.append(Paragraph(
    'Dengan mengadopsi spreadsheet-like interface, pengguna dapat langsung mengisi data dalam grid yang mirip Excel, melakukan copy-paste dari file spreadsheet lain, '
    'menggunakan keyboard shortcut untuk navigasi cepat, dan melakukan editing inline tanpa perlu berpindah antar form field. '
    'Riset ini menganalisis 5 library utama, membandingkan fitur, performa, lisensi, dan kesesuaian dengan kebutuhan spesifik XML Converter Coretax.', body))
story.append(Paragraph(
    'Temuan utama: <b>Handsontable</b> adalah pilihan terbaik untuk use case ini karena dukungan validasi sel yang powerful, '
    'integrasi React yang matang, dan kemampuan custom cell renderer yang memungkinkan dropdown, autocomplete, dan format khusus sesuai kebutuhan template pajak. '
    'Alternatif open-source <b>FortuneSheet</b> juga layak dipertimbangkan jika constraint lisensi menjadi pertimbangan utama.', body))

# 2. LIBRARY COMPARISON
story.append(heading('2. Perbandingan Library Spreadsheet', h1, 0))
story.append(heading('2.1 Gambaran Umum Kandidat', h2, 1))
story.append(Paragraph(
    'Berdasarkan riset dari berbagai sumber termasuk GitHub, npm, blog developer, dan forum komunitas, terdapat 5 library utama yang relevan '
    'untuk implementasi spreadsheet-like interface di aplikasi web React/Next.js. Masing-masing memiliki keunggulan dan trade-off yang berbeda '
    'tergantung pada kebutuhan spesifik project. Berikut adalah tabel perbandingan ringkas:', body))
story.append(Spacer(1, 12))

lib_headers = ['Library', 'Stars GitHub', 'Lisensi', 'React Support', 'Bundle Size', 'Kategori']
lib_rows = [
    ['Handsontable', '21.800+', 'Commercial/AGPLv3', 'Official', '~400KB', 'Enterprise Spreadsheet'],
    ['FortuneSheet', '2.100+', 'MIT (Free)', 'Official', '~350KB', 'Full Spreadsheet'],
    ['Univer', '12.700+', 'Apache 2.0', 'Manual', '~500KB+', 'Spreadsheet Framework'],
    ['AG Grid', '14.000+', 'MIT + Enterprise', 'Official', '~300KB', 'Data Grid'],
    ['TanStack Table', '26.000+', 'MIT (Free)', 'Official', '~15KB (headless)', 'Headless Table'],
]
t1 = make_table(lib_headers, lib_rows, [2.5*cm, 2*cm, 2.8*cm, 2*cm, 2*cm, 3.2*cm])
story.append(t1)
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Tabel 1.</b> Perbandingan 5 Library Spreadsheet Teratas (2026)', caption_style))
story.append(Spacer(1, 12))

# 2.2 Handsontable
story.append(heading('2.2 Handsontable - Analisis Mendalam', h2, 1))
story.append(Paragraph(
    'Handsontable adalah library spreadsheet JavaScript yang paling mature dan banyak digunakan di dunia untuk aplikasi bisnis. '
    'Dengan lebih dari 21.800 stars di GitHub dan ribuan implementasi di production, Handsontable telah terbukti handal untuk use case enterprise. '
    'Library ini menawarkan tampilan dan nuansa yang sangat mirip Excel, dengan dukungan penuh untuk in-cell editing, keyboard navigation, '
    'copy-paste dari Excel/Google Sheets, autofill, frozen rows/columns, merge cells, dan fitur spreadsheet standar lainnya.', body))
story.append(Paragraph(
    '<b>Keunggulan utama untuk XML Converter Coretax:</b> Handsontable memiliki sistem validasi sel yang sangat powerful. '
    'Setiap kolom dapat didefinisikan dengan validator khusus (regex, custom function, numeric range, dll). '
    'Sel yang tidak valid otomatis di-highlight dengan warna merah, memberikan feedback visual langsung kepada pengguna. '
    'Ini sangat penting untuk template pajak di mana format data harus tepat (misalnya NPWP harus 15 digit angka, '
    'kode pos harus 5 digit, NIK harus 16 digit, dll). Selain itu, Handsontable mendukung custom cell renderer yang memungkinkan '
    'implementasi dropdown selector untuk field seperti "Jenis Pekerjaan", "Kode Pajak", atau "Status Wajib Pajak".', body))
story.append(Paragraph(
    '<b>Kelemahan:</b> Lisensi komersial. Untuk penggunaan bisnis, perlu license berbayar (mulai dari ~$1.500/tahun untuk startup). '
    'Versi AGPLv3 tersedia gratis tetapi mengharuskan seluruh aplikasi bersifat open-source. '
    'Dukungan Next.js Server Components (App Router) memerlukan dynamic import karena library ini hanya berjalan di client-side. '
    'Bundle size yang cukup besar (~400KB) dapat mempengaruhi initial load time.', body))

# 2.3 FortuneSheet
story.append(heading('2.3 FortuneSheet - Analisis Mendalam', h2, 1))
story.append(Paragraph(
    'FortuneSheet adalah library spreadsheet open-source (MIT) yang menawarkan fitur paling lengkap secara gratis. '
    'Berasal dari fork Luckysheet yang sudah tidak aktif, FortuneSheet memberikan pengalaman yang sangat mirip Google Sheets '
    'termasuk toolbar, formula bar, sheet tabs, cell formatting, conditional formatting, dan charting. '
    'Dengan lisensi MIT, library ini dapat digunakan secara bebas di project komersial tanpa biaya lisensi.', body))
story.append(Paragraph(
    '<b>Keunggulan utama:</b> Fitur spreadsheet paling lengkap di kelas open-source. Mendukung multi-sheet, formula Excel, '
    'cell formatting (bold, italic, color, border), conditional formatting, freeze panes, column resize, row/column insertion/deletion, '
    'undo/redo, search and replace, dan banyak lagi. React component tersedia via @fortune-sheet/react. '
    'Community aktif dengan 2.100+ stars dan versi terbaru (1.0.4) dirilis secara reguler.', body))
story.append(Paragraph(
    '<b>Kelemahan:</b> API yang kurang mature dibanding Handsontable untuk customization mendalam. '
    'Dokumentasi belum selengkap Handsontable, terutama untuk use case advanced seperti custom validator dan conditional formatting programming. '
    'Performance dengan dataset besar (10.000+ rows) belum sebaik Handsontable. '
    'Integrasi dengan state management external (Zustand) memerlukan wrapper tambahan karena FortuneSheet mengelola state internalnya sendiri.', body))

# 2.4 Univer
story.append(heading('2.4 Univer - Analisis Mendalam', h2, 1))
story.append(Paragraph(
    'Univer adalah framework spreadsheet next-generation yang dikembangkan oleh DreamNum (perusahaan China). '
    'Dengan 12.700+ stars di GitHub dan lisensi Apache 2.0, Univer adalah proyek spreadsheet open-source paling aktif saat ini. '
    'Univer bukan sekadar library spreadsheet, melainkan full-stack framework yang mencakup spreadsheet, document editor, dan presentation, '
    'mirip dengan Google Workspace. Arsitekturnya berbasis Canvas (bukan DOM-based), memberikan performa superior untuk dataset besar.', body))
story.append(Paragraph(
    '<b>Keunggulan utama:</b> Arsitektur Canvas-based memberikan performa rendering yang sangat baik, bahkan dengan ratusan ribu sel. '
    'Plugin ecosystem yang luas memungkinkan extensi fitur tanpa mengubah core. Support untuk collaboration (real-time editing) via Univer Platform. '
    'Typescript-native dengan codebase yang modern dan well-structured. Versi 0.19.0 (Maret 2026) menunjukkan development yang sangat aktif.', body))
story.append(Paragraph(
    '<b>Kelemahan:</b> Belum ada official React wrapper yang stabil (perlu manual integration). '
    'Learning curve yang lebih tinggi karena arsitekturnya yang kompleks (modular plugin system). '
    'Bundle size yang besar (~500KB+) karena banyak fitur bawaan. Community dan dokumentasi masih berkembang, '
    'sehingga troubleshooting bisa lebih menantang. Untuk use case XML Converter yang relatif sederhana (data entry + validasi), '
    'Univer mungkin terlalu "overkill" dan menambah kompleksitas yang tidak perlu.', body))

# 2.5 AG Grid & TanStack Table
story.append(heading('2.5 AG Grid dan TanStack Table', h2, 1))
story.append(Paragraph(
    '<b>AG Grid</b> (14.000+ stars) adalah data grid yang sangat powerful dengan fitur spreadsheet-like, '
    'termasuk in-cell editing, row grouping, pivot table, dan Excel export/import. AG Grid Community (MIT) sudah sangat mumpuni '
    'untuk kebanyakan use case, sementara Enterprise menambahkan fitur tambahan seperti row grouping, server-side row model, dan charting. '
    'Namun, AG Grid lebih cocok sebagai data grid daripada full spreadsheet, artinya tidak memiliki formula bar, multi-sheet, '
    'dan beberapa fitur spreadsheet standar lainnya. Untuk data entry, AG Grid sangat baik tetapi tidak memberikan nuansa Excel yang sesuai.', body))
story.append(Paragraph(
    '<b>TanStack Table</b> (26.000+ stars) adalah library headless table yang sangat populer. Keunggulan utamanya adalah ukuran bundle '
    'yang sangat kecil (~15KB karena headless) dan fleksibilitas penuh dalam UI customization. Namun, sebagai headless library, '
    'TanStack Table TIDAK menyediakan UI bawaan. Developer harus membangun seluruh tampilan spreadsheet dari nol, '
    'termasuk cell editing, keyboard navigation, copy-paste, dll. Ini membutuhkan effort development yang sangat besar '
    'dan tidak praktis untuk timeline project XML Converter yang ingin segera launch.', body))

# 2.6 Feature Matrix
story.append(heading('2.6 Matriks Fitur Kritis', h2, 1))
story.append(Paragraph(
    'Berikut adalah matriks perbandingan fitur-fitur yang paling kritis untuk kebutuhan XML Converter Coretax. '
    'Setiap fitur dinilai berdasarkan ketersediaan dan kualitas implementasinya di masing-masing library:', body))
story.append(Spacer(1, 12))

feat_headers = ['Fitur Kritis', 'Handsontable', 'FortuneSheet', 'Univer', 'AG Grid', 'TanStack']
feat_rows = [
    ['Cell Validation', 'Excellent', 'Basic', 'Good', 'Good', 'Manual'],
    ['Custom Cell Renderer', 'Excellent', 'Good', 'Good', 'Excellent', 'Manual'],
    ['Keyboard Navigation', 'Excellent', 'Excellent', 'Good', 'Good', 'Manual'],
    ['Copy-Paste dari Excel', 'Excellent', 'Excellent', 'Good', 'Good', 'Manual'],
    ['Dropdown in Cell', 'Excellent', 'Basic', 'Good', 'Good', 'Manual'],
    ['Multi-Sheet', 'No', 'Yes', 'Yes', 'No', 'Manual'],
    ['Formula Support', 'Basic', 'Excellent', 'Excellent', 'Basic', 'No'],
    ['Undo/Redo', 'Yes', 'Yes', 'Yes', 'Yes', 'Manual'],
    ['Conditional Format', 'Plugin', 'Good', 'Good', 'Yes', 'Manual'],
    ['Performance (10K rows)', 'Good', 'Fair', 'Excellent', 'Excellent', 'Excellent'],
    ['React Integration', 'Official', 'Official', 'Manual', 'Official', 'Official'],
    ['Lisensi Gratis Komersial', 'No (AGPL)', 'Yes (MIT)', 'Yes (Apache)', 'Partial', 'Yes (MIT)'],
    ['Dokumentasi', 'Excellent', 'Fair', 'Growing', 'Excellent', 'Excellent'],
    ['Bundle Size', '~400KB', '~350KB', '~500KB+', '~300KB', '~15KB'],
]
t2 = make_table(feat_headers, feat_rows, [3.2*cm, 2.1*cm, 2.1*cm, 2.1*cm, 2.1*cm, 2.1*cm])
story.append(t2)
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Tabel 2.</b> Matriks Fitur Kritis untuk XML Converter Coretax', caption_style))
story.append(Spacer(1, 18))

# 3. UX ANALYSIS
story.append(heading('3. Analisis UX: Form vs Spreadsheet', h1, 0))
story.append(heading('3.1 Mengapa Spreadsheet Lebih Baik untuk Data Entry Pajak', h2, 1))
story.append(Paragraph(
    'Target pengguna Coretax XML Converter adalah profesional perpajakan: akuntan, tax consultant, finance staff, dan HR. '
    'Profesi ini sudah sangat terbiasa bekerja dengan Microsoft Excel dan Google Sheets dalam keseharian mereka. '
    'Mengharuskan mereka berpindah paradigm dari spreadsheet ke web form menciptakan friction yang signifikan dalam user experience. '
    'Menurut Nielsen Norman Group, form yang memerlukan perpindahan input method yang berbeda dari kebiasaan pengguna '
    'meningkatkan cognitive load dan menurunkan completion rate hingga 30%.', body))
story.append(Paragraph(
    'Spreadsheet interface menawarkan beberapa keunggulan UX kunci untuk data entry pajak. '
    'Pertama, <b>familiarity</b>: pengguna sudah terbiasa dengan keyboard shortcuts (Tab untuk pindah sel, Enter untuk konfirmasi, '
    'Ctrl+C/V untuk copy-paste), sehingga learning curve hampir nol. '
    'Kedua, <b>batch data entry</b>: pengguna dapat mengisi banyak baris data sekaligus tanpa perlu menekan "Tambah Baris" berulang kali. '
    'Ketiga, <b>copy-paste friendly</b>: pengguna dapat menyalin data langsung dari file Excel yang sudah ada (misalnya daftar karyawan, '
    'daftar faktur) dan menempelkannya ke dalam grid. Keempat, <b>visual feedback</b>: sel yang error langsung ter-highlight, '
    'memberikan validasi real-time yang lebih intuitif dibanding error message pada form.', body))

story.append(heading('3.2 Pattern yang Direkomendasikan', h2, 1))
story.append(Paragraph(
    'Berdasarkan riset UX best practices dari Nielsen Norman Group, Pencil & Paper, dan Stephanie Walter Design, '
    'berikut adalah pattern yang direkomendasikan untuk implementasi spreadsheet pada XML Converter:', body))
story.append(Paragraph(
    '<b>Pattern 1: Template-Specific Spreadsheet.</b> Setiap template pajak memiliki kolom yang sudah didefinisikan sesuai field XML. '
    'Kolom wajib diisi ditandai dengan header berwarna merah/asterisk. Kolom dengan format khusus (NPWP, NIK, tanggal) memiliki validator bawaan. '
    'Kolom dengan nilai terbatas (jenis dokumen, kode objek pajak) menggunakan dropdown. Pengguna cukup mengisi data baris per baris '
    'seperti di Excel, lalu klik "Generate XML" untuk menghasilkan file XML yang siap upload ke Coretax.', body))
story.append(Paragraph(
    '<b>Pattern 2: Hybrid Header-Grid.</b> Untuk template yang memiliki header section (identitas Wajib Pajak, masa pajak, dll) '
    'dan detail section (daftar transaksi/faktur), gunakan pendekatan hybrid: header section tetap menggunakan form input '
    'yang compact (karena datanya hanya 1 record), sedangkan detail section menggunakan spreadsheet grid (karena datanya banyak/baris). '
    'Pendekatan ini menggabungkan yang terbaik dari kedua dunia: kemudahan form untuk data tunggal dan efisiensi spreadsheet untuk data berulang.', body))
story.append(Paragraph(
    '<b>Pattern 3: Smart Import.</b> Selain manual entry, spreadsheet juga mendukung import dari file Excel/CSV. '
    'Pengguna dapat meng-upload file template yang sudah diisi offline, dan sistem akan memetakan kolom file ke kolom spreadsheet secara otomatis. '
    'Ini memberikan fleksibilitas bagi pengguna yang ingin bekerja offline dulu di Excel, kemudian meng-upload hasilnya ke web untuk konversi.', body))

# 4. RECOMMENDATION
story.append(heading('4. Rekomendasi dan Roadmap', h1, 0))
story.append(heading('4.1 Rekomendasi Utama', h2, 1))
story.append(Paragraph(
    'Berdasarkan analisis mendalam terhadap fitur, lisensi, performa, dan kesesuaian dengan kebutuhan XML Converter Coretax, '
    'berikut adalah rekomendasi yang diurutkan berdasarkan prioritas:', body))
story.append(Spacer(1, 12))

rec_headers = ['Prioritas', 'Library', 'Alasan', 'Risk Level']
rec_rows = [
    ['1 (Recommended)', 'Handsontable', 'Validasi terbaik, React mature, Excel-like UX', 'Lisensi komersial'],
    ['2 (Open Source)', 'FortuneSheet', 'MIT gratis, fitur lengkap, Excel-like', 'API kurang mature'],
    ['3 (Enterprise)', 'AG Grid', 'Performa excellent, React official', 'Kurang spreadsheet-like'],
    ['4 (Custom)', 'TanStack Table', 'Paling ringan, fleksibel penuh', 'Perlu build UI dari nol'],
    ['5 (Future)', 'Univer', 'Teknologi terdepan, canvas-based', 'Belum stabil, learning curve tinggi'],
]
t3 = make_table(rec_headers, rec_rows, [2.5*cm, 2.5*cm, 5.5*cm, 3.5*cm])
story.append(t3)
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Tabel 3.</b> Rekomendasi Library Berdasarkan Prioritas', caption_style))
story.append(Spacer(1, 12))

story.append(heading('4.2 Arsitektur yang Direkomendasikan', h2, 1))
story.append(Paragraph(
    '<b>Step 1 - Header Section (Form Input).</b> Pertahankan form input compact untuk bagian header setiap template pajak. '
    'Bagian ini mencakup data identitas Wajib Pajak (NPWP, Nama, Alamat), Masa Pajak (Tahun, Bulan), dan metadata lainnya. '
    'Data ini hanya 1 record per file XML, sehingga form input lebih efisien daripada spreadsheet row. '
    'Gunakan layout 2-3 kolom yang compact dengan label di atas input field.', body))
story.append(Paragraph(
    '<b>Step 2 - Detail Section (Spreadsheet Grid).</b> Ganti seluruh bagian data detail (daftar transaksi, daftar faktur, '
    'daftar pemotongan, dll) dengan spreadsheet grid. Setiap kolom grid sesuai dengan field XML yang didefinisikan di template. '
    'Kolom wajib di-highlight, kolom dengan format khusus memiliki validator, kolom enum menggunakan dropdown. '
    'Pengguna dapat menambah/menghapus baris, copy-paste dari Excel, dan melakukan editing inline.', body))
story.append(Paragraph(
    '<b>Step 3 - Validation and Preview.</b> Setelah data diisi, pengguna klik "Validate" untuk menjalankan validasi menyeluruh. '
    'Sel yang error di-highlight merah dengan tooltip penjelasan. Setelah valid, pengguna dapat preview XML output '
    'dan download file XML yang siap upload ke Coretax DJP.', body))

story.append(heading('4.3 Roadmap Implementasi', h2, 1))
story.append(Paragraph(
    '<b>Fase 1 (Quick Win - 1 minggu):</b> Implementasi Handsontable untuk template paling populer (PPh 23, PPh 26, PPh 21). '
    'Gunakan pendekatan hybrid: form untuk header, Handsontable untuk detail grid. Pastikan validasi sel berjalan, '
    'copy-paste dari Excel bekerja, dan XML output benar. Deploy dan uji dengan pengguna nyata.', body))
story.append(Paragraph(
    '<b>Fase 2 (Expand - 2 minggu):</b> Perluas ke semua 25 template. Buat konfigurasi template yang mendukung kolom definition, '
    'validator rules, dan dropdown options per template. Implementasi fitur import dari file Excel/CSV. '
    'Optimasi mobile responsiveness (spreadsheet yang bisa scroll horizontal pada layar kecil).', body))
story.append(Paragraph(
    '<b>Fase 3 (Enhance - 2 minggu):</b> Tambahkan fitur advanced: autofill, column summary (total, subtotal), '
    'formatting otomatis (angka ke format mata uang, tanggal ke format DD/MM/YYYY), keyboard shortcuts, dan template save/load (localStorage). '
    'Implementasi smart import yang otomatis memetakan kolom dari file Excel.', body))

story.append(heading('4.4 Estimasi Effort dan Resource', h2, 1))
story.append(Spacer(1, 12))
eff_headers = ['Komponen', 'Estimasi Waktu', 'Complexity']
eff_rows = [
    ['Setup Handsontable + basic grid', '1-2 hari', 'Medium'],
    ['Template-specific column config', '2-3 hari', 'Medium'],
    ['Cell validation system', '1-2 hari', 'Medium'],
    ['XML generator update', '1 hari', 'Low'],
    ['Hybrid form + grid layout', '1-2 hari', 'Medium'],
    ['Copy-paste from Excel', '0.5 hari', 'Low'],
    ['Mobile responsive spreadsheet', '1-2 hari', 'High'],
    ['Import Excel/CSV file', '1-2 hari', 'Medium'],
    ['All 25 template configs', '2-3 hari', 'Medium'],
    ['Testing & QA', '2-3 hari', 'Medium'],
    ['Total Estimasi', '2-3 minggu', '-'],
]
t4 = make_table(eff_headers, eff_rows, [5.5*cm, 3*cm, 3*cm])
story.append(t4)
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Tabel 4.</b> Estimasi Effort Implementasi Spreadsheet Interface', caption_style))
story.append(Spacer(1, 18))

# 5. CONCLUSION
story.append(heading('5. Kesimpulan', h1, 0))
story.append(Paragraph(
    'Implementasi spreadsheet-like interface pada Coretax XML Converter merupakan evolusi UX yang sangat tepat untuk target pengguna '
    'profesional perpajakan. Pendekatan hybrid (form untuk header, spreadsheet untuk detail) memberikan keseimbangan terbaik antara '
    'kemudahan penggunaan dan efisiensi data entry. Dengan Handsontable sebagai library utama, implementation dapat dilakukan '
    'dalam waktu 2-3 minggu dengan hasil yang production-ready. Key success factor-nya adalah: konfigurasi template yang benar '
    '(kolom, validator, dropdown), validasi real-time yang informatif, dan integrasi XML generator yang seamless.', body))
story.append(Paragraph(
    'Langkah selanjutnya yang direkomendasikan adalah melakukan proof-of-concept dengan 1 template (misalnya PPh 23/Bupot Unifikasi) '
    'untuk memvalidasi pendekatan sebelum melakukan full implementation ke 25 template. Proof-of-concept ini sebaiknya melibatkan '
    '2-3 pengguna nyata (akuntan/tax consultant) untuk user testing dan feedback collection, sehingga iterasi design bisa dilakukan '
    'sebelum investasi development yang lebih besar.', body))

# Build
doc.multiBuild(story)
print(f'PDF generated: {output}')
