/* Webpage */
const http = require("http");
const express = require("express");
const app = express();

app.use(express.static("public"));
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  // response.sendStatus(200);
  response.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

/* Bot */
const prefix = ".";

const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

/* Commands */
client.once("ready", () => {
  client.user.setActivity("Devilgram, the retired bot, used to be cool.");
  console.log(`${client.user.tag} is ready!`);

  let things2do = [
    "how to become a devilgram star like asmo",
    "ASMR with Beel",
    "Levi Gaming Hour",
    "Become rich with Mammon: how to become rich by turning someone else in to a famous DevilTuber",
  ];

  let activity = 0;
  setInterval(function () {
    activity = Math.round(Math.random() * things2do.length - 1);

    // hard coding this part because brain is lazy
    if (activity > 0) {
      client.user.setActivity(`${things2do[activity]}`, { type: "WATCHING" });
    } else {
      client.user.setActivity("Cranesanity", { type: "PLAYING" });
    }
  }, 25 * 60 * 1000);
});

client.on("message", async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    client.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
    // message.reply("there was an error trying to execute that command!");
  }
});

client.login(process.env.TOKEN);
