module.exports = {
  name: "ping",
  description: "Ping!",
  execute(message, args) {
    ping(message);
  },
};

async function ping(message) {
  const m = await message.channel.send("Ping?");
  m.edit(
    `Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. `
  );
}
