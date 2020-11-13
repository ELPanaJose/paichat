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
var mensaje = [{ text: "", ip: "127.0.0", time: 0 }]; /// aaaaaaaaa

var blackList = { }; 
app.use((req, res, next) => {
  let ip = req.headers["x-forwarded-for"].split(",")[0];
  if (blackList.hasOwnProperty(ip)) {
    if (blackList[ip] > 10) {
      res.redirect("https://ban-paichat.glitch.me/"); 
    }
  }

  next();
});
app.use(express.static(path.join(__dirname, "public")));

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
      mensaje.shift();
    }

    var d = new Date();
    var n = d.getTime();
    console.log(n);

    /// ban ip ///
    /// obtiene la ip y la suma a esto, lo compara por usuario de manera individual xd
    if (
      mensaje[mensaje.length - 1].text == msg &&
      mensaje[mensaje.length - 1].ip == ip
    ) {
      if (blackList.hasOwnProperty(ip)) {
        blackList[ip]++;
      } else {
        blackList[ip] = 0;
      }
    }
    //
    console.log(blackList); // ya no banea  que pusiste o añadiste?
    if (blackList.hasOwnProperty(ip)) {
      /// si se , me parecio raro eso
      if (blackList[ip] < 10 && msg.length < 500) {
        try {
          io.to(user.room).emit("message", formatMessage(user.username, msg));
          mensaje.push({
            text: msg,
            ip: ip,
            time: d.getTime()
          });
        } catch (e) {}
      }
    } else if (msg.length < 500) {
      try {
        io.to(user.room).emit("message", formatMessage(user.username, msg));
        mensaje.push({
          text: msg,
          ip: ip,
          time: d.getTime()
        });
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
try {
  server.listen(process.env.PORT || 3000, () => {
    console.log(`Server  good baby!`);
  }); 
} catch (e) {}

