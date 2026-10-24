import { Grassland, Ocean, Tundra } from '@civ-clone/civ1-world/Terrains';
import City from '@civ-clone/core-city/City';
import GoodyHutRegistry from '@civ-clone/core-goody-hut/GoodyHutRegistry';
import LandMass from '@civ-clone/core-world/LandMass';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import { expect } from 'chai';
import { lastRespawnTurn } from '../Rules/Player/respawn';
import inheritedAdvances from '../lib/inheritedAdvances';
import respawnSite from '../lib/respawnSite';

// Just enough of a world for `respawnSite`: a 40 × 40 map, each tile of its own terrain, and landmasses as lists.
const map = { width: () => 40, height: () => 40 },
  tile = (x: number, y: number, TerrainType: typeof Terrain = Grassland) => {
    const terrain = new (TerrainType as unknown as new () => Terrain)();

    return {
      isLand: () => !(terrain instanceof Ocean),
      map: () => map,
      terrain: () => terrain,
      x: () => x,
      y: () => y,
    } as unknown as Tile;
  },
  landMass = (tiles: Tile[]) => ({ tiles: () => tiles } as unknown as LandMass),
  cityOn = (tile: Tile) => ({ tile: () => tile } as unknown as City),
  unitOn = (tile: Tile) => ({ tile: () => tile } as unknown as Unit),
  row = (y: number, from: number, to: number, TerrainType?: typeof Terrain) =>
    new Array(to - from + 1)
      .fill(0)
      .map((_, i) => tile(from + i, y, TerrainType));

const site = (overrides: Partial<Parameters<typeof respawnSite>[0]> = {}) =>
  respawnSite({
    ad: false,
    cities: [],
    goodyHuts: new GoodyHutRegistry(),
    landMasses: [],
    randomNumberGenerator: () => 0,
    turn: 100,
    units: [],
    ...overrides,
  });

describe('respawnSite', (): void => {
  it('comes back on empty land at least 10 from any city, when there is room', (): void => {
    // A long strip of 40 Grassland: room for the 32 − 100/32 = 29 that turn 100 asks for.
    const strip = row(10, 0, 39),
      capital = cityOn(strip[0]);

    const chosen = site({
      cities: [capital],
      landMasses: [landMass(strip)],
      units: [unitOn(strip[10])],
    })!;

    expect(chosen.x()).to.equal(11);
  });

  it('leaves out start-squares with a hut on them', (): void => {
    const strip = row(10, 0, 39),
      goodyHuts = {
        getByTile: (tile: Tile) => (tile === strip[0] ? {} : null),
      } as unknown as GoodyHutRegistry;

    expect(site({ goodyHuts, landMasses: [landMass(strip)] })!.x()).to.equal(1);
  });

  it('only comes back on a continent nobody has settled after AD 1', (): void => {
    const settled = row(10, 0, 39),
      empty = row(20, 0, 39);

    const chosen = site({
      ad: true,
      cities: [cityOn(settled[39])],
      landMasses: [landMass(settled), landMass(empty)],
    })!;

    expect(chosen.y()).to.equal(20);
  });

  it('settles for less room and ground as the tries run out, and has nowhere when it never finds any', (): void => {
    // Too small for the room asked of any continent: nowhere at all.
    expect(site({ landMasses: [landMass(row(10, 0, 5))] })).to.equal(null);
    // Room, but every start square taken: it takes Tundra once it stops asking for start terrain.
    // 80 Grassland: room enough for the 35 asked once it stops asking for start terrain, at try 384.
    const grassland = [...row(10, 0, 39), ...row(11, 0, 39)],
      tundra = row(12, 0, 4, Tundra);

    expect(
      site({
        landMasses: [landMass([...grassland, ...tundra])],
        units: grassland.map(unitOn),
      })!.terrain()
    ).to.be.instanceOf(Tundra);
    expect(site({ landMasses: [landMass(row(10, 0, 39, Ocean))] })).to.equal(
      null
    );
  });
});

describe('respawnSite near the poles', (): void => {
  it('never comes back within 8 rows of a pole on a 50-row map', (): void => {
    const poles = { width: () => 40, height: () => 50 },
      polarRow = (y: number): Tile[] =>
        row(y, 0, 39).map(
          (tile: Tile) => ({ ...tile, map: () => poles } as unknown as Tile)
        );

    expect(
      site({ landMasses: [landMass([...polarRow(0), ...polarRow(49)])] })
    ).to.equal(null);
    expect(
      site({ landMasses: [landMass([...polarRow(7), ...polarRow(8)])] })!.y()
    ).to.equal(8);
  });
});

describe('lastRespawnTurn', (): void => {
  it('is 350 on Chieftain, 50 fewer a level, to 150 on Emperor', (): void => {
    expect([0, 1, 2, 3, 4].map(lastRespawnTurn)).to.deep.equal([
      350, 300, 250, 200, 150,
    ]);
  });
});

describe('inheritedAdvances', (): void => {
  // Players as strings, advances as strings: what each knows is all the rule reads.
  const knows: { [player: string]: string[] } = {
      Dom: ['Alphabet', 'Bronze Working', 'Masonry'],
      Rome: ['Alphabet', 'Ceremonial Burial', 'Masonry'],
      Zulu: ['Ceremonial Burial', 'Pottery'],
      Greece: [],
    },
    completed = (player: string): string[] => knows[player],
    human = (player: string): boolean => player === 'Dom';

  it('with a person playing, is what they know that another civilization also knows', (): void => {
    expect(
      inheritedAdvances(['Dom', 'Rome', 'Zulu', 'Greece'], human, completed)
    ).to.deep.equal(['Alphabet', 'Masonry']);
  });

  it('with no human seat, is what any two civilizations know (civ-clone/web-renderer#609)', (): void => {
    expect(
      inheritedAdvances(['Rome', 'Zulu', 'Greece'], () => false, completed)
    ).to.deep.equal(['Ceremonial Burial']);
  });

  it('is nothing when nobody shares an advance, or there is nobody', (): void => {
    expect(
      inheritedAdvances(['Zulu', 'Greece'], () => false, completed)
    ).to.deep.equal([]);
    expect(inheritedAdvances([], () => false, completed)).to.deep.equal([]);
  });

  it('with a person, two computer civilizations sharing an advance the person lacks is not enough', (): void => {
    expect(
      inheritedAdvances(['Dom', 'Rome', 'Zulu'], human, (player) =>
        player === 'Dom' ? [] : knows[player]
      )
    ).to.deep.equal([]);
  });
});
