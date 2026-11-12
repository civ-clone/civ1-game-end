import {
  GameDifficultyRegistry,
  instance as gameDifficultyRegistryInstance,
} from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import {
  GameResultRegistry,
  instance as gameResultRegistryInstance,
} from '@civ-clone/core-turn-based-game/GameResultRegistry';
import {
  PlayerRegistry,
  instance as playerRegistryInstance,
} from '@civ-clone/core-player/PlayerRegistry';
import {
  PlayerWorldRegistry,
  instance as playerWorldRegistryInstance,
} from '@civ-clone/core-player-world/PlayerWorldRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import { Year, instance as yearInstance } from '@civ-clone/core-game-year/Year';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import End from '@civ-clone/core-turn-based-game/Rules/End';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import endGame from '@civ-clone/core-turn-based-game/lib/endGame';
import { conqueror, isConquest } from '@civ-clone/base-game-end/lib/conquest';
import { endYear } from '../../lib/scoring';
import { yearReached } from '@civ-clone/base-game-end/lib/year';
import { levelOf } from '@civ-clone/civ1-difficulty/level';

// The endings v474.05 checks once every player has moved (`GameEngine.cs` L361-436). The first to apply ends the game,
//  and none applies again after that.
export const getRules = (
  playerRegistry: PlayerRegistry = playerRegistryInstance,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  gameResultRegistry: GameResultRegistry = gameResultRegistryInstance,
  gameDifficultyRegistry: GameDifficultyRegistry = gameDifficultyRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  year: Year = yearInstance
): End[] => [
  // One civilization is left, from a game that started with others (`StartGameMenu.cs` L557-570): it conquered the
  //  world, whoever destroyed the rest. The barbarians are no civilization: they neither win nor stand in the way
  //  (civ-clone/web-renderer#169).
  new End(
    'civ1-game-end:turn/end/conquest',
    new Criterion((): boolean =>
      isConquest(playerRegistry, playerWorldRegistry)
    ),
    new Effect((turn: Turn): void => {
      endGame(
        'conquest',
        conqueror(playerRegistry),
        gameResultRegistry,
        ruleRegistry,
        turn
      );
    })
  ),

  // The final year has come: the dynasty ends, and no one wins.
  new End(
    'civ1-game-end:turn/end/date',
    new Criterion((turn: Turn): boolean =>
      yearReached(year, turn.value(), endYear(levelOf(gameDifficultyRegistry)))
    ),
    new Effect((turn: Turn): void => {
      endGame('date', null, gameResultRegistry, ruleRegistry, turn);
    })
  ),
];

export default getRules;
