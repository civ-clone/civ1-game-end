import { Grassland, Plains, River } from '@civ-clone/civ1-world/Terrains';
import City from '@civ-clone/core-city/City';
import { GoodyHutRegistry } from '@civ-clone/core-goody-hut/GoodyHutRegistry';
import LandMass from '@civ-clone/core-world/LandMass';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import civ1Distance from '@civ-clone/civ1-world/lib/civ1Distance';

const isStartTerrain = (tile: Tile): boolean =>
  [Grassland, Plains, River].some(
    (TerrainType) => tile.terrain() instanceof TerrainType
  );

export type RespawnSiteOptions = {
  cities: City[];
  goodyHuts: GoodyHutRegistry;
  landMasses: LandMass[];
  // The year has passed AD 1, when a civilization only comes back on a continent nobody has settled.
  ad: boolean;
  randomNumberGenerator: () => number;
  // v474.05's turn: 0 at 4000 BC.
  turn: number;
  units: Unit[];
};

/**
 * Where a destroyed civilization comes back, as v474.05 looks for it (`StartGameMenu.cs` `F5_0000_07c7`): an empty
 * square of land with no hut, at least 10 from the nearest city, good to build on, on a continent with room for 32
 * more cities (one fewer each 32 turns), after AD 1 a continent nobody has a city on, and away from the poles. Its
 * 2,000 random tries relax the distance by 1 every 64 and the ground every 32, while the room asked for grows by 1
 * every 64 (`+ tryCount / 64`, as the decompile has it), so late tries only take big continents. Here each step is
 * tried in turn, choosing at random among the squares that pass, and `null` means there is nowhere, as 2,000 failed
 * tries do.
 */
export const respawnSite = ({
  ad,
  cities,
  goodyHuts,
  landMasses,
  randomNumberGenerator,
  turn,
  units,
}: RespawnSiteOptions): Tile | null => {
  const cityTiles = cities.map((city: City) => city.tile()),
    // v474.05 tries x 8-71 and y 8-41 of its 80 × 50 map: never within 8 rows of either pole. Scaled to this map, as
    //  the poles are the only edges it has.
    polar = (tile: Tile): boolean => {
      const height = tile.map().height(),
        margin = Math.floor((height * 8) / 50);

      return tile.y() < margin || tile.y() >= height - margin;
    },
    occupied = new Set<Tile>([
      ...cityTiles,
      ...units.map((unit: Unit) => unit.tile()),
    ]),
    settled = new Set<LandMass>(
      landMasses.filter((landMass: LandMass) =>
        landMass.tiles().some((tile: Tile) => cityTiles.includes(tile))
      )
    ),
    room = new Map<LandMass, number>(
      landMasses.map((landMass: LandMass) => [
        landMass,
        landMass.tiles().filter(isStartTerrain).length,
      ])
    ),
    nearestCity = new Map<Tile, number>();

  const distanceToCity = (tile: Tile): number => {
    if (!nearestCity.has(tile)) {
      nearestCity.set(
        tile,
        cityTiles.reduce(
          (nearest: number, cityTile: Tile): number =>
            Math.min(nearest, civ1Distance(tile, cityTile)),
          Infinity
        )
      );
    }

    return nearestCity.get(tile)!;
  };

  // 2,000 tries: the distance relaxes 31 times. The ground relaxes from good to any by try 384: v474.05 rejects a square
  //  scoring below `12 − tries / 32`, and only Grassland, Plains and River score at all (8 to 15).
  for (let tries = 0; tries <= 2000; tries += 64) {
    const minimumDistance = 10 - Math.floor(tries / 64),
      minimumRoom = 32 - Math.floor(turn / 32) + Math.floor(tries / 64),
      startTerrainOnly = tries < 384,
      candidates = landMasses
        .filter(
          (landMass: LandMass): boolean =>
            (room.get(landMass) ?? 0) >= minimumRoom &&
            !(ad && settled.has(landMass))
        )
        .flatMap((landMass: LandMass): Tile[] => landMass.tiles())
        .filter(
          (tile: Tile): boolean =>
            tile.isLand() &&
            !polar(tile) &&
            !occupied.has(tile) &&
            goodyHuts.getByTile(tile) === null &&
            (!startTerrainOnly || isStartTerrain(tile)) &&
            distanceToCity(tile) >= minimumDistance
        );

    if (candidates.length > 0) {
      return candidates[
        Math.floor(randomNumberGenerator() * candidates.length)
      ];
    }
  }

  return null;
};

export default respawnSite;
