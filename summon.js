const database = require("./mongodbInit");
const { createCanvas, Image } = require("@napi-rs/canvas");
const axios = require("axios");

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
    if (!card) card = (await database.getRandomCard("Chapter A", rarity))[0];
    return {
      name: card.uniqueName,
      rarity: card.rarity,
    };
  } catch (e) {
    console.error("Error:", e);
    return {
      name: "Little_D._of_Pride_(Pride)",
      rarity: "N",
    };
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

exports.summonTen = async function (nightmare) {
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

    isEventCard = rollCardType(rarity);

    if (isEventCard) {
      event = nightmare;
    } else {
      event = "Chapter A";
    }

    if (rarity == 4) {
      rarity = ["UR+", "UR"];
    } else {
      rarity = [RARITIES[rarity]];
    }

    result.push(await roll(event, rarity));
  }
  let image = await getImage(result.map((x) => x.name));
  return { result: result, image: image };
};

exports.isNightmare = async function (name) {
  try {
    let result = await database.findNightmare(name);
    return result?.name;
  } catch (e) {
    console.error(e);
    return false;
  }
};

async function getImage(cards) {
  const canvas = createCanvas(1000, 462);
  const context = canvas.getContext("2d");

  const background = await axios.get(
    "https://cdn.glitch.global/38f0eb85-535c-45fe-b659-c7f2aaaf859b/image.png?v=1662235426528",
    { responseType: "arraybuffer" }
  );
  const backgroundImage = new Image();
  backgroundImage.src = Buffer.from(background.data, "utf-8");

  context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  let top = 129;
  let left = 219;

  for (let i = 0; i < 10; i++) {
    let body = await axios.get(
      "https://karasu-os.com/images/cards/S/" + cards[i] + ".jpg",
      { responseType: "arraybuffer" }
    );
    let avatar = new Image();
    avatar.src = Buffer.from(body.data, "utf-8");
    context.drawImage(avatar, left, top, 93, 93);

    if (i % 2 === 0) {
      top += 24 + 93;
    } else {
      top -= 24 + 93;
      left += 24 + 93;
    }
  }

  return canvas.toBuffer("image/png");
}
