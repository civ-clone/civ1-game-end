"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conquestBonusFor = void 0;
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const scoring_1 = require("./scoring");
/**
 * The conquest bonus `player` scores, or `null` unless they conquered the world. The opponents are every other player
 * the game started with: each has a `PlayerWorld` from the start, kept when they are destroyed. The barbarians have one
 * too and are no opponent (civ-clone/web-renderer#169). v474.05 counts turns from
 * 0 at 4000 BC where ours start at 1, so its turn is one less.
 */
const conquestBonusFor = (player, gameResultRegistry, playerWorldRegistry) => {
    const gameResult = gameResultRegistry.get();
    if (gameResult === null ||
        gameResult.reason() !== 'conquest' ||
        gameResult.winner() !== player) {
        return null;
    }
    const civilizations = playerWorldRegistry
        .entries()
        .filter((playerWorld) => !(0, isBarbarian_1.default)(playerWorld.player())).length;
    return (0, scoring_1.conquestBonus)(gameResult.turn() - 1, civilizations - 1);
};
exports.conquestBonusFor = conquestBonusFor;
exports.default = exports.conquestBonusFor;
//# sourceMappingURL=conquestBonusFor.js.map