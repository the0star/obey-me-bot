const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
// const { token } = require("./config.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

/* #region Functions */
exports.sendMsg = function (channelId, msg) {
  const channel = client.channels.cache.get(channelId);
  channel.send(msg);
};

// exports.getInvites = function (guildId) {
//   const guild = client.guilds.cache.get(guildId);
//   guild.invites.fetch().then(console.log).catch(console.error);
// };

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
