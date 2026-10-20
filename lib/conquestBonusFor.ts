import { GameResultRegistry } from '@civ-clone/core-turn-based-game/GameResultRegistry';
import Player from '@civ-clone/core-player/Player';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { conquestBonus } from './scoring';

/**
 * The conquest bonus `player` scores, or `null` unless they conquered the world. The opponents are every other player
 * the game started with: each has a `PlayerWorld` from the start, kept when they are destroyed. v474.05 counts turns from
 * 0 at 4000 BC where ours start at 1, so its turn is one less.
 */
export const conquestBonusFor = (
  player: Player,
  gameResultRegistry: GameResultRegistry,
  playerWorldRegistry: PlayerWorldRegistry
): number | null => {
  const gameResult = gameResultRegistry.get();

  if (
    gameResult === null ||
    gameResult.reason() !== 'conquest' ||
    gameResult.winner() !== player
  ) {
    return null;
  }

  return conquestBonus(gameResult.turn() - 1, playerWorldRegistry.length - 1);
};

export default conquestBonusFor;
