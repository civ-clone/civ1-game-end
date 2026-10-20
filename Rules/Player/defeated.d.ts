import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { GameResultRegistry } from '@civ-clone/core-turn-based-game/GameResultRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import Defeated from '@civ-clone/core-player/Rules/Defeated';
export declare const getRules: (
  clientRegistry?: ClientRegistry,
  gameResultRegistry?: GameResultRegistry,
  ruleRegistry?: RuleRegistry,
  turn?: Turn
) => Defeated[];
export default getRules;
