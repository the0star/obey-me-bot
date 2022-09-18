const { SlashCommandBuilder } = require("discord.js");
const db = require("../mongodbInit");

const data = new SlashCommandBuilder()
  .setName("twitter")
  .setDescription("Setup channels to listen for Obey Me! tweets.")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("setup")
      .setDescription("Setup a channel for Twitter update.")
      .addStringOption((option) =>
        option
          .setName("language")
          .setDescription("English or Japanese")
          .setRequired(true)
          .addChoices(
            { name: "English", value: "english" },
            { name: "Japanese", value: "japanese" }
          )
      )
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("Which channel to send updates?")
          .setRequired(true)
      )
      .addChannelOption((option) =>
        option
          .setName("message")
          .setDescription(
            "(Optional) if you want a message to come before the link."
          )
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription("Remove a channel from Twitter updates.")
  );

async function setupTwitter(type, channel, message) {
  try {
    if (message.length > 256) throw "Message too long!";
    
    return;
  } catch (e) {
    return;
  }
}

async function removeTwitter(type) {
  return;
}

module.exports = {
  data: data,
  async execute(interaction) {
    try {
      let command = interaction.options.getSubCommand();
      if (command === "setup") {
        await setupTwitter();
      } else if (command === "remove") {
        await removeTwitter();
      }
      await interaction.reply("Pong!");
      // var: 1) english or japanese, 2) channels,
      // optional: 3) message to go with the tweet
    } catch (e) {
      throw e;
    }
  },
};
