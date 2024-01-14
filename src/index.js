const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const routes = require("./routes");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
require("dotenv").config();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: { origin: "*" },
});
const socket = require("./controllers/socket");
mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.DatabaseUrl, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log(new Date() + "[DB_CONNECTED]");
  })
  .catch((err) => console.log(new Date() + `[DB_CONNECTION_ERROR] ${err}`));

socket.respond(io);
routes(app);

httpServer.listen(4000, () => {
  console.log(`TCP Server is running on 4000`);
});
