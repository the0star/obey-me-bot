const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const summon = require("../summon.js");

const { createCanvas, Image } = require("@napi-rs/canvas");
const axios = require("axios");

/**

SEND AS EMBED WITH TITLE LINK TO KARASU OS.COM
ADD DISCLAIMER: These images are sourced from that website, I'm not responsible for them.

**/

module.exports = {
  data: new SlashCommandBuilder()
    .setName("summon")
    .setDescription("Summon x10"),
  async execute(interaction) {
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
    let cards = await summon.summonTen();
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

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: "summon.png",
    });

    console.log(attachment);

    const exampleEmbed = {
      title: "Title",
      url: "https://discord.js.org",
      image: {
        url: "attachment://summon.png",
      },
    };

    await interaction.reply({ embeds: [exampleEmbed], files: [attachment] });
  },
};
