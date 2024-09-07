import { differenceInSeconds } from 'date-fns';

export function convertTZ(date, tzString) {
  return new Date(
    (typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', {
      timeZone: tzString,
    }),
  );
}

export function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function dateToString(date) {
  return date.toLocaleString('fr', { timeZone: 'Europe/Zurich' });
}

export function isApproximatelySameDate(date1, date2) {
  const diff = Math.abs(differenceInSeconds(date1, date2));
  if (diff > 60) {
    return false;
  }
  return true;
}
