import { GameResultRegistry } from '@civ-clone/core-turn-based-game/GameResultRegistry';
import Player from '@civ-clone/core-player/Player';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import { conquestBonus } from './scoring';

/**
 * The conquest bonus `player` scores, or `null` unless they conquered the world. The opponents are every other player
 * the game started with: each has a `PlayerWorld` from the start, kept when they are destroyed. The barbarians have one
 * too and are no opponent (civ-clone/web-renderer#169). v474.05 counts turns from
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

  const civilizations = playerWorldRegistry
    .entries()
    .filter(
      (playerWorld: PlayerWorld): boolean => !isBarbarian(playerWorld.player())
    ).length;

  return conquestBonus(gameResult.turn() - 1, civilizations - 1);
};

export default conquestBonusFor;
