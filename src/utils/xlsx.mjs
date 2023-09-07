import xlsx, { writeFile } from 'xlsx';

export async function loadXlsx(xlsxFile, sheetName) {
  const workbook = await xlsx.readFile(xlsxFile, {
    cellDates: true,
  });

  if (!sheetName) {
    sheetName = workbook.SheetNames[0];
  }
  const sheet = workbook.Sheets[sheetName];

  const data = xlsx.utils.sheet_to_json(sheet);
  return data;
}

export async function writeXlsx(data, xlsxFileName, sheetName) {
  const book = xlsx.utils.book_new();
  const WS = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(book, WS, sheetName || 'Sheet1');
  await writeFile(book, xlsxFileName);
  console.log(`wrote ${xlsxFileName}`);
}
