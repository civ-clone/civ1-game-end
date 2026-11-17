import Added from '@civ-clone/core-player/Rules/Added';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import Civilization from '@civ-clone/core-civilization/Civilization';
import Defeated from '@civ-clone/core-player/Rules/Defeated';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import Leader from '@civ-clone/core-civilization/Leader';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Spawn from '@civ-clone/core-player/Rules/Spawn';
import Tile from '@civ-clone/core-world/Tile';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import Year from '@civ-clone/core-game-year/Year';
import YearRule from '@civ-clone/core-game-year/Rules/Year';
import addPlayer from '@civ-clone/civ1-player/lib/addPlayer';
import { expect } from 'chai';
import {
  generateGenerator,
  generateWorld,
} from '@civ-clone/core-world/tests/lib/buildWorld';
import respawnRules from '../Rules/Player/respawn';

class Ones extends Civilization {}
class One extends Leader {
  static civilization(): typeof Civilization {
    return Ones;
  }
}
class Twos extends Civilization {}
class Two extends Leader {
  static civilization(): typeof Civilization {
    return Twos;
  }
}
class Threes extends Civilization {}
class Three extends Leader {
  static civilization(): typeof Civilization {
    return Threes;
  }
}
class Pottery extends Advance {}
class Writing extends Advance {}

// The registered rule end to end: two computer players who both know two advances, and a third destroyed. The random
//  numbers are a queue, each draw logged, so the order of draws shows: the site, the civilization, then one for each
//  advance it may inherit.
const setUp = async (draws: number[]) => {
  const rules = new RuleRegistry(),
    turn = new Turn(),
    year = new Year(turn, rules),
    log: string[] = [],
    rng = (): number => {
      log.push('draw');

      return draws.shift() ?? 0.5;
    },
    game = new Game({
      rules,
      turn,
      year,
      rng: rng as unknown as Game['rng'],
    }),
    advances = new AdvanceRegistry(),
    world = await generateWorld(
      generateGenerator(50, 50, Grassland),
      rules,
      game.landMasses
    );

  advances.register(Pottery, Writing);
  game.civilizations.register(Ones, Twos, Threes);
  game.leaders.register(One, Two, Three);
  rules.register(
    new YearRule(new Effect((turn: number): number => -4000 + turn * 20)),
    new Added(
      new Effect((player: Player): void =>
        game.playerResearch.register(
          new PlayerResearch(player, advances, rules)
        )
      )
    ),
    new Added(new Effect((): number => log.push('added'))),
    new Added(
      'civ1-science:player/added/starting-advances',
      new Effect((): number => log.push('starting advances'))
    ),
    new Spawn(
      new Effect((player: Player, tile: Tile): number =>
        log.push(`spawn ${tile.isLand()}`)
      )
    ),
    ...respawnRules(game)
  );
  game.engine.on('player:respawned', (): number => log.push('respawned'));

  [Ones, Twos].forEach((civilization) => {
    const player = addPlayer(game, world, { civilization });

    [Pottery, Writing].forEach((AdvanceType) =>
      game.playerResearch.getByPlayer(player).addAdvance(AdvanceType)
    );
  });

  // The destroyed player, made before the log starts (a new player's `Added` rules run as it is made).
  const defeated = new Player(game.rules);

  log.length = 0;

  return { defeated, game, log };
};

describe('civ1-game-end:player/defeated/respawn', (): void => {
  it('brings a computer civilization back, drawing for the site, the civilization, then each advance', async (): Promise<void> => {
    const { defeated, game, log } = await setUp([0.3, 0.3, 0.3, 0.7]);

    game.rules.process(Defeated, defeated);

    expect(log).eql([
      'draw',
      'draw',
      'added',
      'draw',
      'draw',
      'spawn true',
      'respawned',
    ]);

    const [, , player] = game.players.entries();

    expect(player.civilization()).instanceOf(Threes);
    expect(
      game.playerResearch
        .getByPlayer(player)
        .complete()
        .map((advance) => advance.sourceClass())
    ).eql([Pottery]);
  });

  it('brings nothing back after the last turn', async (): Promise<void> => {
    const { defeated, game, log } = await setUp([]);

    game.turn.set(1000);
    game.rules.process(Defeated, defeated);

    expect(log).eql([]);
    expect(game.players.length).equal(2);
  });
});
