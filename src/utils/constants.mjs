// Name of match headers in VB manager excel file
export const TEAM_HOME = 'Equipe recevante';
export const TEAM_AWAY = 'Equipe visiteuse';
export const DATE = 'Date/heure de début du match';
export const DAY = 'Jour';
export const MATCH_ID = '# Match';
export const LOCATION = 'Salle';
export const LEAGUE = 'CL';
export const GENDER = 'H/F';

// Name of additional match headers in scored matches excel file
export const SCORER_ID = 'UID';
export const SCORER_1 = 'Marqueur 1';
export const SCORER_2 = 'Marqueur 2';
export const SCORER_PHONE_1 = 'Téléphone 1';
export const SCORER_PHONE_2 = 'Téléphone 2';

// Columns exported as the public assignment sheet
export const PUBLIC_MATCH_FIELDS = [
  MATCH_ID,
  DATE,
  TEAM_HOME,
  TEAM_AWAY,
  LOCATION,
  SCORER_1,
  SCORER_PHONE_1,
  SCORER_2,
  SCORER_PHONE_2,
  SCORER_ID,
];

// Name of headers in players csv file
export const CLUBDESK_UID = '[Id]';
export const CLUBDESK_BIRTH_YEAR = 'Année de naissance';
export const CLUBDESK_FIRST_NAME = 'Prénom';
export const CLUBDESK_LAST_NAME = 'Nom';
export const CLUBDESK_LEAGUE = 'Groupe';
export const CLUBDESK_SCORER_ROLE = 'Marqueur';
export const CLUBDESK_PHONE = 'Téléphone privé';
export const CLUBDESK_EMAIL = 'E-mail';

// All fields
export const CLUBDESK_FIELDS = [
  CLUBDESK_UID,
  CLUBDESK_BIRTH_YEAR,
  CLUBDESK_FIRST_NAME,
  CLUBDESK_LAST_NAME,
  CLUBDESK_LEAGUE,
  CLUBDESK_SCORER_ROLE,
  CLUBDESK_PHONE,
  CLUBDESK_EMAIL,
];

export const minScorerAge = 16;

// Enquirer tasks
export const TASK_ASSIGN = 'Assign sheet';
export const TASK_CHECK = 'Check sheet';
export const TASK_UNASSIGNED = 'Show unassigned players';
export const TASK_FIND_SCORER = 'Find a scorer for a match';
