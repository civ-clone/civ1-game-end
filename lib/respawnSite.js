"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respawnSite = void 0;
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const civ1Distance_1 = require("@civ-clone/civ1-world/lib/civ1Distance");
const isStartTerrain = (tile) => [Terrains_1.Grassland, Terrains_1.Plains, Terrains_1.River].some((TerrainType) => tile.terrain() instanceof TerrainType);
/**
 * Where a destroyed civilization comes back, as v474.05 looks for it (`StartGameMenu.cs` `F5_0000_07c7`): an empty
 * square of land with no hut, at least 10 from the nearest city, good to build on, on a continent with room for 32
 * more cities (one fewer each 32 turns), and, after AD 1, a continent nobody has a city on. Its 2,000 random tries
 * relax the distance by 1 every 64 and the ground every 32, while the room asked for grows by 1 every 64
 * (`+ tryCount / 64`, as the decompile has it), so late tries only take big continents. Here each step is tried in
 * turn, choosing at random among the squares that pass, and `null` means there is nowhere, as 2,000 failed tries do.
 */
const respawnSite = ({ ad, cities, goodyHuts, landMasses, randomNumberGenerator, turn, units, }) => {
    const cityTiles = cities.map((city) => city.tile()), occupied = new Set([
        ...cityTiles,
        ...units.map((unit) => unit.tile()),
    ]), settled = new Set(landMasses.filter((landMass) => landMass.tiles().some((tile) => cityTiles.includes(tile)))), room = new Map(landMasses.map((landMass) => [
        landMass,
        landMass.tiles().filter(isStartTerrain).length,
    ])), nearestCity = new Map();
    const distanceToCity = (tile) => {
        if (!nearestCity.has(tile)) {
            nearestCity.set(tile, cityTiles.reduce((nearest, cityTile) => Math.min(nearest, (0, civ1Distance_1.default)(tile, cityTile)), Infinity));
        }
        return nearestCity.get(tile);
    };
    // 2,000 tries: the distance relaxes 31 times, and the ground (from start terrain to any land) after 1,000.
    for (let tries = 0; tries <= 2000; tries += 64) {
        const minimumDistance = 10 - Math.floor(tries / 64), minimumRoom = 32 - Math.floor(turn / 32) + Math.floor(tries / 64), startTerrainOnly = tries < 1000, candidates = landMasses
            .filter((landMass) => {
            var _a;
            return ((_a = room.get(landMass)) !== null && _a !== void 0 ? _a : 0) >= minimumRoom &&
                !(ad && settled.has(landMass));
        })
            .flatMap((landMass) => landMass.tiles())
            .filter((tile) => tile.isLand() &&
            !occupied.has(tile) &&
            goodyHuts.getByTile(tile) === null &&
            (!startTerrainOnly || isStartTerrain(tile)) &&
            distanceToCity(tile) >= minimumDistance);
        if (candidates.length > 0) {
            return candidates[Math.floor(randomNumberGenerator() * candidates.length)];
        }
    }
    return null;
};
exports.respawnSite = respawnSite;
exports.default = exports.respawnSite;
//# sourceMappingURL=respawnSite.js.map