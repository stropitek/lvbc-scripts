import fs from 'fs/promises';

import papaparse from 'papaparse';

import { clubdeskPlayersFile } from '../scripts/2024/params.mjs';

export async function loadCSV(file, options = {}) {
  const fileContents = await fs.readFile(file, encodings[file] || 'utf8');
  return new Promise((resolve, reject) => {
    const complete = (result) => resolve(result.data);
    const error = (error) => reject(error);
    papaparse.parse(fileContents, {
      header: true,
      ...options,
      complete,
      error,
    });
  });
}

export async function writeCSV(data, file, options = {}) {
  const serialized = papaparse.unparse(data, {
    quotes: true,
    ...options,
  });
  await fs.writeFile(file, serialized, 'utf8');
}

const encodings = {
  [clubdeskPlayersFile]: 'latin1',
};
