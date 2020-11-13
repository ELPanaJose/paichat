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
///////////////////////////   DESPUES DEBES DE MEJORARLO XD   mejorar que? nada , yo he de mejorarlo xd

const app = express();
const server = http.createServer(app);
const io = socketio(server);
var mensaje = [];

// Set static folder

app.use((req, res, next) => {
  try {
    let ip = req.headers["x-forwarded-for"].split(",")[0];
    if (blackList.hasOwnProperty(ip)) {
      if (blackList[ip] > 10) {
        res.redirect("https://ban-paichat.glitch.me/"); // <--
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
    if (mensaje.length > 20) {
      // Cuantos caracteres ?? ?       59     500 , aun no banea por eso pero no envia mas de 500                  , deberias de poner un aviso si el mensaje   es may     o   ??? bueno ya ahi puse el avizo, pero en celular se ve mal
      mensaje.shift();
    }
    console.log(mensaje);
    mensaje.push({
      text: msg,
      ip: ip
    });
    /// ban ip ///

    if (
      mensaje[mensajes.length - 1].text === msg &&
      mensaje[mensajes.length - 1].ip === ip
    ) {
      if (blackList.hasOwnProperty(ip)) {
        blackList[ip]++;
        console.log(blackList);
      } else {
        blackList[ip] = 0;
      }
    }
    //
    if (blackList.hasOwnProperty(ip)) {
      if (blackList[ip] < 10) {
        //aaaaa
        try {
          io.to(user.room).emit("message", formatMessage(user.username, msg));
          mensajes.push(formatMessage(user.username, msg));
        } catch (e) {}
      }
    } else if (msg.length < 500) {
      try {
        io.to(user.room).emit("message", formatMessage(user.username, msg));
        mensajes.push(formatMessage(user.username, msg));
      } catch (e) {}
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

server.listen(process.env.PORT || 3000, () =>
  console.log(`server on, all good  👍`)
);
