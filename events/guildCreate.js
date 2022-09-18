const db = require("../mongodbInit");

module.exports = {
  name: "guildCreate",
  async execute(guild) {
    await db.addServer(guild.toJSON());
  },
};
