const database = require("./mongodbInit");

// Of all cards in pool, there is a __ % of drawing that specific card.
// goal: return 10 doc
const chapterA = {
  UR: 0.25, // * 12  = 3%     = 3%
  SSR: 0.37, // * 24 = 8.88%  = 9%
  SR: 0.3, // * 98   = 29.4%  = 30%
  R: 0.59, // * 98   = 57.82% = 58%
};

const chapterM = {
  UR: 0.25, // 12
  SSR: 0.37, // 24
  SR: 0.35, // 84
  R: 0.69, // 84
};

/*

event ur   1.5    2 UR = 3 out of 3   = 100% from event
event ssr  3.0    1 SR = 3 out of 9   = 1/3
event sr   11.50  2 SR = 13 out of 30 = 13/30

ssr  0.25
sr   0.07
r    0.59

*/

const RARITIES = ["N", "R", "SR", "SSR", "UR", "UR+"];

/**
 * Returns random card from db that match criteria.
 * @param  source: str; rarity: arr
 * @return card obj
 */
async function roll(source, rarity) {
  try {
    let card = (await database.getRandomCard(source, rarity))[0];
    return {
      name: card.uniqueName,
      rarity: card.rarity,
    };
  } catch (e) {
    console.error("Error:", e);
    return {
      name: "Little_D._of_Pride_(Pride)",
      rarity: "N"
    }
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function rollRarity() {
  let r = getRandomInt(0, 100);
  if (r < 3) {
    return 4;
  } else if (r < 9 + 3) {
    return 3;
  } else if (r < 30 + 9 + 3) {
    return 2;
  } else {
    return 1;
  }
}

/**
 * Returns true if random num is an event card.
 * @param  int rarity: 4 UR; 3 SSR; 2 SR
 * @return boolean; true = isEvent; false = regular
 */
function rollCardType(rarity) {
  if (rarity >= 4) return true;
  if (rarity == 3) return getRandomInt(0, 3) == 0;
  if (rarity == 2) return getRandomInt(0, 30) < 13;
  return false;
}

exports.summonTen = async function (nightmare = "Chapter A") {
  let result = [];
  let event, rarity, isEventCard;

  for (let i = 0; i < 10; i++) {
    if (
      i === 9 &&
      !result.find((x) => ["UR+", "UR", "SSR"].includes(x.rarity))
    ) {
      // fix: always give ssr if unlucky
      rarity = 3;
    } else {
      rarity = rollRarity();
    }

    if (rarity == 4) {
      rarity = ["UR+", "UR"];
    } else {
      rarity = [RARITIES[rarity]];
    }

    isEventCard = rollCardType(rarity);

    if (isEventCard) {
      event = nightmare;
    } else {
      event = "Chapter A";
    }

    result.push(await roll(event, rarity));
  }

  return result.map((x) => x.name);
};
