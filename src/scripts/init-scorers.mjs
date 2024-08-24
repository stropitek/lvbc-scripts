import {
  BIRTH_YEAR_CLUBDESK,
  LEAGUE_CLUBDESK,
  minScorerAge,
} from '../utils/constants.mjs';
import { loadCSV, writeCSV } from '../utils/csv.mjs';

import { clubdeskPlayersFile, playersFile, year } from './2024/params.mjs';

try {
  const result = await loadCSV(clubdeskPlayersFile, {
    header: true,
    delimiter: ';',
  });

  const players = result.filter((row) => {
    const age = year - Number(row[BIRTH_YEAR_CLUBDESK]);
    return (
      row.Marqueur === 'Marqueur' &&
      row[LEAGUE_CLUBDESK] !== 'Arbitre' &&
      age >= minScorerAge
    );
  });
  await writeCSV(players, playersFile);
} catch (err) {
  console.error('error', err);
}
