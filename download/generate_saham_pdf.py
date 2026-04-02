#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate comprehensive Indonesian Stock Investment Analysis PDF Report
Analisis Investasi Saham Indonesia - alatpajak.id Research Division
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether, HRFlowable
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate, Frame
from reportlab.platypus import NextPageTemplate

# ==============================================================================
# FONT REGISTRATION
# ==============================================================================
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('TimesNewRoman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

pdfmetrics.registerFontFamily(
    'SimHei',
    normal='SimHei',
    bold='SimHei',
    italic='SimHei',
    boldItalic='SimHei'
)
pdfmetrics.registerFontFamily(
    'TimesNewRoman',
    normal='TimesNewRoman',
    bold='TimesNewRoman',
    italic='TimesNewRoman',
    boldItalic='TimesNewRoman'
)

# ==============================================================================
# COLORS
# ==============================================================================
DARK_BLUE = HexColor('#1F4E79')
MEDIUM_BLUE = HexColor('#2E75B6')
LIGHT_BLUE = HexColor('#D6E4F0')
ACCENT_BLUE = HexColor('#4472C4')
DARK_GRAY = HexColor('#333333')
MEDIUM_GRAY = HexColor('#666666')
LIGHT_GRAY = HexColor('#F2F2F2')
ROW_ALT = HexColor('#E8EEF4')
HEADER_BG = DARK_BLUE
GREEN_ACCENT = HexColor('#548235')
RED_ACCENT = HexColor('#C00000')
GOLD_ACCENT = HexColor('#BF8F00')

# ==============================================================================
# STYLES
# ==============================================================================
styles = getSampleStyleSheet()

# Cover styles
style_cover_title = ParagraphStyle(
    'CoverTitle', fontName='SimHei', fontSize=24, leading=32,
    textColor=DARK_BLUE, alignment=TA_CENTER, spaceAfter=12
)

style_cover_subtitle = ParagraphStyle(
    'CoverSubtitle', fontName='SimHei', fontSize=13, leading=20,
    textColor=MEDIUM_BLUE, alignment=TA_CENTER, spaceAfter=8
)

style_cover_info = ParagraphStyle(
    'CoverInfo', fontName='SimHei', fontSize=11, leading=16,
    textColor=MEDIUM_GRAY, alignment=TA_CENTER
)

# TOC styles
style_toc_h1 = ParagraphStyle(
    'TOCH1', fontName='SimHei', fontSize=13, leading=22,
    leftIndent=20, textColor=DARK_BLUE
)
style_toc_h2 = ParagraphStyle(
    'TOCH2', fontName='SimHei', fontSize=11, leading=18,
    leftIndent=40, textColor=DARK_GRAY
)

# Heading styles
style_h1 = ParagraphStyle(
    'CustomH1', fontName='SimHei', fontSize=18, leading=26,
    textColor=DARK_BLUE, spaceBefore=18, spaceAfter=10,
    borderPadding=(0, 0, 4, 0)
)

style_h2 = ParagraphStyle(
    'CustomH2', fontName='SimHei', fontSize=14, leading=20,
    textColor=MEDIUM_BLUE, spaceBefore=14, spaceAfter=8
)

style_h3 = ParagraphStyle(
    'CustomH3', fontName='SimHei', fontSize=12, leading=18,
    textColor=DARK_GRAY, spaceBefore=10, spaceAfter=6
)

# Body styles
style_body = ParagraphStyle(
    'CustomBody', fontName='SimHei', fontSize=10.5, leading=17,
    textColor=black, alignment=TA_LEFT, wordWrap='CJK',
    spaceBefore=2, spaceAfter=4
)

style_body_indent = ParagraphStyle(
    'CustomBodyIndent', fontName='SimHei', fontSize=10.5, leading=17,
    textColor=black, alignment=TA_LEFT, wordWrap='CJK',
    leftIndent=15, spaceBefore=2, spaceAfter=4
)

style_bullet = ParagraphStyle(
    'CustomBullet', fontName='SimHei', fontSize=10.5, leading=17,
    textColor=black, alignment=TA_LEFT, wordWrap='CJK',
    leftIndent=20, bulletIndent=8, spaceBefore=1, spaceAfter=2
)

style_table_caption = ParagraphStyle(
    'TableCaption', fontName='SimHei', fontSize=9.5, leading=14,
    textColor=MEDIUM_GRAY, alignment=TA_CENTER, spaceBefore=4, spaceAfter=8
)

style_disclaimer = ParagraphStyle(
    'Disclaimer', fontName='SimHei', fontSize=8.5, leading=13,
    textColor=MEDIUM_GRAY, alignment=TA_CENTER, wordWrap='CJK'
)

style_verdict = ParagraphStyle(
    'Verdict', fontName='SimHei', fontSize=11, leading=16,
    textColor=DARK_BLUE, alignment=TA_LEFT, wordWrap='CJK',
    spaceBefore=6, spaceAfter=6, leftIndent=10
)


# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================
def en(text):
    """Wrap English text in Times New Roman font tag."""
    return '<font name="TimesNewRoman">' + text + '</font>'


def heading1(text):
    return Paragraph(text, style_h1)


def heading2(text):
    return Paragraph(text, style_h2)


def heading3(text):
    return Paragraph(text, style_h3)


def body(text):
    return Paragraph(text, style_body)


def bullet(text):
    return Paragraph(text, style_bullet, bulletText='\u2022')


def make_table(data, col_widths, caption=None):
    """Create a professionally styled table."""
    elements = []
    if caption:
        elements.append(Paragraph(caption, style_table_caption))
        elements.append(Spacer(1, 4))

    t = Table(data, colWidths=col_widths, repeatRows=1)
    num_rows = len(data)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'SimHei'),
        ('FONTSIZE', (0, 0), (-1, 0), 9.5),
        ('FONTNAME', (0, 1), (-1, -1), 'SimHei'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('LEADING', (0, 0), (-1, -1), 14),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#B0B0B0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, 0), 7),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 7),
    ]
    # Alternating row colors
    for i in range(1, num_rows):
        if i % 2 == 0:
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), ROW_ALT))

    t.setStyle(TableStyle(style_cmds))
    elements.append(t)
    elements.append(Spacer(1, 8))
    return elements


def section_divider():
    return HRFlowable(width="100%", thickness=1, color=LIGHT_BLUE, spaceAfter=10, spaceBefore=6)


def verdict_box(text):
    """Create a highlighted verdict box."""
    data = [[Paragraph(text, style_verdict)]]
    t = Table(data, colWidths=[460])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BLUE),
        ('BOX', (0, 0), (-1, -1), 1.5, ACCENT_BLUE),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    return t


# ==============================================================================
# CUSTOM DOCUMENT TEMPLATE WITH TOC
# ==============================================================================
class TocDocTemplate(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        BaseDocTemplate.__init__(self, filename, **kwargs)
        self.page_count = 0

        # Main content frame
        frame_main = Frame(
            2.2*cm, 2.2*cm, A4[0] - 4.4*cm, A4[1] - 5.0*cm,
            id='main', showBoundary=0
        )
        # Cover frame (full page)
        frame_cover = Frame(
            2.5*cm, 2*cm, A4[0] - 5*cm, A4[1] - 4*cm,
            id='cover', showBoundary=0
        )

        template_cover = PageTemplate(id='Cover', frames=[frame_cover], onPage=self._cover_page)
        template_normal = PageTemplate(id='Normal', frames=[frame_main], onPage=self._normal_page)

        self.addPageTemplates([template_cover, template_normal])

    def _cover_page(self, canvas, doc):
        canvas.saveState()
        # Top blue bar
        canvas.setFillColor(DARK_BLUE)
        canvas.rect(0, A4[1] - 2*cm, A4[0], 2*cm, fill=1, stroke=0)
        # Bottom blue bar
        canvas.setFillColor(DARK_BLUE)
        canvas.rect(0, 0, A4[0], 1.5*cm, fill=1, stroke=0)
        # Bottom text
        canvas.setFillColor(white)
        canvas.setFont('SimHei', 8)
        canvas.drawCentredString(A4[0]/2, 0.6*cm, 'alatpajak.id Research Division - Laporan Analisis Saham Indonesia')
        canvas.restoreState()

    def _normal_page(self, canvas, doc):
        canvas.saveState()
        # Header line
        canvas.setStrokeColor(DARK_BLUE)
        canvas.setLineWidth(1.5)
        canvas.line(2*cm, A4[1] - 1.8*cm, A4[0] - 2*cm, A4[1] - 1.8*cm)
        # Header text
        canvas.setFillColor(MEDIUM_BLUE)
        canvas.setFont('SimHei', 8)
        canvas.drawString(2.2*cm, A4[1] - 1.6*cm, 'Analisis Investasi Saham Indonesia 2026')
        canvas.drawRightString(A4[0] - 2.2*cm, A4[1] - 1.6*cm, 'alatpajak.id')
        # Footer line
        canvas.setStrokeColor(DARK_BLUE)
        canvas.setLineWidth(0.8)
        canvas.line(2*cm, 1.8*cm, A4[0] - 2*cm, 1.8*cm)
        # Page number
        canvas.setFillColor(MEDIUM_GRAY)
        canvas.setFont('SimHei', 8)
        canvas.drawCentredString(A4[0]/2, 1.0*cm, str(doc.page))
        canvas.restoreState()

    def afterFlowable(self, flowable):
        """Register headings for TOC."""
        if isinstance(flowable, Paragraph):
            style = flowable.style.name
            text = flowable.getPlainText()
            if style == 'CustomH1':
                key = 'h1_%d' % self.seq.nextf('heading1')
                self.canv.bookmarkPage(key)
                self.notify('TOCEntry', (0, text, self.page, key))
            elif style == 'CustomH2':
                key = 'h2_%d' % self.seq.nextf('heading2')
                self.canv.bookmarkPage(key)
                self.notify('TOCEntry', (1, text, self.page, key))


# ==============================================================================
# BUILD DOCUMENT
# ==============================================================================
OUTPUT_PATH = '/home/z/my-project/download/analisis_saham_jevi_2026.pdf'
LOGO_PATH = '/home/z/my-project/download/alatpajak_logo.png'

story = []

# ==============================================================================
# COVER PAGE
# ==============================================================================
story.append(NextPageTemplate('Cover'))
story.append(Spacer(1, 2.5*cm))

# Logo
if os.path.exists(LOGO_PATH):
    logo = Image(LOGO_PATH, width=3.5*cm, height=3.5*cm)
    logo.hAlign = 'CENTER'
    story.append(logo)
    story.append(Spacer(1, 0.8*cm))

story.append(Paragraph('ANALISIS INVESTASI SAHAM INDONESIA', style_cover_title))
story.append(Spacer(1, 0.3*cm))
story.append(HRFlowable(width="60%", thickness=2, color=ACCENT_BLUE, spaceAfter=12, spaceBefore=4))
story.append(Paragraph(
    'Rekomendasi Portofolio Jangka Panjang ' + en('(5-10 Tahun)') + '<br/>'
    'dengan Dividen Berkelanjutan',
    style_cover_subtitle
))
story.append(Spacer(1, 1.5*cm))
story.append(Paragraph('alatpajak.id ' + en('Research Division'), style_cover_info))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph('31 Maret 2026', style_cover_info))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph('Versi 1.0 - Untuk Keperluan Edukasi Investasi', style_cover_info))

story.append(NextPageTemplate('Normal'))
story.append(PageBreak())

# ==============================================================================
# TABLE OF CONTENTS
# ==============================================================================
story.append(heading1('DAFTAR ISI'))
story.append(Spacer(1, 12))

toc = TableOfContents()
toc.levelStyles = [style_toc_h1, style_toc_h2]
story.append(toc)
story.append(PageBreak())

# ==============================================================================
# 1. EXECUTIVE SUMMARY
# ==============================================================================
story.append(heading1('1. RINGKASAN EKSEKUTIF'))
story.append(section_divider())

story.append(body(
    'Laporan ini menyajikan rekomendasi portofolio investasi saham Indonesia yang terdiri dari '
    + en('7') + ' emiten unggulan dengan fokus pada dividen berkelanjutan dan pertumbuhan jangka panjang. '
    'Portofolio ini dirancang untuk investor dengan horizon investasi ' + en('5-10') + ' tahun yang menginginkan '
    'kombinasi pendapatan dividen reguler dan apresiasi modal.'
))

story.append(Spacer(1, 8))

story.append(body('<b>Highlights Rekomendasi:</b>'))

story.append(bullet(
    'Portofolio terdiri dari ' + en('7') + ' saham blue-chip Indonesia dengan track record dividen minimal ' + en('5') + ' tahun.'
))
story.append(bullet(
    'Expected portfolio yield: ' + en('5.5-6.5%') + ' per tahun dari dividen saja, di atas rata-rata deposito bank.'
))
story.append(bullet(
    'Alokasi dibagi menjadi tiga kategori: ' + en('Defensif Core (60%)') + ', ' + en('Growth + Income (20%)') + ', dan ' + en('High Yield (20%)') + '.'
))
story.append(bullet(
    'Semua emiten memiliki fundamental kuat, likuiditas tinggi di Bursa Efek Indonesia, dan bisnis yang sustainable.'
))
story.append(bullet(
    'Kondisi pasar saat ini (koreksi asing, valuasi menarik) memberikan entry point yang ideal untuk akumulasi bertahap.'
))

story.append(Spacer(1, 10))
story.append(body(
    'Dengan strategi ' + en('Dollar Cost Averaging') + ' selama ' + en('3-6') + ' bulan dan reinvestasi dividen, '
    'portofolio ini berpotensi menghasilkan total return ' + en('12-15%') + ' per tahun dalam jangka panjang, '
    'terdiri dari dividen ' + en('5.5-6.5%') + ' dan pertumbuhan modal ' + en('6-9%') + '.'
))

story.append(Spacer(1, 18))

# ==============================================================================
# 2. METODOLOGI RISET
# ==============================================================================
story.append(heading1('2. METODOLOGI RISET'))
story.append(section_divider())

story.append(body(
    'Analisis dalam laporan ini dilakukan menggunakan pendekatan top-down dan ' + en('bottom-up') + ' '
    'dengan data dari berbagai sumber terpercaya. Metodologi penelitian mencakup:'
))

story.append(Spacer(1, 6))
story.append(heading2('2.1 Sumber Data'))
story.append(bullet('Bursa Efek Indonesia ' + en('(IDX)') + ' - Data harga, volume, dan laporan keuangan emiten'))
story.append(bullet('Laporan Keuangan Tahunan Emiten 2025 - Audited financial statements'))
story.append(bullet('BRI Danareksa Sekuritas - Analisis riset dan target harga'))
story.append(bullet('Kiwoom Sekuritas - Rekomendasi saham Indonesia'))
story.append(bullet('EXA AI ' + en('Deep Research') + ' - Analisis komprehensif berbasis AI'))
story.append(bullet('Kontan, Bisnis Indonesia, Investor.id - Berita dan sentiment pasar'))

story.append(Spacer(1, 6))
story.append(heading2('2.2 Kriteria Seleksi'))
story.append(bullet('Track record pembagian dividen minimal ' + en('5') + ' tahun berturut-turut'))
story.append(bullet('Fundamental kuat: ' + en('ROE > 15%') + ', pertumbuhan laba positif, neraca sehat'))
story.append(bullet('Likuiditas tinggi: masuk dalam daftar ' + en('LQ45') + ' atau ' + en('IDX30') + ''))
story.append(bullet('Bisnis sustainable dengan moat kompetitif yang kuat'))
story.append(bullet('Valuasi masih menarik relatif terhadap sejarah dan peer'))

story.append(Spacer(1, 18))

# ==============================================================================
# 3. PORTOFOLIO REKOMENDASI
# ==============================================================================
story.append(heading1('3. PORTOFOLIO REKOMENDASI'))
story.append(section_divider())

story.append(body(
    'Berikut adalah alokasi portofolio yang direkomendasikan, dirancang untuk memberikan '
    'keseimbangan antara keamanan, pendapatan dividen, dan potensi pertumbuhan:'
))

story.append(Spacer(1, 12))

portfolio_data = [
    ['Saham', 'Alokasi', 'Expected Yield', 'Kategori'],
    [en('BBCA'), en('25%'), en('4-5%'), 'Defensif Core'],
    [en('BBRI'), en('20%'), en('5-7%'), 'Defensif Core'],
    [en('TLKM'), en('15%'), en('4-5%'), 'Defensif Core'],
    [en('BMRI'), en('10%'), en('4-5.5%'), en('Growth + Income')],
    [en('ICBP'), en('10%'), en('3-4%'), en('Growth + Income')],
    [en('ADRO'), en('10%'), en('8-11%'), 'High Yield'],
    [en('UNTR'), en('10%'), en('6-8%'), 'High Yield'],
]
story.extend(make_table(portfolio_data, [80, 80, 110, 140], 'Tabel 1: Alokasi Portofolio Rekomendasi'))

story.append(Spacer(1, 8))

story.append(body(
    '<b>Ringkasan Alokasi:</b> Portofolio didominasi oleh sektor perbankan ' + en('(65%)') + ' '
    'yang merupakan tulang punggung ekonomi Indonesia, dilengkapi dengan telekomunikasi defensif, '
    'consumer goods, dan eksposur komoditas yang terbatas. Expected blended yield portofolio '
    'berada di kisaran ' + en('5.5-6.5%') + ' per tahun.'
))

story.append(Spacer(1, 18))

# ==============================================================================
# 4. DEEP DIVE ANALISIS PER SAHAM
# ==============================================================================
story.append(heading1('4. DEEP DIVE ANALISIS PER SAHAM'))
story.append(section_divider())

# ---------- 4.1 BBCA ----------
story.append(heading2('4.1 ' + en('BBCA') + ' - Bank Central Asia'))
story.append(Paragraph('THE ANCHOR PORTFOLIO', ParagraphStyle(
    'TagLine', fontName='TimesNewRoman', fontSize=10, leading=14,
    textColor=ACCENT_BLUE, spaceBefore=2, spaceAfter=8, leftIndent=5
)))

story.append(heading3('Valuasi & Kinerja Keuangan 2025'))
story.append(bullet('Laba Bersih 2025: ' + en('Rp57,5') + ' Triliun (+4.9% ' + en('YoY') + ')'))
story.append(bullet('Total Kredit: ' + en('Rp993') + ' Triliun (+7.7%) - pertumbuhan sehat'))
story.append(bullet('Dana Pihak Ketiga ' + en('(DPK)') + ': ' + en('Rp1.249') + ' Triliun (+10.2%)'))
story.append(bullet('CASA: ' + en('Rp1.045') + ' Triliun (+13.1%) - dominasi likuiditas murah'))

story.append(Spacer(1, 6))
story.append(heading3('Metrik Valuasi'))
story.append(bullet(en('PBV: 4.0-5.0x') + ' (premium, namun justified oleh kualitas aset)'))
story.append(bullet(en('PER: ~18x') + ' (sejalan dengan pertumbuhan stabil)'))
story.append(bullet(en('ROE: >20%') + ' - tertinggi di antara bank-bank besar'))
story.append(bullet(en('NPL: <1.5%') + ' - kualitas aset sangat terjaga'))

story.append(Spacer(1, 6))
story.append(heading3('Profil Dividen'))
story.append(body(
    'Dividen final 2025 sebesar ' + en('Rp281/saham') + ', dengan total dividen sekitar ' + en('Rp336/saham') + ' '
    '(termasuk interim). Yield berada di kisaran ' + en('4-5%') + ' dengan ' + en('payout ratio 60-70%') + '. '
    + en('BBCA') + ' memiliki track record pembagian dividen yang paling konsisten di Indonesia.'
))

story.append(Spacer(1, 6))
story.append(heading3('Catalyst & Target Harga'))
story.append(bullet('Harga saham saat ini: ~' + en('Rp6.700-6.800') + ''))
story.append(bullet('Target harga BRI Danareksa: ' + en('Rp11.400 (BUY)') + ' - upside ' + en('46-68%') + ''))
story.append(bullet('<b>Catalyst:</b> Insider buying oleh Jahja Setia Atmadja (pemilik mayoritas), dominasi digital banking melalui ' + en('BCA Digital/Sakuku') + ''))
story.append(bullet('<b>Edge kompetitif:</b> Jaringan CASA terkuat di Indonesia, biaya dana terendah'))

story.append(Spacer(1, 8))
story.append(verdict_box('<b>VERDICT: STRONG BUY</b> - Anchor portofolio dengan kualitas terbaik. Premium valuasi justified oleh superior ROE dan CASA dominance.'))
story.append(Spacer(1, 18))

# ---------- 4.2 BBRI ----------
story.append(heading2('4.2 ' + en('BBRI') + ' - Bank Rakyat Indonesia'))
story.append(Paragraph('THE INCOME GENERATOR', ParagraphStyle(
    'TagLine', fontName='TimesNewRoman', fontSize=10, leading=14,
    textColor=ACCENT_BLUE, spaceBefore=2, spaceAfter=8, leftIndent=5
)))

story.append(heading3('Valuasi & Kinerja Keuangan 2025'))
story.append(bullet('Laba Bersih 2025: ' + en('Rp57,13') + ' Triliun (-5.2% ' + en('YoY') + ') - penurunan dari basis tinggi'))
story.append(bullet('Total Kredit: ' + en('Rp1.517') + ' Triliun (+12.67%) - <b>tertinggi di Big 4</b>'))
story.append(bullet('DPK: ' + en('Rp1.466') + ' Triliun (+7.42%)'))
story.append(bullet('Pertumbuhan kredit UMKM tetap kuat, mendukung segmentasi inti'))

story.append(Spacer(1, 6))
story.append(heading3('Metrik Valuasi'))
story.append(bullet(en('PBV: ~1.8x') + ' - <b>diskon signifikan</b> terhadap BBCA'))
story.append(bullet(en('PER: ~12x') + ' - valuasi sangat menarik'))
story.append(bullet(en('ROE: ~18%') + ' - tetap di atas rata-rata industri'))

story.append(Spacer(1, 6))
story.append(heading3('Profil Dividen'))
story.append(body(
    'Dividen yield ' + en('5-7%') + ' merupakan <b>tertinggi di antara Big 4 Bank</b>. '
    + en('Dividend Payout Ratio / DPR: 75-85%') + ', mencerminkan komitmen shareholder return yang kuat. '
    'Sebagai BUMN, ' + en('BBRI') + ' memiliki kebijakan dividen yang transparan dan konsisten.'
))

story.append(Spacer(1, 6))
story.append(heading3('Catalyst & Target Harga'))
story.append(bullet('Harga saham saat ini: ~' + en('Rp3.600-3.800') + ''))
story.append(bullet('Target harga BRI Danareksa: ' + en('Rp4.400 (BUY)') + ''))
story.append(bullet('<b>Catalyst:</b> Pemulihan ' + en('NIM') + ' setelah fase ekspansi kredit, penurunan ' + en('CET Ratio') + ' berlebih'))
story.append(bullet('<b>Edge:</b> Pemimpin segmen UMKM, ekosistem digital ' + en('BRI Mobile') + ' terbesar'))

story.append(Spacer(1, 8))
story.append(verdict_box('<b>VERDICT: STRONG BUY</b> - Dividen yield tertinggi Big 4 dengan valuasi diskon. Ideal untuk income-focused investor.'))
story.append(Spacer(1, 18))

# ---------- 4.3 TLKM ----------
story.append(heading2('4.3 ' + en('TLKM') + ' - Telkom Indonesia'))
story.append(Paragraph('THE DEFENSIVE CASH COW', ParagraphStyle(
    'TagLine', fontName='TimesNewRoman', fontSize=10, leading=14,
    textColor=ACCENT_BLUE, spaceBefore=2, spaceAfter=8, leftIndent=5
)))

story.append(heading3('Profil Bisnis'))
story.append(body(
    + en('Telkom Indonesia') + ' memiliki monopoli de facto pada infrastruktur fixed broadband '
    'melalui ' + en('IndiHome') + ' dan dominasi pasar seluler melalui ' + en('Telkomsel') + ' (patungan dengan Singtel). '
    'Bisnis telekomunikasi bersifat defensif karena permintaan bersifat inelastic - '
    'konsumen tetap berlangganan bahkan saat resesi.'
))

story.append(Spacer(1, 6))
story.append(heading3('Metrik Valuasi'))
story.append(bullet(en('PBV: ~2.5x') + ''))
story.append(bullet(en('PER: ~14x') + ''))
story.append(bullet('Dividend Yield: ' + en('4-5%') + ''))
story.append(bullet(en('DPR: 60-80%') + ' - komitmen dividen kuat'))

story.append(Spacer(1, 6))
story.append(heading3('Catalyst & Target Harga'))
story.append(bullet('Harga saham saat ini: ~' + en('Rp3.500-3.800') + ''))
story.append(bullet('Target harga BRI Danareksa: ' + en('Rp4.000 (BUY)') + ''))
story.append(bullet('<b>Catalyst:</b> Transformasi digital, pertumbuhan ' + en('cloud') + ' dan ' + en('data center') + ''))
story.append(bullet('<b>Edge:</b> Monopoli fixed line, arus kas paling stabil di portofolio'))

story.append(Spacer(1, 8))
story.append(verdict_box('<b>VERDICT: BUY</b> - Paling aman untuk dividend investor konservatif. Cash flow machine dengan volatilitas terendah.'))
story.append(Spacer(1, 18))

# ---------- 4.4 BMRI ----------
story.append(heading2('4.4 ' + en('BMRI') + ' - Bank Mandiri'))
story.append(Paragraph('THE GROWTH BANK', ParagraphStyle(
    'TagLine', fontName='TimesNewRoman', fontSize=10, leading=14,
    textColor=ACCENT_BLUE, spaceBefore=2, spaceAfter=8, leftIndent=5
)))

story.append(heading3('Valuasi & Kinerja Keuangan 2025'))
story.append(bullet('Laba Bersih 2025: ' + en('Rp56,3') + ' Triliun (+0.93%) - stabil di tengah tekanan'))
story.append(bullet('Total Kredit: ' + en('Rp1.895') + ' Triliun (+13.4%) - <b>tertinggi di Indonesia</b>'))
story.append(bullet('Total Aset: ' + en('Rp2.829') + ' Triliun (+16.6%) - bank terbesar'))
story.append(bullet(en('NPL: 0.96%') + ' - kualitas aset sangat baik'))

story.append(Spacer(1, 6))
story.append(heading3('Metrik Valuasi'))
story.append(bullet(en('PBV: ~1.2x') + ' - <b>sangat murah</b> untuk bank sistemik'))
story.append(bullet(en('PER: ~15x') + ''))
story.append(bullet(en('CAR: 20.4%') + ' - buffer kapital kuat'))
story.append(bullet('Dividend Yield: ' + en('4-5.5%') + ''))
story.append(bullet(en('DPR: 60-70%') + ''))

story.append(Spacer(1, 6))
story.append(heading3('Catalyst & Target Harga'))
story.append(bullet('Harga saham saat ini: ~' + en('Rp4.000-4.200') + ''))
story.append(bullet('Target harga BRI Danareksa: ' + en('Rp6.200 (BUY)') + ' - upside ~' + en('50%') + ''))
story.append(bullet('<b>Catalyst:</b> Bank terbesar Indonesia, diversifikasi segmen korporasi, sindikasi, dan ' + en('investment banking') + ''))
story.append(bullet('<b>Edge:</b> Franchise korporasi terkuat, kepemilikan ' + en('mandiri tunai finance') + ''))

story.append(Spacer(1, 8))
story.append(verdict_box('<b>VERDICT: BUY</b> - Valuasi termurah di Big 4 dengan upside terbesar. Bank sistemik terbesar Indonesia.'))
story.append(Spacer(1, 18))

# ---------- 4.5 ICBP ----------
story.append(heading2('4.5 ' + en('ICBP') + ' - Indofood CBP'))
story.append(Paragraph('THE DEFENSIVE CONSUMER', ParagraphStyle(
    'TagLine', fontName='TimesNewRoman', fontSize=10, leading=14,
    textColor=ACCENT_BLUE, spaceBefore=2, spaceAfter=8, leftIndent=5
)))

story.append(heading3('Profil Bisnis'))
story.append(body(
    + en('Indofood CBP Sukses Makmur') + ' adalah perusahaan consumer goods terbesar Indonesia, '
    'menguasai pasar mi instan (Indomie), snack, dairy, minuman, dan penyedap makanan. '
    'Pricing power yang kuat memungkinkan perusahaan menyesuaikan harga di tengah inflasi. '
    'Diversifikasi ekspor ke lebih dari ' + en('80') + ' negara memberikan pilar pertumbuhan tambahan.'
))

story.append(Spacer(1, 6))
story.append(heading3('Metrik Valuasi'))
story.append(bullet(en('PBV: ~2.2x') + ''))
story.append(bullet(en('PER: ~15x') + ''))
story.append(bullet('Dividend Yield: ' + en('3-4%') + ''))

story.append(Spacer(1, 6))
story.append(heading3('Catalyst & Target Harga'))
story.append(bullet('Harga saham saat ini: ~' + en('Rp7.800-8.000') + ''))
story.append(bullet('Target harga BRI Danareksa: ' + en('Rp11.500') + ''))
story.append(bullet('<b>Catalyst:</b> Ekspansi pasar ekspor, penetrasi produk premium, efisiensi biaya'))
story.append(bullet('<b>Edge:</b> Merek Indomie ikonik, ' + en('pricing power') + ' tertinggi di sektor'))

story.append(Spacer(1, 8))
story.append(verdict_box('<b>VERDICT: BUY</b> - Paling defensif saat resesi. Permintaan consumer goods bersifat inelastic.'))
story.append(Spacer(1, 18))

# ---------- 4.6 ADRO ----------
story.append(heading2('4.6 ' + en('ADRO') + ' - Adaro Energy'))
story.append(Paragraph('THE HIGH YIELD TRANSFORMER', ParagraphStyle(
    'TagLine', fontName='TimesNewRoman', fontSize=10, leading=14,
    textColor=ACCENT_BLUE, spaceBefore=2, spaceAfter=8, leftIndent=5
)))

story.append(heading3('Transformasi Bisnis'))
story.append(body(
    + en('Adaro Energy Indonesia') + ' sedang melakukan transformasi besar dari perusahaan batu bara '
    'menjadi perusahaan energi terintegrasi. Diversifikasi mencakup pembangunan smelter aluminium '
    'yang akan beroperasional pada 2026, serta investasi di energi hijau dan ' + en('renewable energy') + '. '
    'Arus kas dari operasi batu bara yang kuat menjadi sumber pendanaan transformasi ini.'
))

story.append(Spacer(1, 6))
story.append(heading3('Metrik Valuasi'))
story.append(bullet(en('PBV: ~1.2x') + ' - <b>sangat murah</b>'))
story.append(bullet('Dividend Yield: ' + en('8-11%') + ' - <b>tertinggi di portofolio</b>'))
story.append(bullet(en('DPR: 40-50%') + ' - masih ruang untuk meningkatkan dividen'))

story.append(Spacer(1, 6))
story.append(heading3('Catalyst & Target Harga'))
story.append(bullet('Harga saham saat ini: ~' + en('Rp2.000-2.200') + ''))
story.append(bullet('<b>Catalyst:</b> Smelter aluminium operasional 2026, potensi special dividend, diversifikasi revenue'))
story.append(bullet('<b>Risiko:</b> Harga batu bara volatile, ekspektasi pasar terhadap transformasi'))

story.append(Spacer(1, 8))
story.append(verdict_box('<b>VERDICT: BUY</b> - Dividen yield tertinggi dengan valuasi murah. Potensi special dividend dari cash flow transformasi.'))
story.append(Spacer(1, 18))

# ---------- 4.7 UNTR ----------
story.append(heading2('4.7 ' + en('UNTR') + ' - United Tractors'))
story.append(Paragraph('THE DIVERSIFIED MINING PROXY', ParagraphStyle(
    'TagLine', fontName='TimesNewRoman', fontSize=10, leading=14,
    textColor=ACCENT_BLUE, spaceBefore=2, spaceAfter=8, leftIndent=5
)))

story.append(heading3('Profil Diversifikasi'))
story.append(body(
    + en('United Tractors') + ' menawarkan eksposur ke sektor pertambangan yang unik melalui '
    'empat pilar bisnis: (1) Kontraktor tambang terbesar Indonesia - ' + en('Pama Persada') + ', '
    '(2) Distributor alat berat ' + en('Komatsu') + ', '
    '(3) Pertambangan emas melalui ' + en('PT Agincourt Resources') + ' (Martabe), dan '
    '(4) Pertambangan nikel melalui ' + en('Pamapersada') + '. '
    'Diversifikasi ini memberikan mining exposure tanpa risiko murni pada satu komoditas.'
))

story.append(Spacer(1, 6))
story.append(heading3('Metrik Valuasi'))
story.append(bullet(en('PBV: ~1.3x') + ' - <b>sangat murah</b> untuk kualitas aset'))
story.append(bullet('Dividend Yield: ' + en('6-8%') + ''))
story.append(bullet(en('DER') + ' rendah, posisi kas sangat kuat'))

story.append(Spacer(1, 6))
story.append(heading3('Catalyst & Target Harga'))
story.append(bullet('Harga saham saat ini: ~' + en('Rp24.000-25.000') + ''))
story.append(bullet('<b>Catalyst:</b> Harga emas tinggi, permintaan nikel dari EV battery, kontrak tambang baru'))
story.append(bullet('<b>Edge:</b> Mining proxy dengan diversifikasi, kontraktor tambang memberikan recurring revenue'))

story.append(Spacer(1, 8))
story.append(verdict_box('<b>VERDICT: BUY</b> - Mining exposure terdiversifikasi tanpa risiko murni tambang. Emas sebagai lindung nilai inflasi.'))
story.append(Spacer(1, 18))

# ==============================================================================
# 5. SAHAM DIVIDEN BULAN APRIL 2026
# ==============================================================================
story.append(heading1('5. SAHAM DIVIDEN BULAN APRIL 2026'))
story.append(section_divider())

story.append(body(
    'Bulan April 2026 merupakan periode penting untuk dividend investor karena beberapa emiten besar '
    'akan melakukan pembagian dividen. Berikut adalah jadwal dividen yang teridentifikasi:'
))

story.append(Spacer(1, 12))

dividen_data = [
    ['Saham', 'Tipe Dividen', 'Dividen/Saham', 'Tanggal Cair', 'Catatan'],
    [en('BBCA'), 'Final 2025', en('Rp281'), '8 April 2026', 'Cum date ~3 April'],
    [en('INCO'), 'Interim 2026', en('~Rp50-80'), 'April 2026', 'Perkiraan'],
    [en('INDF'), 'Final 2025', en('~Rp35-45'), 'April 2026', 'Perkiraan'],
    [en('BBRI'), 'Final 2025', en('~Rp170-200'), 'April 2026', 'Perkiraan'],
]
story.extend(make_table(dividen_data, [55, 70, 80, 85, 120], 'Tabel 2: Jadwal Dividen April 2026'))

story.append(Spacer(1, 8))
story.append(heading2('5.1 Strategi Dividen Capture'))
story.append(body(
    '<b>Strategi:</b> Untuk mendapatkan dividen, investor harus membeli saham <b>sebelum cum-dividend date</b>. '
    'Harga saham biasanya turun sebesar dividen pada ex-date, namun dalam jangka panjang harga akan pulih. '
    'Untuk investor jangka panjang, ini bukan masalah signifikan karena fokus pada total return.'
))

story.append(bullet('Perhatikan ' + en('cum date') + ' ' + en('BBCA') + ' sekitar ' + en('3') + ' April 2026'))
story.append(bullet('Pastikan saham sudah masuk portofolio sebelum ' + en('settlement') + ' (' + en('T+2') + ')'))
story.append(bullet('Jangan panic sell saat ex-date drop - itu normal dan harga akan recover'))

story.append(Spacer(1, 18))

# ==============================================================================
# 6. STRATEGI EKSEKUSI
# ==============================================================================
story.append(heading1('6. STRATEGI EKSEKUSI'))
story.append(section_divider())

story.append(body(
    'Berikut adalah strategi yang direkomendasikan untuk mengeksekusi pembelian portofolio ini secara optimal:'
))

story.append(Spacer(1, 8))
story.append(heading2('6.1 Dollar Cost Averaging ' + en('(DCA)') + ''))
story.append(body(
    'Alih-alih membeli semua sekaligus (' + en('lump sum') + '), gunakan strategi ' + en('DCA') + ' '
    'dengan membeli secara bertahap selama ' + en('3-6') + ' bulan. Ini mengurangi risiko '
    + en('timing risk') + ' dan meratakan harga beli rata-rata.'
))
story.append(bullet('Bagi total dana investasi menjadi ' + en('6') + ' bagian'))
story.append(bullet('Beli setiap 2 minggu secara konsisten'))
story.append(bullet('Alokasi proporsional sesuai tabel portofolio'))

story.append(Spacer(1, 6))
story.append(heading2('6.2 Waktu Masuk ' + en('(Entry Point)') + ''))
story.append(body(
    'Kondisi pasar saat ini menunjukkan tekanan dari outflow asing yang memberikan valuasi yang lebih menarik. '
    'Ini merupakan window of opportunity untuk akumulasi bertahap.'
))
story.append(bullet('Koreksi asing menciptakan harga yang lebih murah dari rata-rata'))
story.append(bullet('Fundamental emiten tidak berubah signifikan'))
story.append(bullet('Sentimen pasar global berpotensi membaik dalam ' + en('6-12') + ' bulan'))

story.append(Spacer(1, 6))
story.append(heading2('6.3 Reinvestasi Dividen ' + en('(DRIP)') + ''))
story.append(body(
    'Strategi kunci untuk memaksimalkan ' + en('compounding effect') + ' adalah dengan mereinvestasi '
    'seluruh dividen yang diterima kembali ke portofolio. Dengan yield ' + en('5.5-6.5%') + ' '
    'dan reinvestasi, efek compounding akan signifikan dalam ' + en('5-10') + ' tahun.'
))

story.append(Spacer(1, 6))
story.append(heading2('6.4 Monitoring & Review'))
story.append(bullet('Evaluasi portofolio setiap ' + en('6') + ' bulan'))
story.append(bullet('Review laporan keuangan emiten per kuartal'))
story.append(bullet('Rebalance jika alokasi menyimpang lebih dari ' + en('5%') + ' dari target'))
story.append(bullet('Perhatikan perubahan target harga dari analis'))

story.append(Spacer(1, 18))

# ==============================================================================
# 7. RISIKO & MITIGASI
# ==============================================================================
story.append(heading1('7. RISIKO & MITIGASI'))
story.append(section_divider())

story.append(body(
    'Setiap investasi memiliki risiko. Berikut adalah identifikasi risiko utama dan strategi mitigasi '
    'untuk portofolio ini:'
))

story.append(Spacer(1, 12))

risiko_data = [
    ['Risiko', 'Probabilitas', 'Dampak', 'Mitigasi'],
    ['Outflow asing berlanjut', 'Medium', 'Medium', en('DCA') + ', hold jangka panjang'],
    ['Kenaikan suku bunga', 'Medium', 'Medium', 'Pilih bank CASA kuat (' + en('BBCA') + ')'],
    ['Resesi global', en('Low-Med'), 'High', 'Defensif allocation (' + en('ICBP, TLKM') + ')'],
    ['Harga komoditas crash', 'Low', 'Medium', en('Weight ADRO+UNTR') + ' cuma ' + en('20%') + ''],
    ['Geopolitik (perdagangan)', 'Medium', 'Medium', 'Diversifikasi sektor dalam portofolio'],
    ['Kebijakan regulasi', 'Low', 'Medium', 'Pilih emiten compliance tinggi'],
    ['Teknologi disruptif', 'Low', 'Low', 'Emiten memiliki adaptasi digital kuat'],
]
story.extend(make_table(risiko_data, [110, 70, 55, 195], 'Tabel 3: Matriks Risiko & Mitigasi'))

story.append(Spacer(1, 8))
story.append(body(
    '<b>Catatan Penting:</b> Portofolio ini dirancang dengan prinsip diversifikasi untuk meminimalkan risiko spesifik emiten. '
    'Alokasi defensif sebesar ' + en('60%') + ' (bank + telco) memberikan bantalan terhadap gejolak pasar, '
    'sementara alokasi ' + en('20%') + ' pada komoditas memberikan upside potensial.'
))

story.append(Spacer(1, 18))

# ==============================================================================
# 8. DAFTAR SUMBER
# ==============================================================================
story.append(heading1('8. DAFTAR SUMBER'))
story.append(section_divider())

story.append(body('Data dan analisis dalam laporan ini bersumber dari:'))

story.append(Spacer(1, 6))

sources = [
    'Bursa Efek Indonesia ' + en('(IDX)') + ' - ' + en('www.idx.co.id') + '',
    'BRI Danareksa Sekuritas - Laporan Riset Harian dan Mingguan',
    'Kiwoom Sekuritas Indonesia - Rekomendasi Saham',
    'EXA AI ' + en('Deep Research') + ' - Analisis komprehensif berbasis AI',
    'Kontan.co.id - Berita Pasar Modal Indonesia',
    'Bisnis Indonesia - Data dan Analisis Ekonomi',
    'Investor.id - Laporan Riset dan Rekomendasi',
    'Eddyelly (Konten Kreator Saham) - Analisis Teknikal & Fundamental',
    'Laporan Keuangan Tahunan Emiten 2025 - Laporan Auditan',
    'Bank Indonesia - Statistik Perbankan Indonesia',
    'Otoritas Jasa Keuangan ' + en('(OJK)') + ' - Data Regulasi Pasar Modal',
    'Yahoo Finance - Data Historis Harga Saham',
]

for i, src in enumerate(sources, 1):
    story.append(bullet('<b>' + str(i) + '.</b>  ' + src))

story.append(Spacer(1, 18))

# ==============================================================================
# DISCLAIMER
# ==============================================================================
story.append(Spacer(1, 24))
story.append(HRFlowable(width="100%", thickness=0.5, color=MEDIUM_GRAY, spaceAfter=8, spaceBefore=8))
story.append(Paragraph(
    '<b>DISCLAIMER:</b> Laporan ini disusun untuk keperluan edukasi dan informasi saja. '
    'Ini bukan rekomendasi untuk membeli atau menjual efek tertentu. '
    'Keputusan investasi sepenuhnya menjadi tanggung jawab investor. '
    'Performa masa lalu tidak menjamin hasil di masa mendatang. '
    'Selalu lakukan riset mandiri ' + en('(DYOR)') + ' sebelum berinvestasi.',
    style_disclaimer
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    '\u00a9 2026 alatpajak.id Research Division. Seluruh hak dilindungi.',
    style_disclaimer
))

# ==============================================================================
# GENERATE PDF
# ==============================================================================
doc = TocDocTemplate(
    OUTPUT_PATH,
    pagesize=A4,
    title='Analisis Investasi Saham Indonesia 2026',
    author='alatpajak.id Research Division',
    subject='Rekomendasi Portofolio Saham Indonesia - Dividen Berkelanjutan',
    creator='alatpajak.id',
)

# Multi-build for TOC
from reportlab.platypus import multiBuild
multiBuild(doc, story)

print(f"PDF berhasil dibuat: {OUTPUT_PATH}")
