"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const GameResultRegistry_1 = require("@civ-clone/core-turn-based-game/GameResultRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Defeated_1 = require("@civ-clone/core-player/Rules/Defeated");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const endGame_1 = require("@civ-clone/core-turn-based-game/lib/endGame");
const isHuman_1 = require("@civ-clone/civ1-difficulty/isHuman");
const getRules = (clientRegistry = ClientRegistry_1.instance, gameResultRegistry = GameResultRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, turn = Turn_1.instance) => [
    // The human's civilization destroyed ends the game for them, with no score (`GameEngine.cs` L111-120).
    new Defeated_1.default('civ1-game-end:player/defeated/destroyed', new Criterion_1.default((player) => (0, isHuman_1.default)(player, clientRegistry)), new Effect_1.default(() => {
        (0, endGame_1.default)('destroyed', null, gameResultRegistry, ruleRegistry, turn);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=defeated.js.map