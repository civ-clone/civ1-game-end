import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { GameResultRegistry } from '@civ-clone/core-turn-based-game/GameResultRegistry';
import { PlayerRegistry } from '@civ-clone/core-player/PlayerRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Year } from '@civ-clone/core-game-year/Year';
import End from '@civ-clone/core-turn-based-game/Rules/End';
export declare const getRules: (
  playerRegistry?: PlayerRegistry,
  playerWorldRegistry?: PlayerWorldRegistry,
  gameResultRegistry?: GameResultRegistry,
  gameDifficultyRegistry?: GameDifficultyRegistry,
  ruleRegistry?: RuleRegistry,
  year?: Year
) => End[];
export default getRules;
