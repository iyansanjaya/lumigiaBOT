import { spawnSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const ROOTS = ['src', 'deploy-commands.js'];

async function collectJavaScriptFiles(filePath) {
  if (extname(filePath) === '.js') {
    return [filePath];
  }

  const entries = await readdir(filePath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const childPath = join(filePath, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectJavaScriptFiles(childPath));
    } else if (entry.isFile() && extname(entry.name) === '.js') {
      files.push(childPath);
    }
  }

  return files;
}

const files = (await Promise.all(ROOTS.map(collectJavaScriptFiles))).flat();

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Syntax check passed for ${files.length} JavaScript files.`);
