import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import GameOver from '@civ-clone/core-turn-based-game/Rules/GameOver';
export declare const getRules: (
  clientRegistry?: ClientRegistry,
  engine?: Engine
) => GameOver[];
export default getRules;
