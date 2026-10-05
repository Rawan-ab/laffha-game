import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');

for (const file of ['responsive-layout-v77.css', 'lobby-cleanup-v77.js']) {
  const src = path.join(root, file);
  const dest = path.join(out, file);
  if (!fs.existsSync(src)) throw new Error(`Missing V77 asset: ${file}`);
  fs.copyFileSync(src, dest);
}

for (const page of ['index.html', 'play-v12.html']) {
  const file = path.join(out, page);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace('content="76"', 'content="77"');
  if (!html.includes('responsive-layout-v77.css')) {
    html = html.replace('</head>', '  <link rel="stylesheet" href="responsive-layout-v77.css?v=77" />\n</head>');
  }
  if (!html.includes('lobby-cleanup-v77.js')) {
    html = html.replace('</body>', '  <script src="lobby-cleanup-v77.js?v=77"></script>\n</body>');
  }
  fs.writeFileSync(file, html);
}

console.log('LAFFHA_V77_PRODUCTION_PATCH_OK');
