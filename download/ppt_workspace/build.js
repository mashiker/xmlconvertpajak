const pptxgen = require('pptxgenjs');
const html2pptx = require('/home/z/my-project/skills/pptx/scripts/html2pptx');
const path = require('path');

async function build() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Super Z';
  pptx.title = 'Cara Simpel Setup OpenClaw buat Anak Pajak';

  const slides = [
    'slide1_cover.html',
    'slide2_intro.html',
    'slide3_whypajak.html',
    'slide4_setup1.html',
    'slide5_setup2.html',
    'slide6_skills1.html',
    'slide7_skills2.html',
    'slide8_closing.html',
  ];

  for (const s of slides) {
    console.log(`Processing ${s}...`);
    await html2pptx(path.join(__dirname, s), pptx);
  }

  const outPath = '/home/z/my-project/download/OpenClaw_Setup_Anak_Pajak.pptx';
  await pptx.writeFile({ fileName: outPath });
  console.log(`Saved to ${outPath}`);
}

build().catch(e => { console.error(e); process.exit(1); });
