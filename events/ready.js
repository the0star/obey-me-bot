// const discordController = require("../discordBot.js");
module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    client.user.setActivity("karasu-os.com");
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
