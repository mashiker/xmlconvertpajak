const sharp = require('sharp');

async function createAssets() {
  // Cover gradient background
  const coverGrad = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0B5E8A"/>
      <stop offset="100%" style="stop-color:#1284BA"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="650" cy="400" r="300" fill="#0D6A9E" opacity="0.3"/>
    <circle cx="900" cy="200" r="150" fill="#FF862F" opacity="0.15"/>
  </svg>`;
  await sharp(Buffer.from(coverGrad)).png().toFile('cover_bg.png');

  // Section header gradient
  const sectionGrad = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810">
    <rect width="100%" height="100%" fill="#FEFEFE"/>
    <rect x="0" y="0" width="1440" height="80" fill="#1284BA"/>
  </svg>`;
  await sharp(Buffer.from(sectionGrad)).png().toFile('section_bg.png');

  // Closing gradient
  const closingGrad = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810">
    <defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1284BA"/>
      <stop offset="100%" style="stop-color:#0B5E8A"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g2)"/>
    <circle cx="300" cy="500" r="200" fill="#FF862F" opacity="0.12"/>
  </svg>`;
  await sharp(Buffer.from(closingGrad)).png().toFile('closing_bg.png');

  // Accent bar
  const accentBar = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="6">
    <rect width="80" height="6" rx="3" fill="#FF862F"/>
  </svg>`;
  await sharp(Buffer.from(accentBar)).png().toFile('accent_bar.png');

  console.log('Assets created');
}
createAssets().catch(console.error);
