import fs from 'node:fs/promises';

const debugDir = 'files/debug';

export async function debugFile(fileName) {
  try {
    await fs.access(debugDir);
  } catch {
    await fs.mkdir(debugDir);
  }
  return `${debugDir}/${fileName}`;
}
