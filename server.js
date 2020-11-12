const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require("./utils/users");
///////////////////////////

const app = express();
const server = http.createServer(app);
const io = socketio(server);
var messageAndUsers = [];

// Set static folder

app.use((req, res, next) => {
  try {
    let ip = req.headers["x-forwarded-for"].split(",")[0];
    if (blackList.hasOwnProperty(ip)) {
      if (blackList[ip] > 10) {
        res.redirect("http://xvideos.com/");
      }
    }
  } catch (e) {}

  next();
});
app.use(express.static(path.join(__dirname, "public")));





var mensajes = [""];
var blackList = {}; // the black list 
const botName = "MondaBot";
// Run when client connects



io.on("connection", socket => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to ChatPai!"));
    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );
    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on("chatMessage", msg => {
    const user = getCurrentUser(socket.id);

    let ip = socket.handshake.headers["x-forwarded-for"].split(",")[0];
    if (mensajes.length > 20) {
      mensajes.shift();
      console.log("borrado");
    }
    /// ban ip
    if (mensajes[mensajes.length - 1].text === msg) {
      if (blackList.hasOwnProperty(ip)) {
        blackList[ip]++;
        console.log(blackList); // aqui? lmao
        /// si xd
      } else {
        blackList[ip] = 0;
      }
    }
    //
    if (blackList.hasOwnProperty(ip)) {
      if (blackList[ip] > 10) {
      } else {
        io.to(user.room).emit("message", formatMessage(user.username, msg));
        mensajes.push(formatMessage(user.username, msg));
      }
    } else {
      io.to(user.room).emit("message", formatMessage(user.username, msg));

      mensajes.push(formatMessage(user.username, msg));
    }
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
