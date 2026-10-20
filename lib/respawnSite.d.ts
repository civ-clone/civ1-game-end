import City from '@civ-clone/core-city/City';
import { GoodyHutRegistry } from '@civ-clone/core-goody-hut/GoodyHutRegistry';
import LandMass from '@civ-clone/core-world/LandMass';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
export type RespawnSiteOptions = {
  cities: City[];
  goodyHuts: GoodyHutRegistry;
  landMasses: LandMass[];
  ad: boolean;
  randomNumberGenerator: () => number;
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
export declare const respawnSite: ({
  ad,
  cities,
  goodyHuts,
  landMasses,
  randomNumberGenerator,
  turn,
  units,
}: RespawnSiteOptions) => Tile | null;
export default respawnSite;
