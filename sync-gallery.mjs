import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const INDEX_PATH = path.join(ROOT, 'index.html');
const GALLERY_DIR = path.join(ROOT, 'gallery');

function titleFromFilename(filename) {
  // drop extension
  const ext = path.extname(filename);
  let base = filename.slice(0, -ext.length);
  // drop common postfixes
  base = base.replace(/\.steg$/i, '');
  // normalize separators
  base = base.replace(/[._-]+/g, ' ').trim();
  // basic titlecase
  base = base.split(/\s+/).map(w => w ? (w[0].toUpperCase() + w.slice(1)) : w).join(' ');
  return base || filename;
}

function buildDesignTimeItems(files) {
  const lines = [];
  lines.push('const DESIGN_TIME_ITEMS = [');
  for (const f of files) {
    const name = titleFromFilename(f);
    // Keep as a relative URL; the gallery page will resolve & encode it with new URL(...)
    const url = `./gallery/${f.replace(/\\/g, '/')}`;
    lines.push(`  { name: ${JSON.stringify(name)}, url: ${JSON.stringify(url)} },`);
  }
  lines.push('];');
  return lines.join('\n');
}

async function main() {
  // Verify paths
  await fs.access(INDEX_PATH);
  await fs.access(GALLERY_DIR);

  const dirents = await fs.readdir(GALLERY_DIR, { withFileTypes: true });
  const files = dirents
    .filter(d => d.isFile())
    .map(d => d.name)
    .filter(n => /\.(png)$/i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  const newBlock = buildDesignTimeItems(files);

  const html = await fs.readFile(INDEX_PATH, 'utf8');

  // Replace the entire DESIGN_TIME_ITEMS declaration.
  // Matches: const DESIGN_TIME_ITEMS = [ ... ];  (non-greedy)
  const re = /const\s+DESIGN_TIME_ITEMS\s*=\s*\[([\s\S]*?)\]\s*;?/m;
  if (!re.test(html)) {
    throw new Error('Could not find DESIGN_TIME_ITEMS block in index.html');
  }

  const updated = html.replace(re, newBlock);

  // Backup
  const backupPath = INDEX_PATH + '.bak';
  await fs.writeFile(backupPath, html, 'utf8');

  await fs.writeFile(INDEX_PATH, updated, 'utf8');

  console.log(`Synced ${files.length} PNG(s) from ./gallery to DESIGN_TIME_ITEMS.`);
  console.log(`Backup written to: ${path.basename(backupPath)}`);
}

main().catch((err) => {
  console.error('sync-gallery failed:', err?.message || err);
  process.exit(1);
});
