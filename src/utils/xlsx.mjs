import xlsx from 'xlsx';

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

export async function writeXlsx(
  data,
  xlsxFileName,
  sheetName,
  firstColumns = [],
) {
  const orderedData = [];
  for (let item of data) {
    const orderedItem = {};
    for (let column of firstColumns) {
      orderedItem[column] = item[column];
    }
    for (let column of Object.keys(item)) {
      if (!firstColumns.includes(column)) {
        orderedItem[column] = item[column];
      }
    }
    orderedData.push(orderedItem);
  }

  const book = xlsx.utils.book_new();
  const WS = xlsx.utils.json_to_sheet(orderedData);
  xlsx.utils.book_append_sheet(book, WS, sheetName || 'Sheet1');
  await xlsx.writeFile(book, xlsxFileName);
  console.log(`wrote ${xlsxFileName}`);
}
