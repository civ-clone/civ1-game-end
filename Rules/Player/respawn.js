"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.lastRespawnTurn = void 0;
const addPlayer_1 = require("@civ-clone/civ1-player/lib/addPlayer");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Defeated_1 = require("@civ-clone/core-player/Rules/Defeated");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Low_1 = require("@civ-clone/core-rule/Priorities/Low");
const Spawn_1 = require("@civ-clone/core-player/Rules/Spawn");
const isHuman_1 = require("@civ-clone/civ1-difficulty/isHuman");
const level_1 = require("@civ-clone/civ1-difficulty/level");
const respawnSite_1 = require("../../lib/respawnSite");
// The last turn, in v474.05's count (0 at 4000 BC), on which a destroyed civilization comes back: 350 on Chieftain,
//  50 fewer for each level up, to 150 on Emperor (`StartGameMenu.cs` L589; Rome on 640K a Day pp250-251).
const lastRespawnTurn = (level) => 350 - 50 * level;
exports.lastRespawnTurn = lastRespawnTurn;
const getRules = (game) => [
    // A computer civilization destroyed early comes back, as a new civilization with a Settlers somewhere empty, so the
    //  world can't be conquered for good before `lastRespawnTurn` (civ-clone/web-renderer#178). `Low`, after the player
    //  has left the game. v474.05 brings each slot back once, as the other civilization of its colour; colours aren't
    //  modelled here, so a civilization comes back while there are civilizations left to come back as.
    new Defeated_1.default('civ1-game-end:player/defeated/respawn', new Low_1.default(), new Criterion_1.default((player) => !(0, isHuman_1.default)(player, game.clients)), new Criterion_1.default(() => game.turn.value() - 1 <= (0, exports.lastRespawnTurn)((0, level_1.levelOf)(game.difficulty))), new Criterion_1.default(() => game.civilizations.length > 0), new Effect_1.default((defeated) => {
        const landMasses = game.landMasses.entries(), site = (0, respawnSite_1.default)({
            ad: game.year.value() > 0,
            cities: game.cities.entries(),
            goodyHuts: game.goodyHuts,
            landMasses,
            randomNumberGenerator: game.rng,
            turn: game.turn.value() - 1,
            units: game.units.entries(),
        });
        if (site === null) {
            return;
        }
        const player = (0, addPlayer_1.default)(game, site.map()), research = game.playerResearch.getByPlayer(player), humans = game.players
            .entries()
            .filter((other) => (0, isHuman_1.default)(other, game.clients)), others = game.players
            .entries()
            .filter((other) => other !== player && !humans.includes(other));
        // It knows each advance the human does that another civilization also knows, half the time. v474.05 gives it
        //  those the human knows and didn't discover first; who discovered an advance first isn't recorded here.
        humans
            .flatMap((human) => game.playerResearch.getByPlayer(human).complete())
            .map((advance) => advance.sourceClass())
            .filter((AdvanceType, index, all) => all.indexOf(AdvanceType) === index &&
            others.some((other) => game.playerResearch.getByPlayer(other).completed(AdvanceType)))
            .forEach((AdvanceType) => {
            if (game.rng() < 0.5) {
                research.addAdvance(AdvanceType);
            }
        });
        game.rules.process(Spawn_1.default, player, site);
        game.engine.emit('player:respawned', player, defeated);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=respawn.js.map