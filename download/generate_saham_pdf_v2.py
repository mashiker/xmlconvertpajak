#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate comprehensive Indonesian Stock Investment Analysis PDF Report
Analisis Investasi Saham Indonesia - alatpajak.id Research Division
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, HRFlowable
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
pdfmetrics.registerFontFamily('SimHei', normal='SimHei', bold='SimHei', italic='SimHei', boldItalic='SimHei')
pdfmetrics.registerFontFamily('TimesNewRoman', normal='TimesNewRoman', bold='TimesNewRoman', italic='TimesNewRoman', boldItalic='TimesNewRoman')

# ==============================================================================
# COLORS
# ==============================================================================
DARK_BLUE = HexColor('#1F4E79')
MEDIUM_BLUE = HexColor('#2E75B6')
LIGHT_BLUE = HexColor('#D6E4F0')
ACCENT_BLUE = HexColor('#4472C4')
DARK_GRAY = HexColor('#333333')
MEDIUM_GRAY = HexColor('#666666')
ROW_ALT = HexColor('#E8EEF4')
GREEN_ACCENT = HexColor('#548235')

# ==============================================================================
# STYLES
# ==============================================================================
style_cover_title = ParagraphStyle('CoverTitle', fontName='SimHei', fontSize=24, leading=32, textColor=DARK_BLUE, alignment=TA_CENTER, spaceAfter=12)
style_cover_subtitle = ParagraphStyle('CoverSubtitle', fontName='SimHei', fontSize=13, leading=20, textColor=MEDIUM_BLUE, alignment=TA_CENTER, spaceAfter=8)
style_cover_info = ParagraphStyle('CoverInfo', fontName='SimHei', fontSize=11, leading=16, textColor=MEDIUM_GRAY, alignment=TA_CENTER)
style_toc_h1 = ParagraphStyle('TOCH1', fontName='SimHei', fontSize=13, leading=22, leftIndent=20, textColor=DARK_BLUE)
style_toc_h2 = ParagraphStyle('TOCH2', fontName='SimHei', fontSize=11, leading=18, leftIndent=40, textColor=DARK_GRAY)
style_h1 = ParagraphStyle('CustomH1', fontName='SimHei', fontSize=18, leading=26, textColor=DARK_BLUE, spaceBefore=18, spaceAfter=10)
style_h2 = ParagraphStyle('CustomH2', fontName='SimHei', fontSize=14, leading=20, textColor=MEDIUM_BLUE, spaceBefore=14, spaceAfter=8)
style_h3 = ParagraphStyle('CustomH3', fontName='SimHei', fontSize=12, leading=18, textColor=DARK_GRAY, spaceBefore=10, spaceAfter=6)
style_body = ParagraphStyle('CustomBody', fontName='SimHei', fontSize=10.5, leading=17, textColor=black, alignment=TA_LEFT, wordWrap='CJK', spaceBefore=2, spaceAfter=4)
style_bullet = ParagraphStyle('CustomBullet', fontName='SimHei', fontSize=10.5, leading=17, textColor=black, alignment=TA_LEFT, wordWrap='CJK', leftIndent=20, bulletIndent=8, spaceBefore=1, spaceAfter=2)
style_table_caption = ParagraphStyle('TableCaption', fontName='SimHei', fontSize=9.5, leading=14, textColor=MEDIUM_GRAY, alignment=TA_CENTER, spaceBefore=4, spaceAfter=8)
style_disclaimer = ParagraphStyle('Disclaimer', fontName='SimHei', fontSize=8.5, leading=13, textColor=MEDIUM_GRAY, alignment=TA_CENTER, wordWrap='CJK')
style_tagline = ParagraphStyle('TagLine', fontName='TimesNewRoman', fontSize=10, leading=14, textColor=ACCENT_BLUE, spaceBefore=2, spaceAfter=8, leftIndent=5)
style_verdict = ParagraphStyle('Verdict', fontName='SimHei', fontSize=11, leading=16, textColor=DARK_BLUE, alignment=TA_LEFT, wordWrap='CJK', spaceBefore=6, spaceAfter=6, leftIndent=10)

# ==============================================================================
# HELPERS
# ==============================================================================
def en(text):
    return '<font name="TimesNewRoman">' + text + '</font>'

def h1(text):
    return Paragraph(text, style_h1)

def h2(text):
    return Paragraph(text, style_h2)

def h3(text):
    return Paragraph(text, style_h3)

def body(text):
    return Paragraph(text, style_body)

def bullet(text):
    return Paragraph(text, style_bullet, bulletText='•')

def divider():
    return HRFlowable(width="100%", thickness=1, color=LIGHT_BLUE, spaceAfter=10, spaceBefore=6)

def verdict_box(text):
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

# Table cell styles
style_tbl_header = ParagraphStyle('TblHeader', fontName='SimHei', fontSize=9.5, leading=14, textColor=white, alignment=TA_CENTER, wordWrap='CJK')
style_tbl_cell = ParagraphStyle('TblCell', fontName='SimHei', fontSize=9, leading=14, textColor=black, alignment=TA_CENTER, wordWrap='CJK')
style_tbl_cell_left = ParagraphStyle('TblCellLeft', fontName='SimHei', fontSize=9, leading=14, textColor=black, alignment=TA_LEFT, wordWrap='CJK')

def make_table(data, col_widths, caption=None):
    elements = []
    if caption:
        elements.append(Paragraph(caption, style_table_caption))
        elements.append(Spacer(1, 4))
    # Wrap all cells in Paragraph objects for proper rendering
    para_data = []
    for row_idx, row in enumerate(data):
        para_row = []
        for cell in row:
            if row_idx == 0:
                para_row.append(Paragraph('<b>' + str(cell) + '</b>', style_tbl_header))
            else:
                para_row.append(Paragraph(str(cell), style_tbl_cell))
        para_data.append(para_row)
    t = Table(para_data, colWidths=col_widths, repeatRows=1)
    num_rows = len(para_data)
    cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), DARK_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
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
    for i in range(1, num_rows):
        if i % 2 == 0:
            cmds.append(('BACKGROUND', (0, i), (-1, i), ROW_ALT))
    t.setStyle(TableStyle(cmds))
    elements.append(t)
    elements.append(Spacer(1, 8))
    return elements


# ==============================================================================
# CUSTOM DOCUMENT TEMPLATE WITH TOC
# ==============================================================================
class TocDocTemplate(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        BaseDocTemplate.__init__(self, filename, **kwargs)
        frame_main = Frame(2.2*cm, 2.2*cm, A4[0] - 4.4*cm, A4[1] - 5.0*cm, id='main', showBoundary=0)
        frame_cover = Frame(2.5*cm, 2*cm, A4[0] - 5*cm, A4[1] - 4*cm, id='cover', showBoundary=0)
        template_cover = PageTemplate(id='Cover', frames=[frame_cover], onPage=self._cover_page)
        template_normal = PageTemplate(id='Normal', frames=[frame_main], onPage=self._normal_page)
        self.addPageTemplates([template_cover, template_normal])

    def _cover_page(self, canvas, doc):
        canvas.saveState()
        canvas.setFillColor(DARK_BLUE)
        canvas.rect(0, A4[1] - 2*cm, A4[0], 2*cm, fill=1, stroke=0)
        canvas.setFillColor(DARK_BLUE)
        canvas.rect(0, 0, A4[0], 1.5*cm, fill=1, stroke=0)
        canvas.setFillColor(white)
        canvas.setFont('SimHei', 8)
        canvas.drawCentredString(A4[0]/2, 0.6*cm, 'alatpajak.id Research Division - Laporan Analisis Saham Indonesia')
        canvas.restoreState()

    def _normal_page(self, canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(DARK_BLUE)
        canvas.setLineWidth(1.5)
        canvas.line(2*cm, A4[1] - 1.8*cm, A4[0] - 2*cm, A4[1] - 1.8*cm)
        canvas.setFillColor(MEDIUM_BLUE)
        canvas.setFont('SimHei', 8)
        canvas.drawString(2.2*cm, A4[1] - 1.6*cm, 'Analisis Investasi Saham Indonesia 2026')
        canvas.drawRightString(A4[0] - 2.2*cm, A4[1] - 1.6*cm, 'alatpajak.id')
        canvas.setStrokeColor(DARK_BLUE)
        canvas.setLineWidth(0.8)
        canvas.line(2*cm, 1.8*cm, A4[0] - 2*cm, 1.8*cm)
        canvas.setFillColor(MEDIUM_GRAY)
        canvas.setFont('SimHei', 8)
        canvas.drawCentredString(A4[0]/2, 1.0*cm, str(doc.page))
        canvas.restoreState()

    def afterFlowable(self, flowable):
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
# BUILD STORY
# ==============================================================================
OUTPUT_PATH = '/home/z/my-project/download/analisis_saham_jevi_2026.pdf'
LOGO_PATH = '/home/z/my-project/download/alatpajak_logo.png'

story = []

# ===== COVER PAGE =====
story.append(NextPageTemplate('Cover'))
story.append(Spacer(1, 2.5*cm))

if os.path.exists(LOGO_PATH):
    logo = Image(LOGO_PATH, width=3.5*cm, height=3.5*cm)
    logo.hAlign = 'CENTER'
    story.append(logo)
    story.append(Spacer(1, 0.8*cm))

story.append(Paragraph('ANALISIS INVESTASI SAHAM INDONESIA', style_cover_title))
story.append(Spacer(1, 0.3*cm))
story.append(HRFlowable(width="60%", thickness=2, color=ACCENT_BLUE, spaceAfter=12, spaceBefore=4))

subtitle_text = 'Rekomendasi Portofolio Jangka Panjang ' + en('(5-10 Tahun)') + ' dengan Dividen Berkelanjutan'
story.append(Paragraph(subtitle_text, style_cover_subtitle))
story.append(Spacer(1, 1.5*cm))
story.append(Paragraph('alatpajak.id ' + en('Research Division'), style_cover_info))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph('31 Maret 2026', style_cover_info))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph('Versi 1.0 - Untuk Keperluan Edukasi Investasi', style_cover_info))

story.append(NextPageTemplate('Normal'))
story.append(PageBreak())

# ===== TABLE OF CONTENTS =====
story.append(h1('DAFTAR ISI'))
story.append(Spacer(1, 12))
toc = TableOfContents()
toc.levelStyles = [style_toc_h1, style_toc_h2]
story.append(toc)
story.append(PageBreak())

# ===== 1. EXECUTIVE SUMMARY =====
story.append(h1('1. RINGKASAN EKSEKUTIF'))
story.append(divider())

s1 = ('Laporan ini menyajikan rekomendasi portofolio investasi saham Indonesia yang terdiri dari '
      en('7') + ' emiten unggulan dengan fokus pada dividen berkelanjutan dan pertumbuhan jangka panjang. '
      'Portofolio ini dirancang untuk investor dengan horizon investasi ' + en('5-10') + ' tahun yang menginginkan '
      'kombinasi pendapatan dividen reguler dan apresiasi modal.')
story.append(body(s1))

story.append(Spacer(1, 8))
story.append(body('<b>Highlights Rekomendasi:</b>'))

story.append(bullet('Portofolio terdiri dari ' + en('7') + ' saham ' + en('blue-chip') + ' Indonesia dengan ' + en('track record') + ' dividen minimal ' + en('5') + ' tahun.'))
story.append(bullet('Expected portfolio yield: ' + en('5.5-6.5%') + ' per tahun dari dividen saja, di atas rata-rata deposito bank.'))
story.append(bullet('Alokasi dibagi menjadi tiga kategori: ' + en('Defensif Core (60%)') + ', ' + en('Growth + Income (20%)') + ', dan ' + en('High Yield (20%)') + '.'))
story.append(bullet('Semua emiten memiliki fundamental kuat, likuiditas tinggi di Bursa Efek Indonesia, dan bisnis yang ' + en('sustainable') + '.'))
story.append(bullet('Kondisi pasar saat ini (koreksi asing, valuasi menarik) memberikan ' + en('entry point') + ' yang ideal untuk akumulasi bertahap.'))

story.append(Spacer(1, 10))
s2 = ('Dengan strategi ' + en('Dollar Cost Averaging') + ' selama ' + en('3-6') + ' bulan dan reinvestasi dividen, '
      'portofolio ini berpotensi menghasilkan ' + en('total return 12-15%') + ' per tahun dalam jangka panjang, '
      'terdiri dari dividen ' + en('5.5-6.5%') + ' dan pertumbuhan modal ' + en('6-9%') + '.')
story.append(body(s2))
story.append(Spacer(1, 18))

# ===== 2. METODOLOGI RISET =====
story.append(h1('2. METODOLOGI RISET'))
story.append(divider())

story.append(body('Analisis dalam laporan ini dilakukan menggunakan pendekatan ' + en('top-down') + ' dan ' + en('bottom-up') + ' dengan data dari berbagai sumber terpercaya.'))
story.append(Spacer(1, 6))
story.append(h2('2.1 Sumber Data'))
story.append(bullet('Bursa Efek Indonesia ' + en('(IDX)') + ' - Data harga, volume, dan laporan keuangan emiten'))
story.append(bullet('Laporan Keuangan Tahunan Emiten 2025 - ' + en('Audited financial statements')))
story.append(bullet('BRI Danareksa Sekuritas - Analisis riset dan target harga'))
story.append(bullet('Kiwoom Sekuritas - Rekomendasi saham Indonesia'))
story.append(bullet('EXA AI ' + en('Deep Research') + ' - Analisis komprehensif berbasis AI'))
story.append(bullet('Kontan, Bisnis Indonesia, Investor.id - Berita dan ' + en('sentiment') + ' pasar'))

story.append(Spacer(1, 6))
story.append(h2('2.2 Kriteria Seleksi'))
story.append(bullet('Track record pembagian dividen minimal ' + en('5') + ' tahun berturut-turut'))
story.append(bullet('Fundamental kuat: ' + en('ROE > 15%') + ', pertumbuhan laba positif, neraca sehat'))
story.append(bullet('Likuiditas tinggi: masuk dalam daftar ' + en('LQ45') + ' atau ' + en('IDX30')))
story.append(bullet('Bisnis ' + en('sustainable') + ' dengan ' + en('moat') + ' kompetitif yang kuat'))
story.append(bullet('Valuasi masih menarik relatif terhadap sejarah dan ' + en('peer') + ''))
story.append(Spacer(1, 18))

# ===== 3. PORTOFOLIO REKOMENDASI =====
story.append(h1('3. PORTOFOLIO REKOMENDASI'))
story.append(divider())

story.append(body('Berikut adalah alokasi portofolio yang direkomendasikan, dirancang untuk memberikan keseimbangan antara keamanan, pendapatan dividen, dan potensi pertumbuhan:'))
story.append(Spacer(1, 12))

portfolio_data = [
    ['Saham', 'Alokasi', 'Expected Yield', 'Kategori'],
    [en('BBCA'), '25%', '4-5%', 'Defensif Core'],
    [en('BBRI'), '20%', '5-7%', 'Defensif Core'],
    [en('TLKM'), '15%', '4-5%', 'Defensif Core'],
    [en('BMRI'), '10%', '4-5.5%', en('Growth + Income')],
    [en('ICBP'), '10%', '3-4%', en('Growth + Income')],
    [en('ADRO'), '10%', '8-11%', 'High Yield'],
    [en('UNTR'), '10%', '6-8%', 'High Yield'],
]
story.extend(make_table(portfolio_data, [80, 80, 110, 140], 'Tabel 1: Alokasi Portofolio Rekomendasi'))

s3 = ('<b>Ringkasan Alokasi:</b> Portofolio didominasi oleh sektor perbankan ' + en('(65%)') + ' '
      'yang merupakan tulang punggung ekonomi Indonesia, dilengkapi dengan telekomunikasi defensif, '
      + en('consumer goods') + ', dan eksposur komoditas yang terbatas. Expected ' + en('blended yield') + ' portofolio '
      'berada di kisaran ' + en('5.5-6.5%') + ' per tahun.')
story.append(body(s3))
story.append(Spacer(1, 18))

# ===== 4. DEEP DIVE ANALISIS PER SAHAM =====
story.append(h1('4. DEEP DIVE ANALISIS PER SAHAM'))
story.append(divider())

# ---------- 4.1 BBCA ----------
story.append(h2('4.1 ' + en('BBCA') + ' - Bank Central Asia'))
story.append(Paragraph('THE ANCHOR PORTFOLIO', style_tagline))

story.append(h3('Valuasi & Kinerja Keuangan 2025'))
story.append(bullet('Laba Bersih 2025: ' + en('Rp57,5') + ' Triliun (+4.9% ' + en('YoY') + ')'))
story.append(bullet('Total Kredit: ' + en('Rp993') + ' Triliun (+7.7%) - pertumbuhan sehat'))
story.append(bullet('Dana Pihak Ketiga ' + en('(DPK)') + ': ' + en('Rp1.249') + ' Triliun (+10.2%)'))
story.append(bullet('CASA: ' + en('Rp1.045') + ' Triliun (+13.1%) - dominasi likuiditas murah'))

story.append(h3('Metrik Valuasi'))
story.append(bullet(en('PBV: 4.0-5.0x') + ' (' + en('premium') + ', namun ' + en('justified') + ' oleh kualitas aset)'))
story.append(bullet(en('PER: ~18x') + ' (sejalan dengan pertumbuhan stabil)'))
story.append(bullet(en('ROE: >20%') + ' - tertinggi di antara bank-bank besar'))
story.append(bullet(en('NPL: <1.5%') + ' - kualitas aset sangat terjaga'))

story.append(h3('Profil Dividen'))
s_bbc_div = ('Dividen final 2025 sebesar ' + en('Rp281/saham') + ', dengan total dividen sekitar ' + en('Rp336/saham') + ' '
             '(termasuk interim). Yield berada di kisaran ' + en('4-5%') + ' dengan ' + en('payout ratio 60-70%') + '. '
             + en('BBCA') + ' memiliki ' + en('track record') + ' pembagian dividen yang paling konsisten di Indonesia.')
story.append(body(s_bbc_div))

story.append(h3('Catalyst & Target Harga'))
story.append(bullet('Harga saham saat ini: ~' + en('Rp6.700-6.800')))
story.append(bullet('Target harga BRI Danareksa: ' + en('Rp11.400 (BUY)') + ' - ' + en('upside 46-68%')))
story.append(bullet('<b>Catalyst:</b> Insider buying oleh Jahja Setia Atmadja (pemilik mayoritas), dominasi ' + en('digital banking') + ' melalui ' + en('BCA Digital/Sakuku')))
story.append(bullet('<b>Edge kompetitif:</b> Jaringan CASA terkuat di Indonesia, biaya dana terendah'))

story.append(Spacer(1, 8))
story.append(verdict_box('<b>VERDICT: STRONG BUY</b> - Anchor portofolio dengan kualitas terbaik. Premium valuasi ' + en('justified') + ' oleh ' + en('superior ROE') + ' dan CASA ' + en('dominance') + '.'))
story.append(Spacer(1, 18))

# ---------- 4.2 BBRI ----------
story.append(h2('4.2 ' + en('BBRI') + ' - Bank Rakyat Indonesia'))
story.append(Paragraph('THE INCOME GENERATOR', style_tagline))

story.append(h3('Valuasi & Kinerja Keuangan 2025'))
story.append(bullet('Laba Bersih 2025: ' + en('Rp57,13') + ' Triliun (-5.2% ' + en('YoY') + ') - penurunan dari basis tinggi'))
story.append(bullet('Total Kredit: ' + en('Rp1.517') + ' Triliun (+12.67%) - <b>tertinggi di Big 4</b>'))
story.append(bullet('DPK: ' + en('Rp1.466') + ' Triliun (+7.42%)'))
story.append(bullet('Pertumbuhan kredit UMKM tetap kuat, mendukung segmentasi inti'))

story.append(h3('Metrik Valuasi'))
story.append(bullet(en('PBV: ~1.8x') + ' - <b>diskon signifikan</b> terhadap ' + en('BBCA')))
story.append(bullet(en('PER: ~12x') + ' - valuasi sangat menarik'))
story.append(bullet(en('ROE: ~18%') + ' - tetap di atas rata-rata industri'))

story.append(h3('Profil Dividen'))
s_bbr_div = ('Dividen yield ' + en('5-7%') + ' merupakan <b>tertinggi di antara Big 4 Bank</b>. '
             + en('Dividend Payout Ratio / DPR: 75-85%') + ', mencerminkan komitmen ' + en('shareholder return') + ' yang kuat. '
             'Sebagai BUMN, ' + en('BBRI') + ' memiliki kebijakan dividen yang transparan dan konsisten.')
story.append(body(s_bbr_div))

story.append(h3('Catalyst & Target Harga'))
story.append(bullet('Harga saham saat ini: ~' + en('Rp3.600-3.800')))
story.append(bullet('Target harga BRI Danareksa: ' + en('Rp4.400 (BUY)')))
story.append(bullet('<b>Catalyst:</b> Pemulihan ' + en('NIM') + ' setelah fase ekspansi kredit, penurunan ' + en('CET Ratio') + ' berlebih'))
story.append(bullet('<b>Edge:</b> Pemimpin segmen UMKM, ekosistem ' + en('digital BRI Mobile') + ' terbesar'))

story.append(Spacer(1, 8))
story.append(verdict_box('<b>VERDICT: STRONG BUY</b> - Dividen yield tertinggi Big 4 dengan valuasi diskon. Ideal untuk ' + en('income-focused') + ' investor.'))
story.append(Spacer(1, 18))

# ---------- 4.3 TLKM ----------
story.append(h2('4.3 ' + en('TLKM') + ' - Telkom Indonesia'))
story.append(Paragraph('THE DEFENSIVE CASH COW', style_tagline))

story.append(h3('Profil Bisnis'))
s_tlkm = (en('Telkom Indonesia') + ' memiliki monopoli de facto pada infrastruktur fixed broadband '
          'melalui ' + en('IndiHome') + ' dan dominasi pasar seluler melalui ' + en('Telkomsel') + ' (patungan dengan Singtel). '
          'Bisnis telekomunikasi bersifat defensif karena permintaan bersifat ' + en('inelastic') + ' - '
          'konsumen tetap berlangganan bahkan saat resesi.')
story.append(body(s_tlkm))

story.append(h3('Metrik Valuasi'))
story.append(bullet(en('PBV: ~2.5x')))
story.append(bullet(en('PER: ~14x')))
story.append(bullet('Dividend Yield: ' + en('4-5%')))
story.append(bullet(en('DPR: 60-80%') + ' - komitmen dividen kuat'))

story.append(h3('Catalyst & Target Harga'))
story.append(bullet('Harga saham saat ini: ~' + en('Rp3.500-3.800')))
story.append(bullet('Target harga BRI Danareksa: ' + en('Rp4.000 (BUY)')))
story.append(bullet('<b>Catalyst:</b> Transformasi digital, pertumbuhan ' + en('cloud') + ' dan ' + en('data center')))
story.append(bullet('<b>Edge:</b> Monopoli fixed line, arus kas paling stabil di portofolio'))

story.append(Spacer(1, 8))
story.append(verdict_box('<b>VERDICT: BUY</b> - Paling aman untuk ' + en('dividend investor') + ' konservatif. ' + en('Cash flow machine') + ' dengan ' + en('volatilitas') + ' terendah.'))
story.append(Spacer(1, 18))

# ---------- 4.4 BMRI ----------
story.append(h2('4.4 ' + en('BMRI') + ' - Bank Mandiri'))
story.append(Paragraph('THE GROWTH BANK', style_tagline))

story.append(h3('Valuasi & Kinerja Keuangan 2025'))
story.append(bullet('Laba Bersih 2025: ' + en('Rp56,3') + ' Triliun (+0.93%) - stabil di tengah tekanan'))
story.append(bullet('Total Kredit: ' + en('Rp1.895') + ' Triliun (+13.4%) - <b>tertinggi di Indonesia</b>'))
story.append(bullet('Total Aset: ' + en('Rp2.829') + ' Triliun (+16.6%) - bank terbesar'))
story.append(bullet(en('NPL: 0.96%') + ' - kualitas aset sangat baik'))

story.append(h3('Metrik Valuasi'))
story.append(bullet(en('PBV: ~1.2x') + ' - <b>sangat murah</b> untuk bank sistemik'))
story.append(bullet(en('PER: ~15x')))
story.append(bullet(en('CAR: 20.4%') + ' - ' + en('buffer') + ' kapital kuat'))
story.append(bullet('Dividend Yield: ' + en('4-5.5%')))
story.append(bullet(en('DPR: 60-70%')))

story.append(h3('Catalyst & Target Harga'))
story.append(bullet('Harga saham saat ini: ~' + en('Rp4.000-4.200')))
story.append(bullet('Target harga BRI Danareksa: ' + en('Rp6.200 (BUY)') + ' - ' + en('upside ~50%')))
story.append(bullet('<b>Catalyst:</b> Bank terbesar Indonesia, diversifikasi segmen korporasi, sindikasi, dan ' + en('investment banking')))
story.append(bullet('<b>Edge:</b> ' + en('Franchise') + ' korporasi terkuat, kepemilikan ' + en('mandiri tunai finance')))

story.append(Spacer(1, 8))
story.append(verdict_box('<b>VERDICT: BUY</b> - Valuasi termurah di Big 4 dengan ' + en('upside') + ' terbesar. Bank sistemik terbesar Indonesia.'))
story.append(Spacer(1, 18))

# ---------- 4.5 ICBP ----------
story.append(h2('4.5 ' + en('ICBP') + ' - Indofood CBP'))
story.append(Paragraph('THE DEFENSIVE CONSUMER', style_tagline))

story.append(h3('Profil Bisnis'))
s_icbp = (en('Indofood CBP Sukses Makmur') + ' adalah perusahaan ' + en('consumer goods') + ' terbesar Indonesia, '
          'menguasai pasar mi instan (Indomie), snack, dairy, minuman, dan penyedap makanan. '
          + en('Pricing power') + ' yang kuat memungkinkan perusahaan menyesuaikan harga di tengah inflasi. '
          'Diversifikasi ekspor ke lebih dari ' + en('80') + ' negara memberikan pilar pertumbuhan tambahan.')
story.append(body(s_icbp))

story.append(h3('Metrik Valuasi'))
story.append(bullet(en('PBV: ~2.2x')))
story.append(bullet(en('PER: ~15x')))
story.append(bullet('Dividend Yield: ' + en('3-4%')))

story.append(h3('Catalyst & Target Harga'))
story.append(bullet('Harga saham saat ini: ~' + en('Rp7.800-8.000')))
story.append(bullet('Target harga BRI Danareksa: ' + en('Rp11.500')))
story.append(bullet('<b>Catalyst:</b> Ekspansi pasar ekspor, penetrasi produk ' + en('premium') + ', efisiensi biaya'))
story.append(bullet('<b>Edge:</b> Merek Indomie ikonik, ' + en('pricing power') + ' tertinggi di sektor'))

story.append(Spacer(1, 8))
story.append(verdict_box('<b>VERDICT: BUY</b> - Paling defensif saat resesi. Permintaan ' + en('consumer goods') + ' bersifat ' + en('inelastic') + '.'))
story.append(Spacer(1, 18))

# ---------- 4.6 ADRO ----------
story.append(h2('4.6 ' + en('ADRO') + ' - Adaro Energy'))
story.append(Paragraph('THE HIGH YIELD TRANSFORMER', style_tagline))

story.append(h3('Transformasi Bisnis'))
s_adro = (en('Adaro Energy Indonesia') + ' sedang melakukan transformasi besar dari perusahaan batu bara '
          'menjadi perusahaan energi terintegrasi. Diversifikasi mencakup pembangunan smelter aluminium '
          'yang akan beroperasional pada 2026, serta investasi di energi hijau dan ' + en('renewable energy') + '. '
          'Arus kas dari operasi batu bara yang kuat menjadi sumber pendanaan transformasi ini.')
story.append(body(s_adro))

story.append(h3('Metrik Valuasi'))
story.append(bullet(en('PBV: ~1.2x') + ' - <b>sangat murah</b>'))
story.append(bullet('Dividend Yield: ' + en('8-11%') + ' - <b>tertinggi di portofolio</b>'))
story.append(bullet(en('DPR: 40-50%') + ' - masih ruang untuk meningkatkan dividen'))

story.append(h3('Catalyst & Target Harga'))
story.append(bullet('Harga saham saat ini: ~' + en('Rp2.000-2.200')))
story.append(bullet('<b>Catalyst:</b> Smelter aluminium operasional 2026, potensi ' + en('special dividend') + ', diversifikasi ' + en('revenue')))
story.append(bullet('<b>Risiko:</b> Harga batu bara ' + en('volatile') + ', ekspektasi pasar terhadap transformasi'))

story.append(Spacer(1, 8))
story.append(verdict_box('<b>VERDICT: BUY</b> - Dividen yield tertinggi dengan valuasi murah. Potensi ' + en('special dividend') + ' dari ' + en('cash flow') + ' transformasi.'))
story.append(Spacer(1, 18))

# ---------- 4.7 UNTR ----------
story.append(h2('4.7 ' + en('UNTR') + ' - United Tractors'))
story.append(Paragraph('THE DIVERSIFIED MINING PROXY', style_tagline))

story.append(h3('Profil Diversifikasi'))
s_untr = (en('United Tractors') + ' menawarkan eksposur ke sektor pertambangan yang unik melalui '
          'empat pilar bisnis: (1) Kontraktor tambang terbesar Indonesia - ' + en('Pama Persada') + ', '
          '(2) Distributor alat berat ' + en('Komatsu') + ', '
          '(3) Pertambangan emas melalui ' + en('PT Agincourt Resources') + ' (Martabe), dan '
          '(4) Pertambangan nikel melalui ' + en('Pamapersada') + '. '
          'Diversifikasi ini memberikan ' + en('mining exposure') + ' tanpa risiko murni pada satu komoditas.')
story.append(body(s_untr))

story.append(h3('Metrik Valuasi'))
story.append(bullet(en('PBV: ~1.3x') + ' - <b>sangat murah</b> untuk kualitas aset'))
story.append(bullet('Dividend Yield: ' + en('6-8%')))
story.append(bullet(en('DER') + ' rendah, posisi kas sangat kuat'))

story.append(h3('Catalyst & Target Harga'))
story.append(bullet('Harga saham saat ini: ~' + en('Rp24.000-25.000')))
story.append(bullet('<b>Catalyst:</b> Harga emas tinggi, permintaan nikel dari ' + en('EV battery') + ', kontrak tambang baru'))
story.append(bullet('<b>Edge:</b> ' + en('Mining proxy') + ' dengan diversifikasi, kontraktor tambang memberikan ' + en('recurring revenue')))

story.append(Spacer(1, 8))
story.append(verdict_box('<b>VERDICT: BUY</b> - ' + en('Mining exposure') + ' terdiversifikasi tanpa risiko murni tambang. Emas sebagai lindung nilai inflasi.'))
story.append(Spacer(1, 18))

# ===== 5. SAHAM DIVIDEN BULAN APRIL 2026 =====
story.append(h1('5. SAHAM DIVIDEN BULAN APRIL 2026'))
story.append(divider())

story.append(body('Bulan April 2026 merupakan periode penting untuk ' + en('dividend investor') + ' karena beberapa emiten besar akan melakukan pembagian dividen:'))
story.append(Spacer(1, 12))

dividen_data = [
    ['Saham', 'Tipe Dividen', 'Dividen/Saham', 'Tanggal Cair', 'Catatan'],
    [en('BBCA'), 'Final 2025', en('Rp281'), '8 April 2026', en('Cum date') + ' ~3 April'],
    [en('INCO'), 'Interim 2026', en('~Rp50-80'), 'April 2026', 'Perkiraan'],
    [en('INDF'), 'Final 2025', en('~Rp35-45'), 'April 2026', 'Perkiraan'],
    [en('BBRI'), 'Final 2025', en('~Rp170-200'), 'April 2026', 'Perkiraan'],
]
story.extend(make_table(dividen_data, [55, 70, 80, 85, 120], 'Tabel 2: Jadwal Dividen April 2026'))

story.append(h2('5.1 Strategi ' + en('Dividen Capture')))
s_cap = ('<b>Strategi:</b> Untuk mendapatkan dividen, investor harus membeli saham <b>sebelum ' + en('cum-dividend date') + '</b>. '
         'Harga saham biasanya turun sebesar dividen pada ' + en('ex-date') + ', namun dalam jangka panjang harga akan pulih. '
         'Untuk investor jangka panjang, ini bukan masalah signifikan karena fokus pada ' + en('total return') + '.')
story.append(body(s_cap))

story.append(bullet('Perhatikan ' + en('cum date BBCA') + ' sekitar ' + en('3') + ' April 2026'))
story.append(bullet('Pastikan saham sudah masuk portofolio sebelum ' + en('settlement (T+2)')))
story.append(bullet('Jangan ' + en('panic sell') + ' saat ' + en('ex-date drop') + ' - itu normal dan harga akan ' + en('recover')))
story.append(Spacer(1, 18))

# ===== 6. STRATEGI EKSEKUSI =====
story.append(h1('6. STRATEGI EKSEKUSI'))
story.append(divider())

story.append(body('Berikut adalah strategi yang direkomendasikan untuk mengeksekusi pembelian portofolio ini secara optimal:'))

story.append(h2('6.1 Dollar Cost Averaging ' + en('(DCA)')))
s_dca = ('Alih-alih membeli semua sekaligus (' + en('lump sum') + '), gunakan strategi ' + en('DCA') + ' '
         'dengan membeli secara bertahap selama ' + en('3-6') + ' bulan. Ini mengurangi risiko ' + en('timing risk') + ' '
         'dan meratakan harga beli rata-rata.')
story.append(body(s_dca))
story.append(bullet('Bagi total dana investasi menjadi ' + en('6') + ' bagian'))
story.append(bullet('Beli setiap ' + en('2') + ' minggu secara konsisten'))
story.append(bullet('Alokasi proporsional sesuai tabel portofolio'))

story.append(h2('6.2 Waktu Masuk ' + en('(Entry Point)')))
s_entry = ('Kondisi pasar saat ini menunjukkan tekanan dari ' + en('outflow') + ' asing yang memberikan valuasi yang lebih menarik. '
           'Ini merupakan ' + en('window of opportunity') + ' untuk akumulasi bertahap.')
story.append(body(s_entry))
story.append(bullet('Koreksi asing menciptakan harga yang lebih murah dari rata-rata'))
story.append(bullet('Fundamental emiten tidak berubah signifikan'))
story.append(bullet('Sentimen pasar global berpotensi membaik dalam ' + en('6-12') + ' bulan'))

story.append(h2('6.3 Reinvestasi Dividen ' + en('(DRIP)')))
s_drip = ('Strategi kunci untuk memaksimalkan ' + en('compounding effect') + ' adalah dengan mereinvestasi '
          'seluruh dividen yang diterima kembali ke portofolio. Dengan yield ' + en('5.5-6.5%') + ' '
          'dan reinvestasi, efek ' + en('compounding') + ' akan signifikan dalam ' + en('5-10') + ' tahun.')
story.append(body(s_drip))

story.append(h2('6.4 Monitoring & Review'))
story.append(bullet('Evaluasi portofolio setiap ' + en('6') + ' bulan'))
story.append(bullet('Review laporan keuangan emiten per kuartal'))
story.append(bullet(en('Rebalance') + ' jika alokasi menyimpang lebih dari ' + en('5%') + ' dari target'))
story.append(bullet('Perhatikan perubahan target harga dari analis'))
story.append(Spacer(1, 18))

# ===== 7. RISIKO & MITIGASI =====
story.append(h1('7. RISIKO & MITIGASI'))
story.append(divider())

story.append(body('Setiap investasi memiliki risiko. Berikut adalah identifikasi risiko utama dan strategi mitigasi untuk portofolio ini:'))
story.append(Spacer(1, 12))

risiko_data = [
    ['Risiko', 'Probabilitas', 'Dampak', 'Mitigasi'],
    ['Outflow asing berlanjut', 'Medium', 'Medium', en('DCA') + ', hold jangka panjang'],
    ['Kenaikan suku bunga', 'Medium', 'Medium', 'Pilih bank CASA kuat (' + en('BBCA') + ')'],
    ['Resesi global', en('Low-Med'), 'High', 'Defensif (' + en('ICBP, TLKM') + ')'],
    ['Harga komoditas crash', 'Low', 'Medium', en('Weight ADRO+UNTR') + ' cuma ' + en('20%')],
    ['Geopolitik (perdagangan)', 'Medium', 'Medium', 'Diversifikasi sektor dalam portofolio'],
    ['Kebijakan regulasi', 'Low', 'Medium', 'Pilih emiten ' + en('compliance') + ' tinggi'],
    ['Teknologi disruptif', 'Low', 'Low', 'Emiten memiliki adaptasi digital kuat'],
]
story.extend(make_table(risiko_data, [110, 70, 55, 195], 'Tabel 3: Matriks Risiko & Mitigasi'))

s_risk = ('<b>Catatan Penting:</b> Portofolio ini dirancang dengan prinsip diversifikasi untuk meminimalkan risiko spesifik emiten. '
          'Alokasi defensif sebesar ' + en('60%') + ' (bank + telco) memberikan bantalan terhadap gejolak pasar, '
          'sementara alokasi ' + en('20%') + ' pada komoditas memberikan ' + en('upside') + ' potensial.')
story.append(body(s_risk))
story.append(Spacer(1, 18))

# ===== 8. DAFTAR SUMBER =====
story.append(h1('8. DAFTAR SUMBER'))
story.append(divider())

story.append(body('Data dan analisis dalam laporan ini bersumber dari:'))
story.append(Spacer(1, 6))

sources = [
    'Bursa Efek Indonesia ' + en('(IDX)') + ' - ' + en('www.idx.co.id'),
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

# ===== DISCLAIMER =====
story.append(Spacer(1, 24))
story.append(HRFlowable(width="100%", thickness=0.5, color=MEDIUM_GRAY, spaceAfter=8, spaceBefore=8))
story.append(Paragraph(
    '<b>DISCLAIMER:</b> Laporan ini disusun untuk keperluan edukasi dan informasi saja. '
    'Ini bukan rekomendasi untuk membeli atau menjual efek tertentu. '
    'Keputusan investasi sepenuhnya menjadi tanggung jawab investor. '
    + 'Performa masa lalu tidak menjamin hasil di masa mendatang. '
    + 'Selalu lakukan riset mandiri ' + en('(DYOR)') + ' sebelum berinvestasi.',
    style_disclaimer
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    '© 2026 alatpajak.id Research Division. Seluruh hak dilindungi.',
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

doc.multiBuild(story)
print("PDF berhasil dibuat:", OUTPUT_PATH)
