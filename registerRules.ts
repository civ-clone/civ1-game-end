import { Game, defaultGame } from '@civ-clone/core-game';
import gameOver from './Rules/GameOver/game-over';
import playerDefeated from './Rules/Player/defeated';
import playerRespawn from './Rules/Player/respawn';
import spaceshipLanded from './Rules/Spaceship/landed';
import turnEnd from './Rules/Turn/end';
import turnStart from './Rules/Turn/start';

export const register = (game: Game): void =>
  game.rules.register(
    ...gameOver(game.clients, game.engine),
    ...playerDefeated(game.clients, game.gameResult, game.rules, game.turn),
    ...playerRespawn(game),
    ...spaceshipLanded(game.gameResult, game.rules, game.turn),
    ...turnEnd(
      game.players,
      game.playerWorlds,
      game.gameResult,
      game.difficulty,
      game.rules,
      game.year
    ),
    ...turnStart(game.difficulty, game.gameResult, game.year, game.engine)
  );

// The plugin loader imports each package for this side effect.
register(defaultGame);

export default register;
