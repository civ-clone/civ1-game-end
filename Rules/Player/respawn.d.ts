import { AddPlayerGame } from '@civ-clone/civ1-player/lib/addPlayer';
import Defeated from '@civ-clone/core-player/Rules/Defeated';
import { Game } from '@civ-clone/core-game';
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
export declare const lastRespawnTurn: (level: number) => number;
export declare const getRules: (game: RespawnGame) => Defeated[];
export default getRules;
