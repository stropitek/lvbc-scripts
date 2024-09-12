import {
  CLUBDESK_BIRTH_YEAR,
  CLUBDESK_LEAGUE,
  CLUBDESK_UID,
  minScorerAge,
} from '../utils/constants.mjs';
import { loadCSV, writeCSV } from '../utils/csv.mjs';

import { clubdeskPlayersFile, playersFile, year } from './2024/params.mjs';

try {
  const result = await loadCSV(clubdeskPlayersFile, {
    header: true,
    delimiter: ';',
  });

  const playerSet = new Set(result.map((r) => r[CLUBDESK_UID]));
  const uniquePlayers = Array.from(playerSet).map((uid) => {
    return result.find((row) => row[CLUBDESK_UID] === uid);
  });

  const players = uniquePlayers.filter((row) => {
    const age = year - Number(row[CLUBDESK_BIRTH_YEAR]);
    return (
      row.Marqueur === 'Marqueur' &&
      row[CLUBDESK_LEAGUE] !== 'Arbitre' &&
      age >= minScorerAge
    );
  });

  await writeCSV(players, playersFile);
} catch (err) {
  console.error('error', err);
}
