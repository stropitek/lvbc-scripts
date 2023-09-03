import { loadXlsx } from './utils/xlsx.mjs';

const file1 = '../output.xlsx';
const file2 = '../spreadsheets/matches-23-loic.xlsx';

const data1 = await loadXlsx(file1);
const data2 = await loadXlsx(file2);

const ID_KEY = '# Match';

const commonKeys = commonItems(Object.keys(data1[0]), Object.keys(data2[0]));

if (commonKeys.length === 0) {
  throw new Error('No common keys found');
}

if (!commonKeys.includes(ID_KEY)) {
  throw new Error(`Both sheets must have an ID column ${ID_KEY}`);
}

const diff1 = difference(Object.keys(data1[0]), commonKeys);
const diff2 = difference(Object.keys(data2[0]), commonKeys);

const obj1 = filterKeys(data1, diff1);
const obj2 = filterKeys(data2, diff2);

console.log('exists in 1 but not in 2');
console.table(obj1);
console.log('exists in 2 but not in 1');
console.table(obj2);

// Get the common items between two arrays
function commonItems(arr1, arr2) {
  return arr1.filter((item) => arr2.includes(item));
}

// Get the items which exist in the first array but not in the second
function difference(arr1, arr2) {
  return arr1.filter((item) => !arr2.includes(item));
}
