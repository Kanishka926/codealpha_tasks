const fs = require('fs');
const path = require('path');
const { categories } = require('./generate-data.js');
const productsA = require('./products-a.js');
const productsB = require('./products-b.js');
const productsC = require('./products-c.js');
const productsD = require('./products-d.js');

const allProducts = [...productsA, ...productsB, ...productsC, ...productsD];

// Add image and discount fields for frontend compatibility
allProducts.forEach(p => {
  p.image = p.images && p.images.length > 0 ? p.images[0] : '';
  p.discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
});

// Verify unique IDs
const ids = allProducts.map(p => p.id);
const uniqueIds = new Set(ids);
if (ids.length !== uniqueIds.size) {
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  console.error('Duplicate IDs found:', [...new Set(dupes)]);
  process.exit(1);
}

// Verify all products reference valid categories
const catSlugs = categories.map(c => c.slug);
const invalidCats = allProducts.filter(p => !catSlugs.includes(p.category));
if (invalidCats.length > 0) {
  console.error('Invalid categories:', invalidCats.map(p => p.id + ' -> ' + p.category));
  process.exit(1);
}

// Count per category
const counts = {};
allProducts.forEach(p => {
  counts[p.category] = (counts[p.category] || 0) + 1;
});

const data = {
  categories: categories,
  products: allProducts
};

const outPath = path.resolve(__dirname, '../../public/JS/data.json');
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));

console.log('=== data.json Generated ===');
console.log('Categories:', categories.length);
console.log('Products:', allProducts.length);
console.log('');
console.log('Per category:');
Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  const name = categories.find(c => c.slug === cat)?.name || cat;
  console.log(`  ${name} (${cat}): ${count}`);
});
console.log('');
console.log('All product IDs unique:', uniqueIds.size === allProducts.length ? 'YES' : 'NO');
console.log('File:', outPath);
