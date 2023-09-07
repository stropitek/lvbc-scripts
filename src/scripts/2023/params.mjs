export const xlsxFile = 'input/matches-23.xlsx';

export const factors = {
  // Each assigned match counts as 2
  'Lausanne M18G': 2.5,
};

// Those teams cannot be assigned matches
export const exempted = {
  'Lausanne M17F': true,
};

export const outputFile = 'output/matches-23-assigned.xlsx';

export const preassignedFile = 'input/matches-23-pre-assigned.xlsx';

export const tunedFile = 'input/matches-23-assigned-tuned.xlsx';

// from 0 = Sunday to 6 = Saturday
// Matches are almost always at 20:30 so we don't add to the schedule if they train before
export const trainingSchedule = {
  'Lausanne III M4': [2, 4],
  'Lausanne II F4': [2, 4],
  'Lausanne II M2': [2, 4],
  'Lausanne M19F': [],
  'Lausanne M18G': [],
  'Lausanne M23F': [],
  'Lausanne I F3': [1],
  'VBC Lausanne': [2, 4],
  'Lausanne M17F': [],
};

export const MAX_ASSIGNMENTS = 10;
