import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(projectRoot, 'src');
const violations = [];
const bannedPatterns = [
  { label: 'Date.now()', pattern: /\bDate\s*\.\s*now\s*\(/g },
  { label: 'new Date() without arguments', pattern: /\bnew\s+Date\s*\(\s*\)/g },
];

async function inspectDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await inspectDirectory(absolutePath);
      continue;
    }

    if (!entry.isFile() || !/\.tsx?$/.test(entry.name)) continue;

    const relativePath = path.relative(projectRoot, absolutePath).replaceAll(path.sep, '/');
    if (relativePath === 'src/lib/clock.ts') continue;

    const source = await readFile(absolutePath, 'utf8');
    for (const { label, pattern } of bannedPatterns) {
      for (const match of source.matchAll(pattern)) {
        const line = source.slice(0, match.index).split('\n').length;
        violations.push(`${relativePath}:${line}: ${label} must use src/lib/clock.ts`);
      }
    }
  }
}

await inspectDirectory(sourceRoot);

if (violations.length) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Clock contract passed');
}
