const http = require("http");
const express = require("express");
const app = express();

app.use(express.static("public"));
app.get("/", (request, response) => {
  // response.sendStatus(200);
  response.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
