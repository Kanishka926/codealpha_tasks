const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '../../public/JS/data.json');
const imagesDir = path.resolve(__dirname, '../../public/images/products');

// Category → color mapping for distinct, attractive backgrounds
const catColors = {
  'electronics':     { bg: '#1a1a2e', fg: '#e94560', accent: '#0f3460' },
  'clothing':        { bg: '#2d132c', fg: '#ee4540', accent: '#c72c41' },
  'home-kitchen':    { bg: '#1b262c', fg: '#bbe1fa', accent: '#3282b8' },
  'books':           { bg: '#2c2c34', fg: '#f0c987', accent: '#6c5b7b' },
  'sports':          { bg: '#1c1c1c', fg: '#4ecca3', accent: '#2b7a78' },
  'accessories':     { bg: '#2b2024', fg: '#d4a5a5', accent: '#c97b84' },
  'beauty':          { bg: '#2a1f3d', fg: '#e8b4b8', accent: '#9b59b6' },
  'grocery':         { bg: '#1a3c34', fg: '#a8d8b9', accent: '#3d7068' },
  'toys':            { bg: '#1a1a40', fg: '#f7d794', accent: '#f8a5c2' },
  'baby':            { bg: '#fdf6ec', fg: '#6c5ce7', accent: '#a29bfe' },
  'pets':            { bg: '#2c3e50', fg: '#e74c3c', accent: '#e67e22' },
  'health':          { bg: '#0d3b66', fg: '#a8dadc', accent: '#457b9d' },
  'automotive':      { bg: '#1e1e1e', fg: '#f39c12', accent: '#e67e22' },
  'office':          { bg: '#2c3e50', fg: '#ecf0f1', accent: '#95a5a6' },
  'music':           { bg: '#1a1a2e', fg: '#e94560', accent: '#533483' },
  'gaming':          { bg: '#0f0f23', fg: '#00ff88', accent: '#1a1a3e' },
  'furniture':       { bg: '#3d2b1f', fg: '#d4a574', accent: '#8b6914' },
  'cameras':         { bg: '#1a1a1a', fg: '#ff6b6b', accent: '#4ecdc4' },
  'phones':          { bg: '#0c0c1d', fg: '#6c5ce7', accent: '#a29bfe' },
  'computers':       { bg: '#1e272e', fg: '#48dbfb', accent: '#0abde3' },
  'audio':           { bg: '#130f40', fg: '#ff9ff3', accent: '#f368e0' },
  'mens-fashion':    { bg: '#2c3e50', fg: '#3498db', accent: '#2980b9' },
  'womens-fashion':  { bg: '#2d1b41', fg: '#e056a0', accent: '#c44569' },
  'shoes':           { bg: '#2d3436', fg: '#fdcb6e', accent: '#e17055' },
  'bags':            { bg: '#353b48', fg: '#7f8fa6', accent: '#718093' },
  'jewellery':       { bg: '#1a1a2e', fg: '#f5cd79', accent: '#f8b739' },
  'decor':           { bg: '#2d2d3a', fg: '#c8d6e5', accent: '#8395a7' },
  'garden':          { bg: '#1e4d2b', fg: '#a3cb38', accent: '#6ab04c' },
  'kitchen':         { bg: '#341f1f', fg: '#f19066', accent: '#e15f41' },
  'fitness':         { bg: '#1a1a2e', fg: '#ff6348', accent: '#eb4d4b' },
  'travel':          { bg: '#1e3799', fg: '#f8c291', accent: '#e55039' },
  'stationery':      { bg: '#f5f0e1', fg: '#6c5ce7', accent: '#a29bfe' },
  'watches':         { bg: '#1e272e', fg: '#d2dae2', accent: '#57606f' },
  'kids-fashion':    { bg: '#ffeaa7', fg: '#e17055', accent: '#d63031' },
  'food-beverages':  { bg: '#2d3436', fg: '#ffeaa7', accent: '#fdcb6e' },
  'sports-equipment':{ bg: '#0c2461', fg: '#f8efba', accent: '#e58e26' },
  'smart-home':      { bg: '#0a3d62', fg: '#82ccdd', accent: '#3c6382' }
};

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function wrapText(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxLen) {
      if (line) lines.push(line.trim());
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

function generateSVG(product) {
  const colors = catColors[product.category] || { bg: '#2c3e50', fg: '#ecf0f1', accent: '#95a5a6' };
  const lines = wrapText(product.name, 22);
  const lineSpacing = 28;
  const textStartY = 240 - ((lines.length - 1) * lineSpacing) / 2;

  let textElements = '';
  lines.forEach((line, i) => {
    textElements += `<text x="300" y="${textStartY + i * lineSpacing}" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="bold" fill="${colors.fg}" text-anchor="middle">${escapeXml(line)}</text>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:1"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <rect x="20" y="20" width="560" height="560" rx="16" ry="16" fill="none" stroke="${colors.fg}" stroke-opacity="0.2" stroke-width="2"/>
  <circle cx="300" cy="160" r="50" fill="${colors.fg}" fill-opacity="0.15"/>
  <text x="300" y="168" font-family="Arial,sans-serif" font-size="36" fill="${colors.fg}" text-anchor="middle" fill-opacity="0.6">📦</text>
  ${textElements}
  <text x="300" y="${textStartY + lines.length * lineSpacing + 30}" font-family="Arial,Helvetica,sans-serif" font-size="16" fill="${colors.fg}" text-anchor="middle" fill-opacity="0.5">${escapeXml(product.brand)}</text>
  <text x="300" y="${textStartY + lines.length * lineSpacing + 60}" font-family="Arial,Helvetica,sans-serif" font-size="14" fill="${colors.fg}" text-anchor="middle" fill-opacity="0.35">₹${product.price.toLocaleString('en-IN')}</text>
  <rect x="180" y="${textStartY + lines.length * lineSpacing + 80}" width="240" height="3" rx="1.5" fill="${colors.fg}" fill-opacity="0.15"/>
</svg>`;
}

// Read current data.json
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(`Generating SVG images for ${data.products.length} products...`);

let created = 0;
for (const product of data.products) {
  const svg = generateSVG(product);
  const filePath = path.join(imagesDir, `${product.product_id || product.id}.svg`);

  fs.writeFileSync(filePath, svg, 'utf8');
  created++;

  // Set local paths: image = first image, images = array of local paths
  const localPath = `images/products/${product.product_id || product.id}.svg`;
  product.image = localPath;
  product.images = [localPath];
}

// Also generate category images
const catImageDir = path.resolve(__dirname, '../../public/images/categories');
if (!fs.existsSync(catImageDir)) {
  fs.mkdirSync(catImageDir, { recursive: true });
}

for (const cat of data.categories) {
  const colors = catColors[cat.slug] || { bg: '#2c3e50', fg: '#ecf0f1', accent: '#95a5a6' };
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:1"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <rect x="12" y="12" width="376" height="376" rx="12" ry="12" fill="none" stroke="${colors.fg}" stroke-opacity="0.2" stroke-width="2"/>
  <text x="200" y="200" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="bold" fill="${colors.fg}" text-anchor="middle" fill-opacity="0.8">${escapeXml(cat.name)}</text>
</svg>`;
  const catPath = path.join(catImageDir, `${cat.slug}.svg`);
  fs.writeFileSync(catPath, svg, 'utf8');
  cat.image = `images/categories/${cat.slug}.svg`;
}

// Write updated data.json
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`Created ${created} product images in: ${imagesDir}`);
console.log(`Created ${data.categories.length} category images in: ${catImageDir}`);
console.log('Updated data.json with local image paths.');
console.log('');
console.log('Verification:');

// Verify all images exist
let missing = 0;
for (const product of data.products) {
  const imgPath = path.resolve(__dirname, '../../public', product.image);
  if (!fs.existsSync(imgPath)) {
    console.log(`  MISSING: ${product.id} → ${product.image}`);
    missing++;
  }
}
for (const cat of data.categories) {
  const imgPath = path.resolve(__dirname, '../../public', cat.image);
  if (!fs.existsSync(imgPath)) {
    console.log(`  MISSING category: ${cat.slug} → ${cat.image}`);
    missing++;
  }
}
if (missing === 0) {
  console.log(`  All ${data.products.length} product images: OK`);
  console.log(`  All ${data.categories.length} category images: OK`);
}
