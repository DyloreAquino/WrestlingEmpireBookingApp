// app/lib/types.ts
// All enums mirrored from prisma/schema.prisma
// Import from here instead of @/app/lib/types in client components

export const Role = {
  WRESTLER: 'WRESTLER',
  BOOKER: 'BOOKER',
  REFEREE: 'REFEREE',
  MANAGER: 'MANAGER',
} as const
export type Role = typeof Role[keyof typeof Role]

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  NA: 'NA',
} as const
export type Gender = typeof Gender[keyof typeof Gender]

export const Alignment = {
  FACE: 'FACE',
  HEEL: 'HEEL',
  TWEENER: 'TWEENER',
} as const
export type Alignment = typeof Alignment[keyof typeof Alignment]

export const Division = {
  TOP_CARD: 'TOP_CARD',
  MID_CARD: 'MID_CARD',
  UNDER_CARD: 'UNDER_CARD',
  TAG: 'TAG',
} as const
export type Division = typeof Division[keyof typeof Division]

export const TitleGender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  ALL: 'ALL',
} as const
export type TitleGender = typeof TitleGender[keyof typeof TitleGender]

export const ShowType = {
  TV: 'TV',
  PPV: 'PPV',
} as const
export type ShowType = typeof ShowType[keyof typeof ShowType]

export const Month = {
  JAN: 'JAN',
  FEB: 'FEB',
  MAR: 'MAR',
  APR: 'APR',
  MAY: 'MAY',
  JUN: 'JUN',
  JUL: 'JUL',
  AUG: 'AUG',
  SEP: 'SEP',
  OCT: 'OCT',
  NOV: 'NOV',
  DEC: 'DEC',
} as const
export type Month = typeof Month[keyof typeof Month]

export const MatchType = {
  SINGLES: 'SINGLES',
  TAG_TEAM: 'TAG_TEAM',
  TEAM: 'TEAM',
  TRIPLE_THREAT: 'TRIPLE_THREAT',
  FATAL_FOUR_WAY: 'FATAL_FOUR_WAY',
  HANDICAP: 'HANDICAP',
  GAUNTLET: 'GAUNTLET',
  BATTLE_ROYALE: 'BATTLE_ROYALE',
  ROYAL_RUMBLE: 'ROYAL_RUMBLE',
} as const
export type MatchType = typeof MatchType[keyof typeof MatchType]

export const Stipulation = {
  HARDCORE: 'HARDCORE',
  OPEN_CHALLENGE: 'OPEN_CHALLENGE',
  CONFRONTATION: 'CONFRONTATION',
  BEST_OF_THREE: 'BEST_OF_THREE',
  IRONMAN: 'IRONMAN',
  LAST_LAUGH: 'LAST_LAUGH',
  SUBMISSION: 'SUBMISSION',
  LAST_MAN_STANDING: 'LAST_MAN_STANDING',
  STREET_FIGHT: 'STREET_FIGHT',
  FIRST_BLOOD: 'FIRST_BLOOD',
  SUMO_CONTEST: 'SUMO_CONTEST',
  SHOOT_FIGHT: 'SHOOT_FIGHT',
  TAG_ELIMINATION: 'TAG_ELIMINATION',
  WAR: 'WAR',
  ELIMINATION: 'ELIMINATION',
  ESCAPE_TO_VICTORY: 'ESCAPE_TO_VICTORY',
  FURNITURE_SMASH: 'FURNITURE_SMASH',
  LADDER: 'LADDER',
  HELL_IN_A_CELL: 'HELL_IN_A_CELL',
  TRAINING: 'TRAINING',
} as const
export type Stipulation = typeof Stipulation[keyof typeof Stipulation]

export const FinishType = {
  PINFALL: 'PINFALL',
  SUBMISSION: 'SUBMISSION',
  COUNTOUT: 'COUNTOUT',
  DQ: 'DQ',
  INTERFERENCE: 'INTERFERENCE',
  UNIQUE: 'UNIQUE',
  UNFINISHED: 'UNFINISHED',
} as const
export type FinishType = typeof FinishType[keyof typeof FinishType]

export const CardPlacement = {
  UNDERCARD: 'UNDERCARD',
  MIDCARD: 'MIDCARD',
  SEMI_MAIN: 'SEMI_MAIN',
  MAIN: 'MAIN',
} as const
export type CardPlacement = typeof CardPlacement[keyof typeof CardPlacement]