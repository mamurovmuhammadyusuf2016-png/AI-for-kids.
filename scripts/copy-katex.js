// Copies the KaTeX browser build (script, styles, woff2 fonts) into public/vendor/katex.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'node_modules', 'katex', 'dist');
const dest = path.join(__dirname, '..', 'public', 'vendor', 'katex');
fs.mkdirSync(path.join(dest, 'fonts'), { recursive: true });
for (const f of ['katex.min.js', 'katex.min.css']) fs.copyFileSync(path.join(src, f), path.join(dest, f));
for (const f of fs.readdirSync(path.join(src, 'fonts'))) {
  if (f.endsWith('.woff2')) fs.copyFileSync(path.join(src, 'fonts', f), path.join(dest, 'fonts', f));
}
console.log('KaTeX copied to public/vendor/katex');
