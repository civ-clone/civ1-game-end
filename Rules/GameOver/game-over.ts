import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import Client from '@civ-clone/core-client/Client';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import GameOver from '@civ-clone/core-turn-based-game/Rules/GameOver';
import GameResult from '@civ-clone/core-turn-based-game/GameResult';

export const getRules = (
  clientRegistry: ClientRegistry = clientRegistryInstance,
  engine: Engine = engineInstance
): GameOver[] => [
  // With nobody playing (the arena, a headless run) there is no one to choose to keep playing, so the game carries on
  //  with its score final, rather than waiting for ever.
  new GameOver(
    'civ1-game-end:game-over/carry-on-unattended',
    new Criterion((): boolean =>
      clientRegistry
        .entries()
        .every((client: Client): boolean => client instanceof AIClient)
    ),
    new Effect((gameResult: GameResult): void => gameResult.completeScoring())
  ),

  new GameOver(
    'civ1-game-end:game-over/emit',
    new Effect((gameResult: GameResult): void => {
      engine.emit('game:over', gameResult);
    })
  ),
];

export default getRules;
