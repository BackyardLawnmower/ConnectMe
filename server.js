const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

io.on("connection", socket => {
  socket.on("chat message", msg => {
    socket.broadcast.emit("chat message", msg);
  });

  socket.on("voice message", msg => {
    socket.broadcast.emit("voice message", msg);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
