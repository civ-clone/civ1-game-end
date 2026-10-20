import { GameResultRegistry } from '@civ-clone/core-turn-based-game/GameResultRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import Landed from '@civ-clone/core-spaceship/Rules/Landed';
export declare const getRules: (
  gameResultRegistry?: GameResultRegistry,
  ruleRegistry?: RuleRegistry,
  turn?: Turn
) => Landed[];
export default getRules;
