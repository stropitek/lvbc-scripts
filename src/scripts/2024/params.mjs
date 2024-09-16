export const year = 2024;

export const clubdeskPlayersFile = 'files/24/input/clubdesk-players.csv';

// VB file such as downloaded from VB Manager. Don't touch it!
export const VBManagerInputFile = 'files/24/input/vb-manager.xlsx';
// ↓↓↓ init-schedule.mjs - Filtered and sorted. Only home matches kept. Additional columns for scorer added.
export const preassignedFile = 'files/24/input/pre-assigned.xlsx';

// The preassigned file can now be tweaked
// Usually:
//   - Junior matches are merged together

// ↓↓↓ fill-schedule.mjs - Scorers are assigned to matches.
export const assignedFile = 'files/24/output/assigned.xlsx';

export const tunedFile = 'files/24/input/assigned-tuned.xlsx';
// ↓↓↓ check-schedule.mjs - Analyses file and logs conflicts.
// ↓↓↓ rewrite.mjs - From tuned file and VBManagerInputFile. Makes sure the ids and dates are correct.
export const rewriteFileExternal = 'files/24/output/googlesheet-rewritten.xlsx';

// ↓↓↓ Google sheet export
export const tunedFileExternal = 'files/24/input/googlesheet.xlsx';

export const SEASON_START = new Date('2024-09-01');

// [day, timeStart, timeEnd]
// day: from 0 = Sunday to 6 = Saturday
// time: 'HH:mm'
export const trainingSchedule = {
  M1: [
    [2, '20:00', '22:00'],
    [4, '19:30', '22:30'],
  ],
  M2: [
    [2, '21:00', '22:30'],
    [4, '20:00', '22:00'],
  ],
  M4: [
    [2, '20:00', '22:00'],
    [4, '19:30', '22:30'],
  ],
  M20F: [
    [2, '18:00', '19:30'],
    [4, '18:00', '20:00'],
  ],
  F2: [
    [1, '20:00', '22:00'],
    [3, '20:00', '22:00'],
  ],
  F4: [
    [1, '20:00', '22:00'],
    [4, '19:30', '21:00'],
  ],
  M23F: [
    [1, '18:00', '20:00'],
    [4, '18:00', '19:30'],
  ],
  M18G: [
    [2, '18:00', '20:00'],
    [4, '18:00', '19:30'],
  ],
};

export const ASSIGNMENT_CUTOFF = new Date('2025-12-15');

export const MAX_ASSIGNMENTS = 2;

export const MAX_MATCH_AFTER_TRAINING_MINUTES = 45;
export const MIN_MATCH_BEFORE_TRAINING_MINUTES = 1440;

export const TRAINING_CONFLICT_SCORE = 10;
export const BASELINE_SCORE = 20;
export const POSITIVE_MATCH_CONFLICT_SCORE = 50;
