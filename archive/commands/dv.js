module.exports = {
  name: "dv",
  description: "returns link of devilgram",
  execute(message, args) {
    let devilgram = "";

    for (let i = 0; i < args.length; i++) {
      devilgram += args[i] + " ";
    }

    devilgram = devilgram.trim().replace(/ /g, "_"); // global replacement "/ /g"
    message.channel.send(
      `https://obey-me.fandom.com/wiki/${devilgram}/Devilgram`
    );
  },
};

/*
  const devilgram = message.content
    .replace("!dv", "")
    .trim()
    .replace(/ /g, "_");

  message.channel.send(
    `https://obey-me.fandom.com/wiki/${devilgram}/Devilgram`
  );
  */
