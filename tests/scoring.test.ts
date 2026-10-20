import {
  FAMOUS_LEADERS,
  conquestBonus,
  endYear,
  famousLeader,
  rating,
} from '../lib/scoring';
import { expect } from 'chai';

describe('scoring', (): void => {
  it('ends the game in 2100 on Chieftain, 20 years sooner a level, to 2020 on Emperor', (): void => {
    expect([0, 1, 2, 3, 4].map(endYear)).to.deep.equal([
      2100, 2080, 2060, 2040, 2020,
    ]);
  });

  it('scores 1,000 for conquering the world on turn 550 against six opponents', (): void => {
    expect(conquestBonus(550, 6)).to.equal(1000);
    expect(conquestBonus(300, 6)).to.equal(1500);
    expect(conquestBonus(550, 3)).to.equal(700);
  });

  it('scales the rating by the level, Emperor counting five times Chieftain', (): void => {
    expect(rating(1000, 0)).to.equal(20);
    expect(rating(1000, 4)).to.equal(100);
    expect(rating(49, 0)).to.equal(0);
  });

  it("compares a rating with v474.05's famous leaders", (): void => {
    const leader = (value: number): string | null => {
      const index = famousLeader(value);

      return index === null ? null : FAMOUS_LEADERS[index];
    };

    expect(FAMOUS_LEADERS.length).to.equal(20);
    expect(leader(0)).to.equal(null);
    expect(leader(1)).to.equal('DanQuayle');
    expect(leader(2)).to.equal('Nero');
    // ⌊k² / 3⌋ below the rating: 3 for k = 3, so Ferdinand Marcos needs 4, where the book prints 3.
    expect(leader(3)).to.equal('Nero');
    expect(leader(4)).to.equal('FerdinandMarcos');
    expect(leader(48)).to.equal('CharlesDeGaulle');
    expect(leader(49)).to.equal('Cleopatra');
    expect(leader(133)).to.equal('EmperorAugustus');
    expect(leader(134)).to.equal('SolomonTheWise');
    expect(leader(10000)).to.equal('SolomonTheWise');
  });
});
