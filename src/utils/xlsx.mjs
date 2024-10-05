import xlsx from 'xlsx';

export async function loadXlsx(xlsxFile, sheetName, rowStart) {
  await loadLib();
  const workbook = await xlsx.readFileSync(xlsxFile, {
    cellDates: true,
  });

  if (!sheetName) {
    sheetName = workbook.SheetNames[0];
  }
  const sheet = workbook.Sheets[sheetName];

  const data = xlsx.utils.sheet_to_json(sheet, { range: rowStart });
  return data;
}

export async function writeXlsx(data, xlsxFileName, sheetName, columns) {
  await loadLib();
  const lines = [];
  for (let item of data) {
    const currentLine = {};
    const keys = columns || Object.keys(item);
    for (let column of keys) {
      currentLine[column] = item[column];
    }
    lines.push(currentLine);
  }

  const book = xlsx.utils.book_new();
  const WS = xlsx.utils.json_to_sheet(lines);
  xlsx.utils.book_append_sheet(book, WS, sheetName || 'Sheet1');
  await xlsx.writeFile(book, xlsxFileName);
  console.log(`wrote ${xlsxFileName}`);
}

async function loadLib() {
  while (true) {
    if (xlsx) return;
    // eslint-disable-next-line no-await-in-loop
    await wait(1);
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
