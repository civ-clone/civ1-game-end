import { Chieftain, Emperor } from '@civ-clone/civ1-difficulty/Difficulties';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import Client from '@civ-clone/core-client/Client';
import ClientRegistry from '@civ-clone/core-client/ClientRegistry';
import Defeated from '@civ-clone/core-player/Rules/Defeated';
import Difficulty from '@civ-clone/core-difficulty/Difficulty';
import Effect from '@civ-clone/core-rule/Effect';
import End from '@civ-clone/core-turn-based-game/Rules/End';
import Engine from '@civ-clone/core-engine/Engine';
import GameDifficultyRegistry from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import GameResult from '@civ-clone/core-turn-based-game/GameResult';
import GameResultRegistry from '@civ-clone/core-turn-based-game/GameResultRegistry';
import Landed from '@civ-clone/core-spaceship/Rules/Landed';
import Player from '@civ-clone/core-player/Player';
import PlayerRegistry from '@civ-clone/core-player/PlayerRegistry';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Spaceship from '@civ-clone/core-spaceship/Spaceship';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import Year from '@civ-clone/core-game-year/Year';
import YearRule from '@civ-clone/core-game-year/Rules/Year';
import conquestBonusFor from '../lib/conquestBonusFor';
import { expect } from 'chai';
import gameOver from '../Rules/GameOver/game-over';
import playerDefeated from '../Rules/Player/defeated';
import spaceshipLanded from '../Rules/Spaceship/landed';
import turnEnd from '../Rules/Turn/end';
import turnStart from '../Rules/Turn/start';

// A game of a human and two computer players, at `level`, one year a turn from 2000.
const setUp = (level: typeof Difficulty = Chieftain, human = true) => {
  const rules = new RuleRegistry(),
    engine = new Engine(),
    turn = new Turn(),
    year = new Year(turn, rules),
    clients = new ClientRegistry(),
    players = new PlayerRegistry(),
    gameResult = new GameResultRegistry(),
    difficulty = new GameDifficultyRegistry(),
    [you, rival, other] = [
      new Player(rules),
      new Player(rules),
      new Player(rules),
    ],
    over: GameResult[] = [],
    warnings: number[] = [];

  // The worlds are only counted: one for each player the game started with.
  const playerWorlds = { length: 3 } as unknown as PlayerWorldRegistry;

  difficulty.set(level);
  players.register(you, rival, other);
  clients.register(
    human ? new Client(you) : new AIClient(you),
    new AIClient(rival),
    new AIClient(other)
  );

  rules.register(
    new YearRule(new Effect((turn: number) => 2000 + turn)),
    ...gameOver(clients, engine),
    ...playerDefeated(clients, gameResult, rules, turn),
    ...spaceshipLanded(gameResult, rules, turn),
    ...turnEnd(players, playerWorlds, gameResult, difficulty, rules, year),
    ...turnStart(difficulty, gameResult, year, engine)
  );

  engine.on('game:over', (result: GameResult) => over.push(result));
  engine.on('game:retirement-warning', (year: number) => warnings.push(year));

  return {
    gameResult,
    other,
    over,
    players,
    playerWorlds,
    rival,
    rules,
    turn,
    warnings,
    you,
  };
};

describe('the final year', (): void => {
  [
    [Chieftain, 100],
    [Emperor, 20],
  ].forEach(([level, finalTurn]) =>
    it(`ends the game at the end of ${2000 + (finalTurn as number)} on ${
      (level as typeof Difficulty).name
    }`, (): void => {
      const { gameResult, over, rules, turn } = setUp(
        level as typeof Difficulty
      );

      turn.set((finalTurn as number) - 1);
      rules.process(End, turn);

      expect(over).to.deep.equal([]);

      turn.set(finalTurn as number);
      rules.process(End, turn);

      expect(over.length).to.equal(1);
      expect(over[0].reason()).to.equal('date');
      expect(over[0].winner()).to.equal(null);
      expect(over[0].turn()).to.equal(finalTurn);
      expect(gameResult.pending()).to.equal(true);
    })
  );

  it('warns of retirement once, 20 years before the end', (): void => {
    const { rules, turn, warnings } = setUp(Chieftain);

    for (let value = 70; value <= 99; value++) {
      turn.set(value);
      rules.process(Start, turn);
    }

    expect(warnings).to.deep.equal([2100]);
  });

  it('ends only once, and not at all after the players keep playing', (): void => {
    const { gameResult, over, rules, turn } = setUp(Emperor);

    turn.set(20);
    rules.process(End, turn);
    gameResult.get()!.completeScoring();

    turn.set(21);
    rules.process(End, turn);

    expect(over.length).to.equal(1);
    expect(gameResult.pending()).to.equal(false);
  });
});

describe('conquest', (): void => {
  it('ends the game once one civilization is left, which wins it', (): void => {
    const { other, over, players, rival, rules, turn, you } = setUp();

    turn.set(50);
    players.unregister(rival);
    rules.process(End, turn);

    expect(over).to.deep.equal([]);

    players.unregister(other);
    rules.process(End, turn);

    expect(over.length).to.equal(1);
    expect(over[0].reason()).to.equal('conquest');
    expect(over[0].winner()).to.equal(you);
  });

  it('scores the conqueror its bonus, against every opponent the game started with', (): void => {
    const {
      gameResult,
      other,
      players,
      playerWorlds,
      rival,
      rules,
      turn,
      you,
    } = setUp();

    expect(conquestBonusFor(you, gameResult, playerWorlds)).to.equal(null);

    turn.set(50);
    players.unregister(rival, other);
    rules.process(End, turn);

    expect(conquestBonusFor(you, gameResult, playerWorlds)).to.equal(
      400 + 2 * 500 + 200
    );
    expect(conquestBonusFor(rival, gameResult, playerWorlds)).to.equal(null);
  });
});

describe('your civilization destroyed', (): void => {
  it('ends the game when the human is defeated, and not when a computer player is', (): void => {
    const { over, rival, rules, you } = setUp();

    rules.process(Defeated, rival, you);

    expect(over).to.deep.equal([]);

    rules.process(Defeated, you, rival);

    expect(over.length).to.equal(1);
    expect(over[0].reason()).to.equal('destroyed');
    expect(over[0].winner()).to.equal(null);
  });
});

describe('a spaceship landing', (): void => {
  it('ends the game, won by the first to land', (): void => {
    const { over, rival, rules, you } = setUp(),
      first = { player: () => rival } as unknown as Spaceship,
      second = { player: () => you } as unknown as Spaceship;

    rules.process(Landed, first);
    rules.process(Landed, second);

    expect(over.length).to.equal(1);
    expect(over[0].reason()).to.equal('spaceship');
    expect(over[0].winner()).to.equal(rival);
  });
});

describe('a game nobody is playing', (): void => {
  it('carries on after it ends, with its scoring complete', (): void => {
    const { gameResult, over, rules, turn } = setUp(Chieftain, false);

    turn.set(100);
    rules.process(End, turn);

    expect(over.length).to.equal(1);
    expect(gameResult.pending()).to.equal(false);
  });
});
