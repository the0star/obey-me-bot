const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../mongodbInit");

const data = new SlashCommandBuilder()
  .setName("twitter")
  .setDescription("Setup channels to listen for Obey Me! tweets.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("setup")
      .setDescription("Setup a channel for Twitter update.")
      .addStringOption((option) =>
        option
          .setName("language")
          .setDescription(
            "English (ObeyMeOfficial1) or Japanese (ObeyMeOfficial)"
          )
          .setRequired(true)
          .addChoices(
            { name: "English", value: "en" },
            { name: "Japanese", value: "ja" }
          )
      )
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("Which channel to send updates?")
          .setRequired(true)
      )
      .addStringOption((option) =>
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
      .addStringOption((option) =>
        option
          .setName("language")
          .setDescription(
            "English (ObeyMeOfficial1) or Japanese (ObeyMeOfficial)"
          )
          .setRequired(true)
          .addChoices(
            { name: "English", value: "en" },
            { name: "Japanese", value: "ja" }
          )
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("check")
      .setDescription("Check which Twitter updates this server if following.")
  );

async function setupTwitter(serverId, lang, channel, message) {
  try {
    if (message.length > 256) throw "Message exceeded 256 characters limit.";

    let dict = {};
    dict["settings.newsChannels." + lang] = {
      channelId: channel,
      message: message,
    };

    await db.updateServerInfo(serverId, dict);

    return;
  } catch (e) {
    console.error(e);
    return;
  }
}

async function removeTwitter(serverId, lang) {
  let dict = {};
  dict["settings.newsChannels." + lang] = {
    channelId: "",
    message: "",
  };
  await db.updateServerInfo(serverId, dict);
  return;
}

async function checkTwitter(serverId) {
  return (await db.getServerInfo(serverId, { "settings.newsChannels": 1 }))
    .settings.newsChannels;
}

module.exports = {
  data: data,
  async execute(interaction) {
    try {
      if (!interaction.isChatInputCommand()) return;

      await interaction.reply("Working on it...");

      let command = interaction.options.getSubcommand();
      let lang = interaction.options.getString("language");
      let serverId = interaction.guildId;

      if (command === "setup") {
        let channelId = interaction.options.getChannel("channel").id;
        let message = interaction.options.getString("message") || "";

        await setupTwitter(serverId, lang, channelId, message);
        await interaction.editReply(
          `You have added ${
            lang === "en" ? "English" : "Japanese"
          } Twitter updates to this server.`
        );
      } else if (command === "remove") {
        await removeTwitter(serverId, lang);
        await interaction.editReply(
          `You have removed ${
            lang === "en" ? "English" : "Japanese"
          } Twitter updates from this server.`
        );
      } else if (command === "check") {
        let channels = await checkTwitter(serverId);
        let enStatus = channels.en.channelId
          ? `Sending updates to <#${channels.en.channelId}>`
          : "n/a";
        let jaStatus = channels.ja.channelId
          ? `Sending updates to <#${channels.ja.channelId}>`
          : "n/a";

        await interaction.editReply(
          `English (ObeyMeOfficial1): ${enStatus}\nJapanese (ObeyMeOfficial): ${jaStatus}`
        );
      }
    } catch (e) {
      throw e;
    }
  },
};
