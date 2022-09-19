const test = require("../discordBot");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    // client.user.setActivity("karasu-os.com");
    console.log(`Ready! Logged in as ${client.user.tag}`);

    // await test.sendTwitterUpdates("en", "link");
  },
};
