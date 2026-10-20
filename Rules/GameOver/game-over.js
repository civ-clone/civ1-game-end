"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const AIClient_1 = require("@civ-clone/core-ai-client/AIClient");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const GameOver_1 = require("@civ-clone/core-turn-based-game/Rules/GameOver");
const getRules = (clientRegistry = ClientRegistry_1.instance, engine = Engine_1.instance) => [
    // With nobody playing (the arena, a headless run) there is no one to choose to keep playing, so the game carries on
    //  with its score final, rather than waiting for ever.
    new GameOver_1.default('civ1-game-end:game-over/carry-on-unattended', new Criterion_1.default(() => clientRegistry
        .entries()
        .every((client) => client instanceof AIClient_1.default)), new Effect_1.default((gameResult) => gameResult.completeScoring())),
    new GameOver_1.default('civ1-game-end:game-over/emit', new Effect_1.default((gameResult) => {
        engine.emit('game:over', gameResult);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=game-over.js.map