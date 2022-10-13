const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const summon = require("../summon.js");
const mongoDB = require("../mongodbInit");

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
          'Nightmare name. Accepts full names such as "Share Your Warmth", or short names such as "Warmth".'
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    let name = interaction.options.getString("name");
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
    let result = await summon.summonTen(name);

    await mongoDB.saveResults(interaction.user.id, result.result);

    attachment = new AttachmentBuilder(result.image, {
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
