"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const GameResultRegistry_1 = require("@civ-clone/core-turn-based-game/GameResultRegistry");
const scoring_1 = require("../../lib/scoring");
const Year_1 = require("@civ-clone/core-game-year/Year");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Start_1 = require("@civ-clone/core-turn-based-game/Rules/Start");
const level_1 = require("@civ-clone/civ1-difficulty/level");
const getRules = (gameDifficultyRegistry = GameDifficultyRegistry_1.instance, gameResultRegistry = GameResultRegistry_1.instance, year = Year_1.instance, engine = Engine_1.instance) => [
    // The leader is warned once, on the first turn within 20 years of the end. v474.05 repeats it every turn; once is
    //  enough. It's the turn the year crosses the line, so a game loaded on a later turn doesn't warn again (one saved
    //  between turns and loaded on the crossing turn itself can).
    new Start_1.default('civ1-game-end:turn/start/retirement-warning', new Criterion_1.default(() => gameResultRegistry.get() === null), new Criterion_1.default((turn) => {
        const warningYear = (0, scoring_1.endYear)((0, level_1.levelOf)(gameDifficultyRegistry)) - scoring_1.RETIREMENT_WARNING_YEARS;
        return (turn.value() > 1 &&
            year.value(turn.value()) >= warningYear &&
            year.value(turn.value() - 1) < warningYear);
    }), new Effect_1.default(() => {
        engine.emit('game:retirement-warning', (0, scoring_1.endYear)((0, level_1.levelOf)(gameDifficultyRegistry)));
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=start.js.map