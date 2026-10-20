# civ1-game-end

How a game of Civilization ends, as `core-turn-based-game` rules, following v474.05 (OpenCivOne's decompile of it).

## Endings

Each is a named rule, so a ruleset can disable or replace it. The first to apply ends the game (`endGame`), and none
applies again once it has.

- `civ1-game-end:turn/end/conquest`: one civilization is left of a game that started with others. It wins.
- `civ1-game-end:turn/end/date`: the final year has come, `2100 − 20 × level` (2100 on Chieftain, 2020 on Emperor).
- `civ1-game-end:spaceship/landed/game-over`: the first spaceship to land wins.
- `civ1-game-end:player/defeated/destroyed`: the human's civilization is destroyed.

A host ends the game for `retired` itself, when the player chooses to retire.

`civ1-game-end:turn/start/retirement-warning` emits `game:retirement-warning` once, on the first turn within 20 years of
the end. `civ1-game-end:game-over/emit` emits `game:over` with the `GameResult`. With nobody playing (every client a
computer player's), `civ1-game-end:game-over/carry-on-unattended` completes the scoring at once, so the game carries on
rather than waiting for someone to choose to keep playing. A host with a client of its own that isn't an `AIClient`
counts as someone playing.

The turn loop waits for the players only at the end of a turn. An ending part-way through one (a spaceship landing, the
human destroyed) lets the other players finish that turn first. After the human is destroyed nobody can keep playing,
so the game waits for good.

## Scoring

`lib/scoring.ts` has the numbers: the end year, the conquest bonus (`400 + 2 × (550 − turn) + 100 × opponents`, which
replaces the Civilization Score when it's higher), the rating (`⌊score × (level + 1) / 50⌋`%) and the famous leader a
rating exceeds. `conquestBonusFor(player, …)` gives the bonus a player has scored, if they conquered the world.
