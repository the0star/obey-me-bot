const { SlashCommandBuilder } = require("discord.js");
const db = require("../mongodbInit");

const data = new SlashCommandBuilder()
  .setName("mystats")
  .setDescription("Check my stats.")
  .addSubcommand((subcommand) =>
    subcommand.setName("luck").setDescription("Check my gacha luck.")
  );

module.exports = {
  data: data,
  async execute(interaction) {
    try {
      if (!interaction.isChatInputCommand()) return;

      await interaction.reply("Working on it...");

      let command = interaction.options.getSubcommand();

      if (command === "luck") {
        let percentage = await db.getUserLuck(interaction.user.id, "global");

        await interaction.editReply(
          `Your luck is better than ${percentage}% of all users.`
        );
      } else if (command === "remove") {
      } else if (command === "check") {
      }
    } catch (e) {
      throw e;
    }
  },
};
