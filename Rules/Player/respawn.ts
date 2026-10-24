import addPlayer, { AddPlayerGame } from '@civ-clone/civ1-player/lib/addPlayer';
import Advance from '@civ-clone/core-science/Advance';
import Criterion from '@civ-clone/core-rule/Criterion';
import Defeated from '@civ-clone/core-player/Rules/Defeated';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import Low from '@civ-clone/core-rule/Priorities/Low';
import Player from '@civ-clone/core-player/Player';
import Spawn from '@civ-clone/core-player/Rules/Spawn';
import isHuman from '@civ-clone/civ1-difficulty/isHuman';
import { levelOf } from '@civ-clone/civ1-difficulty/level';
import inheritedAdvances from '../../lib/inheritedAdvances';
import respawnSite from '../../lib/respawnSite';

export type RespawnGame = AddPlayerGame &
  Pick<
    Game,
    | 'cities'
    | 'clients'
    | 'difficulty'
    | 'goodyHuts'
    | 'landMasses'
    | 'playerResearch'
    | 'turn'
    | 'units'
    | 'year'
  >;

// The last turn, in v474.05's count (0 at 4000 BC), on which a destroyed civilization comes back: 350 on Chieftain,
//  50 fewer for each level up, to 150 on Emperor (`StartGameMenu.cs` L589; Rome on 640K a Day pp250-251).
export const lastRespawnTurn = (level: number): number => 350 - 50 * level;

export const getRules = (game: RespawnGame): Defeated[] => [
  // A computer civilization destroyed early comes back, as a new civilization with a Settlers somewhere empty, so the
  //  world can't be conquered for good before `lastRespawnTurn` (civ-clone/web-renderer#178). `Low`, after the player
  //  has left the game. v474.05 brings each slot back once, as the other civilization of its colour; colours aren't
  //  modelled here, so a civilization comes back while there are civilizations left to come back as.
  new Defeated(
    'civ1-game-end:player/defeated/respawn',
    new Low(),
    new Criterion((player: Player): boolean => !isHuman(player, game.clients)),
    new Criterion(
      (): boolean =>
        game.turn.value() - 1 <= lastRespawnTurn(levelOf(game.difficulty))
    ),
    new Criterion((): boolean => game.civilizations.length > 0),
    new Effect((defeated: Player): void => {
      const landMasses = game.landMasses.entries(),
        site = respawnSite({
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

      // It starts with no advances of its own: v474.05 clears them, then gives it only those below. civ1-science's
      //  random starting advances are for the start of the game, so they're held off while it's added.
      const startingAdvances = game.rules.getById(
          'civ1-science:player/added/starting-advances'
        ),
        startingAdvancesEnabled = startingAdvances?.enabled() ?? false;

      startingAdvances?.disable();

      let player: Player;

      try {
        player = addPlayer(game, site.map());
      } finally {
        if (startingAdvancesEnabled) {
          startingAdvances!.enable();
        }
      }

      const research = game.playerResearch.getByPlayer(player),
        others = game.players
          .entries()
          .filter((other: Player): boolean => other !== player);

      // Half the advances it may inherit (`lib/inheritedAdvances`): what the human knows that another civilization
      //  also knows, or, with no human seat, what any two civilizations know (civ-clone/web-renderer#609).
      inheritedAdvances(
        others,
        (other: Player): boolean => isHuman(other, game.clients),
        (other: Player): (typeof Advance)[] =>
          game.playerResearch
            .getByPlayer(other)
            .complete()
            .map((advance: Advance) => advance.sourceClass<typeof Advance>())
      ).forEach((AdvanceType: typeof Advance): void => {
        if (game.rng() < 0.5) {
          research.addAdvance(AdvanceType);
        }
      });

      game.rules.process(Spawn, player, site);

      game.engine.emit('player:respawned', player, defeated);
    })
  ),
];

export default getRules;
