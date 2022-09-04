// const aaa = require("../discordBot");
module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    client.user.setActivity("karasu-os.com");
    console.log(`Ready! Logged in as ${client.user.tag}`);
    // aaa.setServerDiscovery("1009578164625879100", "1009578164625879103", false);
  },
};
