const http = require("http");
const server = http.createServer();
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "https://live-location-tracker-nextjs-client.vercel.app",
  },
});

const PORT = process.env.PORT || 5000
let users = [];

io.on("connection", (socket) => {
  socket.on("join", (data) => {
    const user = {
      socketId: socket.id,
      coords: data,
    };

    users.push(user);

    socket.broadcast.emit("new-user", user);
    socket.emit("current-user", user);
    socket.emit("users", users);
  });

  socket.on("position-change", (data) => {
    users = users.map((u) => {
      if (u.socketId === data.socketId) {
        return data;
      }
      return u;
    });

    io.emit("position-change", data);
    console.log(users);
  });

  socket.on("disconnect", () => {
    users = users.filter((u) => u.socketId !== socket.id);
    socket.broadcast.emit("users", users);
  });
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
