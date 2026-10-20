"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conquestBonusFor = void 0;
const scoring_1 = require("./scoring");
/**
 * The conquest bonus `player` scores, or `null` unless they conquered the world. The opponents are every other player
 * the game started with: each has a `PlayerWorld` from the start, kept when they are destroyed. v474.05 counts turns from
 * 0 at 4000 BC where ours start at 1, so its turn is one less.
 */
const conquestBonusFor = (player, gameResultRegistry, playerWorldRegistry) => {
    const gameResult = gameResultRegistry.get();
    if (gameResult === null ||
        gameResult.reason() !== 'conquest' ||
        gameResult.winner() !== player) {
        return null;
    }
    return (0, scoring_1.conquestBonus)(gameResult.turn() - 1, playerWorldRegistry.length - 1);
};
exports.conquestBonusFor = conquestBonusFor;
exports.default = exports.conquestBonusFor;
//# sourceMappingURL=conquestBonusFor.js.map