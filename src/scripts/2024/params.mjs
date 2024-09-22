export const year = 2024;

export const clubdeskPlayersFile = 'files/24/input/clubdesk-players.csv';

// VB file such as downloaded from VB Manager.
// Tweaked to merge together junior matches scored as one match.
// !!! DO NOT REDOWNLOAD FROM VB MANAGER
export const VBManagerInputFile = 'files/24/input/vb-manager.xlsx';

// ↓↓↓ run.mjs - Scorers are assigned to matches in a generated spreadsheet.
export const assignedFile = 'files/24/output/assigned.xlsx';

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
