const http = require("http");
const express = require("express");
const app = express();

const dbController = require("./mongodbInit");
const gachaController = require("./summon");

app.use(express.static("public"));

app.get("/getNightmares", async (request, response) => {
  try {
    let result = await dbController.getNightmares();
    response.json(result);
  } catch (e) {
    console.error(e);
    response.json({});
  }
});

app.get("/summon", async (request, response) => {
  try {
    let name = "";
    let result = [];
    let img = "";
    let nightmares = await dbController.getNightmares();
    if (request.query.name && request.query.name !== "undefined") {
      name = request.query.name;
      result = await gachaController.summonTen(request.query.name);
      img =
        "data:image/png;base64," + Buffer.from(result.image).toString("base64");
    }
    response.json({
      name: name,
      result: result.result,
      img: img,
      nightmares: nightmares,
    });
  } catch (e) {
    console.error(e);
    response.json({});
  }
});

//

app.get("/invites", (request, response) => {
  response.sendFile(__dirname + "/views/invites.html");
});

app.get("/names", (request, response) => {
  response.sendFile(__dirname + "/views/names.html");
});

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
