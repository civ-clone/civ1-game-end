import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  GameResultRegistry,
  instance as gameResultRegistryInstance,
} from '@civ-clone/core-turn-based-game/GameResultRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import Criterion from '@civ-clone/core-rule/Criterion';
import Defeated from '@civ-clone/core-player/Rules/Defeated';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import endGame from '@civ-clone/core-turn-based-game/lib/endGame';
import isHuman from '@civ-clone/civ1-difficulty/isHuman';

export const getRules = (
  clientRegistry: ClientRegistry = clientRegistryInstance,
  gameResultRegistry: GameResultRegistry = gameResultRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  turn: Turn = turnInstance
): Defeated[] => [
  // The human's civilization destroyed ends the game for them, with no score (`GameEngine.cs` L111-120).
  new Defeated(
    'civ1-game-end:player/defeated/destroyed',
    new Criterion((player: Player): boolean => isHuman(player, clientRegistry)),
    new Effect((): void => {
      endGame('destroyed', null, gameResultRegistry, ruleRegistry, turn);
    })
  ),
];

export default getRules;
