"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const GameResultRegistry_1 = require("@civ-clone/core-turn-based-game/GameResultRegistry");
const PlayerRegistry_1 = require("@civ-clone/core-player/PlayerRegistry");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Year_1 = require("@civ-clone/core-game-year/Year");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const End_1 = require("@civ-clone/core-turn-based-game/Rules/End");
const endGame_1 = require("@civ-clone/core-turn-based-game/lib/endGame");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const scoring_1 = require("../../lib/scoring");
const level_1 = require("@civ-clone/civ1-difficulty/level");
// The players that are civilizations: everyone but the barbarians.
const civilizations = (players) => players.filter((player) => !(0, isBarbarian_1.default)(player));
// The endings v474.05 checks once every player has moved (`GameEngine.cs` L361-436). The first to apply ends the game,
//  and none applies again after that.
const getRules = (playerRegistry = PlayerRegistry_1.instance, playerWorldRegistry = PlayerWorldRegistry_1.instance, gameResultRegistry = GameResultRegistry_1.instance, gameDifficultyRegistry = GameDifficultyRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, year = Year_1.instance) => [
    // One civilization is left, from a game that started with others (`StartGameMenu.cs` L557-570): it conquered the
    //  world, whoever destroyed the rest. The barbarians are no civilization: they neither win nor stand in the way
    //  (civ-clone/web-renderer#169).
    new End_1.default('civ1-game-end:turn/end/conquest', new Criterion_1.default(() => civilizations(playerRegistry.entries()).length === 1 &&
        civilizations(playerWorldRegistry
            .entries()
            .map((playerWorld) => playerWorld.player())).length > 1), new Effect_1.default((turn) => {
        const [winner] = civilizations(playerRegistry.entries());
        (0, endGame_1.default)('conquest', winner, gameResultRegistry, ruleRegistry, turn);
    })),
    // The final year has come: the dynasty ends, and no one wins.
    new End_1.default('civ1-game-end:turn/end/date', new Criterion_1.default((turn) => year.value(turn.value()) >= (0, scoring_1.endYear)((0, level_1.levelOf)(gameDifficultyRegistry))), new Effect_1.default((turn) => {
        (0, endGame_1.default)('date', null, gameResultRegistry, ruleRegistry, turn);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=end.js.map