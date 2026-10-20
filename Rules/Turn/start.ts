import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  GameDifficultyRegistry,
  instance as gameDifficultyRegistryInstance,
} from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import {
  GameResultRegistry,
  instance as gameResultRegistryInstance,
} from '@civ-clone/core-turn-based-game/GameResultRegistry';
import { RETIREMENT_WARNING_YEARS, endYear } from '../../lib/scoring';
import { Year, instance as yearInstance } from '@civ-clone/core-game-year/Year';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import { levelOf } from '@civ-clone/civ1-difficulty/level';

export const getRules = (
  gameDifficultyRegistry: GameDifficultyRegistry = gameDifficultyRegistryInstance,
  gameResultRegistry: GameResultRegistry = gameResultRegistryInstance,
  year: Year = yearInstance,
  engine: Engine = engineInstance
): Start[] => [
  // The leader is warned once, on the first turn within 20 years of the end. v474.05 repeats it every turn; once is
  //  enough. It's the turn the year crosses the line, so a game loaded later doesn't warn again.
  new Start(
    'civ1-game-end:turn/start/retirement-warning',
    new Criterion((): boolean => gameResultRegistry.get() === null),
    new Criterion((turn: Turn): boolean => {
      const warningYear =
        endYear(levelOf(gameDifficultyRegistry)) - RETIREMENT_WARNING_YEARS;

      return (
        turn.value() > 1 &&
        year.value(turn.value()) >= warningYear &&
        year.value(turn.value() - 1) < warningYear
      );
    }),
    new Effect((): void => {
      engine.emit(
        'game:retirement-warning',
        endYear(levelOf(gameDifficultyRegistry))
      );
    })
  ),
];

export default getRules;
