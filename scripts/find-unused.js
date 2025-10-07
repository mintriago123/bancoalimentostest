const fs = require('fs');
const path = require('path');

const root = process.cwd();
const srcDir = path.join(root, 'src');

function walk(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', '.next', 'out', 'dist'].includes(e.name)) continue;
      files.push(...walk(full));
    } else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) {
      files.push(full);
    }
  }
  return files;
}

function readAll(files) {
  const map = new Map();
  for (const f of files) {
    try {
      map.set(f, fs.readFileSync(f, 'utf8'));
    } catch (err) {
      map.set(f, '');
    }
  }
  return map;
}

const allFiles = walk(srcDir);
const contents = readAll(allFiles);

function toAlias(p) {
  // src/foo/bar.tsx -> @/foo/bar
  const rel = path.relative(path.join(root, 'src'), p).replace(/\\/g,'/');
  return `@/${rel.replace(/\.(ts|tsx|js|jsx)$/, '')}`;
}

function basenameNoExt(p) {
  return path.basename(p).replace(/\.(ts|tsx|js|jsx)$/, '');
}

const candidates = [];

for (const f of allFiles) {
  // skip page/layout files under app (Next routing)
  const rel = path.relative(srcDir, f).replace(/\\/g,'/');
  if (/^app\/.+\/(page|layout)\.(ts|tsx)$/.test(rel)) continue;

  // skip files in public or assets (shouldn't be in src though)
  // skip index files that may be entrypoints

  const alias = toAlias(f);
  const base = basenameNoExt(f);

  let count = 0;
  for (const [otherPath, text] of contents.entries()) {
    if (otherPath === f) continue;
    if (!text) continue;
    if (text.includes(alias)) count++;
    else if (text.includes(`/${base}`) || text.includes(` ${base}`) || text.includes(`'${base}'`) || text.includes(`"${base}"`)) {
      // rough heuristic: filename appears
      if (text.includes(base)) count++;
    }
  }

  if (count === 0) {
    candidates.push({ file: f, alias, base, rel });
  }
}

// Filter out likely false positives: files named "index" often imported via directory
const filtered = candidates.filter(c => !/^index\.(ts|tsx|js|jsx)$/.test(path.basename(c.file)));

console.log(JSON.stringify({ scanned: allFiles.length, candidates: filtered }, null, 2));
