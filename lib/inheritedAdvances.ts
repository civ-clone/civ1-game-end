/**
 * The advances a civilization coming back may inherit (civ-clone/web-renderer#178, #609): each is given at 50%.
 *
 * With a person playing, v474.05's rule: what the human knows that another civilization also knows (the game gives
 * what the human knows and didn't discover first; who discovered an advance first isn't recorded here). With no
 * human seat (civ-clone/web-renderer#606) that set would be empty however late the game is, so it is instead what
 * any two civilizations know: common knowledge, as the human's rule means it to be.
 *
 * `players` are the civilizations in the game other than the one coming back; `completed` says what each knows.
 * Each advance comes back once, in the order first met.
 */
export const inheritedAdvances = <P, A>(
  players: P[],
  isHuman: (player: P) => boolean,
  completed: (player: P) => A[]
): A[] => {
  const humans = players.filter(isHuman),
    others = players.filter((player) => !humans.includes(player)),
    known = new Map<A, Set<P>>();

  players.forEach((player) =>
    completed(player).forEach((advance) => {
      if (!known.has(advance)) {
        known.set(advance, new Set());
      }

      known.get(advance)!.add(player);
    })
  );

  return [...known.entries()]
    .filter(([, knownBy]) =>
      humans.length > 0
        ? humans.some((human) => knownBy.has(human)) &&
          others.some((other) => knownBy.has(other))
        : knownBy.size >= 2
    )
    .map(([advance]) => advance);
};

export default inheritedAdvances;
