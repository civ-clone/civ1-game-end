import { Engine } from '@civ-clone/core-engine/Engine';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { GameResultRegistry } from '@civ-clone/core-turn-based-game/GameResultRegistry';
import { Year } from '@civ-clone/core-game-year/Year';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
export declare const getRules: (
  gameDifficultyRegistry?: GameDifficultyRegistry,
  gameResultRegistry?: GameResultRegistry,
  year?: Year,
  engine?: Engine
) => Start[];
export default getRules;
