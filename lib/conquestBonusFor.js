"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conquestBonusFor = void 0;
const conquest_1 = require("@civ-clone/base-game-end/lib/conquest");
const scoring_1 = require("./scoring");
/**
 * The conquest bonus `player` scores, or `null` unless they conquered the world. The opponents are every other player
 * the game started with: each has a `PlayerWorld` from the start, kept when they are destroyed. The barbarians have one
 * too and are no opponent (civ-clone/web-renderer#169). v474.05 counts turns from
 * 0 at 4000 BC where ours start at 1, so its turn is one less.
 */
const conquestBonusFor = (player, gameResultRegistry, playerWorldRegistry) => (0, conquest_1.conquestBonusFor)(player, gameResultRegistry, playerWorldRegistry, (turn, opponents) => (0, scoring_1.conquestBonus)(turn - 1, opponents));
exports.conquestBonusFor = conquestBonusFor;
exports.default = exports.conquestBonusFor;
//# sourceMappingURL=conquestBonusFor.js.map