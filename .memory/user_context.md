# USER MEMORY — Rinboomcrush
# Last updated: 2026-03-31T04:40:00Z

## 👤 Profil User
- **Nama**: Rinboomcrush
- **UID**: 794228495404367893
- **Platform**: Discord (Direct Message)
- **Profesi**: Anak Pajak (Tax Professional / Konsultan Pajak)
- **Bahasa**: Indonesia (Bahasa)
- **Channel**: discord
- **Session**: discord:0a37ca2b-20f4-4f90-a4da-526d69d65b50:direct:1478521105659465759

## 🔑 EXA AI Setup
- **API Key**: `4fc6e601-92b1-4966-8e7d-8a311eae4fa2`
- **Skill Path**: `/home/z/my-project/skills/exa-ai/`
- **Script Path**: `/home/z/my-project/skills/exa-ai/scripts/exa_search.js`
- **Base URL**: `https://api.exa.ai`
- **Trigger Words** (untuk aktifkan EXA AI): "recall", "deep research", "riset mendalam", "research", "cari mendalam", "semantik", "semantic search"
- **Default Search Type**: `auto` (auto-select antara neural/keyword)
- **Default Max Characters**: 3000
- **Default Num Results**: 10

## 🎤 Voice Note / ASR
- Bisa transcribe voice note user (OGG → WAV → Cloud ASR)
- Gue support bahasa Indonesia & English
- File voice note disimpan di /home/z/my-project/upload/

## 🎬 Video Generation
- Skill tersedia tapi proses LAMBAT (5-10 menit per video)
- Sering timeout di environment saat ini
- **Alternatif**: generate gambar (10-20 detik), atau bikin audio TTS

## ⏰ Cron Job — Daily Tax Insight
- **Job ID**: 55292
- **Nama**: 📊 Daily Tax Insight + @kring_pajak Monitor
- **Jadwal**: Setiap hari jam 07:00 WIB (Asia/Jakarta)
- **Priority**: 10 (high)

### Cron Job Workflow:
1. Cek peraturan pajak terbaru via EXA AI (7 hari terakhir) → WAJIB info kalau ada
2. Monitor tweet & replies dari @kring_pajak (Kring Pajak DJP)
3. Pantau 3 website: DDTC, Ortax, Peraturan.go.id
4. Cek hot topic perpajakan (trending)
5. Anti duplikasi: cek daily_insights sebelumnya
6. Format output: TAX INSIGHT HARIAN + @kring_pajak section
7. Filter: HANYA info yang penting/signifikan, skip yang minor

### Website yang Dimonitor:
- https://perpajakan.ddtc.co.id/sumber-hukum/peraturan/pencarian
- https://datacenter.ortax.org/ortax/aturan/list
- https://peraturan.go.id/

## 📂 File yang Pernah Dibuat
- **PPT**: `/home/z/my-project/download/OpenClaw_Setup_Anak_Pajak.pptx` — Presentasi setup OpenClaw buat anak pajak (8 slide)
- **PPT Workspace**: `/home/z/my-project/download/ppt_workspace/`
- **EXA Skill**: `/home/z/my-project/skills/exa-ai/SKILL.md` + `scripts/exa_search.js`
- **SKILL PPTX Copy**: `/home/z/my-project/download/SKILL_PPTX.txt`

## 🧠 Preferensi & Konteks
- User adalah anak pajak → semua konten harus relevan dengan perpajakan Indonesia
- Suka format yang ringkas, terstruktur, dan praktis
- Tertarik dengan: OpenClaw, AI agent, otomasi perpajakan
- Menggunakan Discord sebagai platform utama
- API key EXA AI sudah disetup dan siap pakai
- Web-search bawaan dipake untuk quick lookup, EXA AI hanya untuk deep research

## 📋 Riwayat Interaksi
| Tanggal | Aktivitas |
|---------|-----------|
| 2026-03-31 | Pertama kali nyambung |
| 2026-03-31 | Bikin PPT "Cara Simpel Setup OpenClaw buat Anak Pajak" (8 slide) |
| 2026-03-31 | Liat skill PPTX (SKILL.md + html2pptx.md) |
| 2026-03-31 | Setup custom skill EXA AI (deep research) |
| 2026-03-31 | Setup cron job Daily Tax Insight jam 7 pagi |
| 2026-03-31 | Update cron job: tambah monitor @kring_pajaj |
| 2026-03-31 | Tes voice note ASR (OGG → WAV → text) |
| 2026-03-31 | Coba video generation (timeout, lambat) → generate gambar chicken pajak sebagai alternatif |
| 2026-03-31 | Simpan memory untuk koneksi antar session |
