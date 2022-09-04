const http = require("http");
const express = require("express");
const app = express();

app.use(express.static("public"));
app.get("/", (request, response) => {
  // response.sendStatus(200);
  response.sendFile(__dirname + "/views/invites.html");
});

// app.get("/servers", (request, response) => {
//   response.sendFile(__dirname + "/views/invites.html");
// });

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
