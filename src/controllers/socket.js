// Handle socket.io connection
let ioServer;
module.exports.respond = (io) => {
  ioServer = io;
  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    socket.on("message", (message) => {
      console.log(message);
      io.broadcast.emit("message", { staffId: 1 });
    });

    socket.on("disconnect", () => {
      console.log("a user disconnected!");
    });
  });
};
module.exports.emitMsgFn = (emitMsg) => {
  ioServer.emit("message", emitMsg);
};
