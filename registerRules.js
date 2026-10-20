"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const core_game_1 = require("@civ-clone/core-game");
const game_over_1 = require("./Rules/GameOver/game-over");
const defeated_1 = require("./Rules/Player/defeated");
const respawn_1 = require("./Rules/Player/respawn");
const landed_1 = require("./Rules/Spaceship/landed");
const end_1 = require("./Rules/Turn/end");
const start_1 = require("./Rules/Turn/start");
const register = (game) => game.rules.register(...(0, game_over_1.default)(game.clients, game.engine), ...(0, defeated_1.default)(game.clients, game.gameResult, game.rules, game.turn), ...(0, respawn_1.default)(game), ...(0, landed_1.default)(game.gameResult, game.rules, game.turn), ...(0, end_1.default)(game.players, game.playerWorlds, game.gameResult, game.difficulty, game.rules, game.year), ...(0, start_1.default)(game.difficulty, game.gameResult, game.year, game.engine));
exports.register = register;
// The plugin loader imports each package for this side effect.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map