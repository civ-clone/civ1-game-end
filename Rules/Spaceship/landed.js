"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const GameResultRegistry_1 = require("@civ-clone/core-turn-based-game/GameResultRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Landed_1 = require("@civ-clone/core-spaceship/Rules/Landed");
const endGame_1 = require("@civ-clone/core-turn-based-game/lib/endGame");
const getRules = (gameResultRegistry = GameResultRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, turn = Turn_1.instance) => [
    // The first ship to reach Alpha Centauri wins the game for its civilization.
    new Landed_1.default('civ1-game-end:spaceship/landed/game-over', new Effect_1.default((spaceship) => {
        (0, endGame_1.default)('spaceship', spaceship.player(), gameResultRegistry, ruleRegistry, turn);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=landed.js.map