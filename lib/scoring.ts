// The numbers Civilization ends a game by, from v474.05 (OpenCivOne's decompile of it).

// The year the game ends in: 2100 on Chieftain (level 0), 20 years sooner for each level up, to 2020 on Emperor
//  (`GameEngine.cs` L383-415; Rome on 640K a Day, Table 2-1, p8).
export const endYear = (level: number): number => 2100 - 20 * level;

// How many years before the end the leader is warned they will retire.
export const RETIREMENT_WARNING_YEARS = 20;

// The score for conquering the world on `turn` against `opponents` computer players: 1,000 on turn 550 with six
//  opponents, 2 more for each turn sooner (`Overlay_20.cs` L1552-1562). It replaces the Civilization Score when it's
//  higher, which is how v474.05 shows it ("Bonus Score").
export const conquestBonus = (turn: number, opponents: number): number =>
  400 + 2 * (550 - turn) + 100 * opponents;

// The Civilization Rating, as a percentage: the score scaled by the level, so Emperor counts five times Chieftain
//  (`HallOfFame.cs` `F3_0000_065d`).
export const rating = (score: number, level: number): number =>
  Math.floor((score * (level + 1)) / 50);

// The famous leaders a rating is compared with, lowest first (Rome on 640K a Day, Table 9-3, p338).
export const FAMOUS_LEADERS = [
  'DanQuayle',
  'Nero',
  'FerdinandMarcos',
  'NevilleChamberlain',
  'LouisXVI',
  'KaiserWilhelm',
  'EricTheRed',
  'OttoVonBismarck',
  'SimonBolivar',
  'VladimirLenin',
  'CharlesDeGaulle',
  'Cleopatra',
  'WinstonChurchill',
  'SulaymanTheMagnificent',
  'FranklinRoosevelt',
  'ShogunTokugawa',
  'ThomasJefferson',
  'KingCharlemagne',
  'EmperorAugustus',
  'SolomonTheWise',
];

// Which famous leader a rating exceeds, as an index into `FAMOUS_LEADERS`, or `null` for a rating of 0, which exceeds
//  none. v474.05 takes the largest k from 1 to 20 with ⌊k² / 3⌋ below the rating, less one (`HallOfFame.cs` L587). The
//  book's table is one point lower at each step, as though the comparison were "at least".
export const famousLeader = (ratingValue: number): number | null => {
  let index: number | null = null;

  for (let k = 1; k <= FAMOUS_LEADERS.length; k++) {
    if (Math.floor((k * k) / 3) < ratingValue) {
      index = k - 1;
    }
  }

  return index;
};
