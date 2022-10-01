const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const db = require("./mongodbInit");

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(process.env.TOKEN);

/* #region Functions */
exports.sendTwitterUpdates = async function (lang, link) {
  try {
    const channels = await db.getNewsChannels(lang);
    channels.forEach(async (i, j) => {
      let channel = client.channels.cache.get(i.channelId);
      channel
        .send(i.message + "\n" + link)
        .then(() => {
          exports.sendMessage(
            "1022190209179328655",
            `${lang}: Sent ${j + 1}/${channels.length} to ${i.channelId}.`
          );
        })
        .catch((e) => {
          exports.sendMessage(
            "1022190209179328655",
            `Failed to send \`${lang}\` update to channel ${i.channelId}.`
          );
          console.error("Error:", i.channelId, e.message);
        });
    });
  } catch (e) {
    console.error(e);
  }
};

exports.sendMessage = async function (channelId, message) {
  try {
    const channel = client.channels.cache.get(channelId);
    await channel.send(message);
    // .catch((e) => {
    //   console.error(e);
    // });

    // [
    //   "1022190209179328655",  // has message perm
    //   "1023815479304921119",  // does not have message perm
    //   "1022190209179328655",
    //   "1023815479304921119",
    //   "1022190209179328655",
    // ].forEach(async (i, j) => {
    //   let channel = client.channels.cache.get(i);
    //   channel
    //     .send(message)
    //     .then(() => {
    //       console.log(i, j);
    //     })
    //     .catch((e) => {
    //       console.error("Error T^T");
    //     });
    // });

    // console.log(result.toJSON());
  } catch (e) {
    console.error("ERROR:", e);
  }
};

exports.setServerDiscovery = function (guildId, channelId, val) {
  const guild = client.guilds.cache.get(guildId);
  guild.setWidgetSettings(
    {
      enabled: val,
      channel_id: channelId,
    },
    "Set server discovery to " + val
  );
};
/* #endregion */
