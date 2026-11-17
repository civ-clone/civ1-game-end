import respawn, { respawns } from '@civ-clone/base-game-end/lib/respawn';
import { AddPlayerGame } from '@civ-clone/civ1-player/lib/addPlayer';
import Criterion from '@civ-clone/core-rule/Criterion';
import Defeated from '@civ-clone/core-player/Rules/Defeated';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import Low from '@civ-clone/core-rule/Priorities/Low';
import Player from '@civ-clone/core-player/Player';
import byLevel from '@civ-clone/base-game-end/lib/byLevel';
import isHuman from '@civ-clone/civ1-difficulty/isHuman';
import { levelOf } from '@civ-clone/civ1-difficulty/level';
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
export const lastRespawnTurn: (level: number) => number = byLevel(350, -50);

export const getRules = (game: RespawnGame): Defeated[] => [
  // A computer civilization destroyed early comes back, as a new civilization with a Settlers somewhere empty, so the
  //  world can't be conquered for good before `lastRespawnTurn` (civ-clone/web-renderer#178). `Low`, after the player
  //  has left the game. v474.05 brings each slot back once, as the other civilization of its colour; colours aren't
  //  modelled here, so a civilization comes back while there are civilizations left to come back as.
  new Defeated(
    'civ1-game-end:player/defeated/respawn',
    new Low(),
    new Criterion((player: Player): boolean => !isHuman(player, game.clients)),
    // A `Respawns` rule may decide instead (`base-game-end`); Civilization registers none.
    new Criterion((player: Player): boolean =>
      respawns(
        player,
        game.rules,
        (): boolean =>
          game.turn.value() - 1 <= lastRespawnTurn(levelOf(game.difficulty))
      )
    ),
    new Criterion((): boolean => game.civilizations.length > 0),
    new Effect((defeated: Player): void => {
      respawn(game, defeated, {
        site: () =>
          respawnSite({
            ad: game.year.value() > 0,
            cities: game.cities.entries(),
            goodyHuts: game.goodyHuts,
            landMasses: game.landMasses.entries(),
            randomNumberGenerator: game.rng,
            turn: game.turn.value() - 1,
            units: game.units.entries(),
          }),
        // It starts with no advances of its own: v474.05 clears them, then gives it only those below. civ1-science's
        //  random starting advances are for the start of the game, so they're held off while it's added.
        heldOff: ['civ1-science:player/added/starting-advances'],
        // Half the advances it may inherit (`base-game-end`'s `inheritedAdvances`): what the human knows that another
        //  civilization also knows, or, with no human seat, what any two civilizations know
        //  (civ-clone/web-renderer#609).
        isHuman: (other: Player): boolean => isHuman(other, game.clients),
        inherits: (): boolean => game.rng() < 0.5,
      });
    })
  ),
];

export default getRules;
