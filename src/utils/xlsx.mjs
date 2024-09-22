import xlsx from 'xlsx';

export async function loadXlsx(xlsxFile, sheetName) {
  await loadLib();
  const workbook = await xlsx.readFileSync(xlsxFile, {
    cellDates: true,
  });

  if (!sheetName) {
    sheetName = workbook.SheetNames[0];
    console.log('No sheet name provided, using first sheet:', sheetName);
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
  await loadLib();
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
