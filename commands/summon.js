const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const summon = require("../summon.js");

const { createCanvas, Image } = require("@napi-rs/canvas");
const axios = require("axios");

/**

TODO:
- add "new" or "cheat card" icon to cards

**/

module.exports = {
  data: new SlashCommandBuilder()
    .setName("summon")
    .setDescription("Summon x10 in specified nightmare.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription(
          "Nightmare name. List of available nightmares on karasu-os.com/events."
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    let name =
      interaction.options.getString("name") || "Swift Blades & Deadly Ninjutsu";
    let attachment, embed;

    await interaction.reply({
      embeds: [
        {
          title: "Loading...",
        },
      ],
    });

    // verify name
    name = await summon.isNightmare(name);
    if (!name) {
      await interaction.editReply({
        embeds: [
          {
            title: "Nightmare not found!",
          },
        ],
      });
      return;
    }

    // send result
    const canvas = createCanvas(1000, 462);
    const context = canvas.getContext("2d");

    const background = await axios.get(
      "https://cdn.glitch.global/38f0eb85-535c-45fe-b659-c7f2aaaf859b/image.png?v=1663826006976",
      { responseType: "arraybuffer" }
    );
    const backgroundImage = new Image();
    backgroundImage.src = Buffer.from(background.data, "utf-8");

    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    let top = 129;
    let left = 219;
    let cards = await summon.summonTen(name);
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

    attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: "summon.png",
    });

    embed = {
      title: name,
      url: "https://karasu-os.com/event/" + encodeURIComponent(name),
      image: {
        url: "attachment://summon.png",
      },
    };

    await interaction.editReply({
      embeds: [embed],
      files: [attachment],
    });
  },
};
