const db = require("../mongodbInit");

module.exports = {
  name: "guildDelete",
  async execute(guild) {
    await db.deleteServer(guild.id);
  },
};
