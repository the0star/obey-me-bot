const http = require("http");
const express = require("express");
const app = express();

const dbController = require("./mongodbInit");

app.use(express.static("public"));

app.get("/getNightmares", async (request, response) => {
  let result = await dbController.getNightmares();
  response.json(result);
});

app.get("/invites", (request, response) => {
  // response.sendStatus(200);
  response.sendFile(__dirname + "/views/invites.html");
});

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
