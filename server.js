//-------------------> constants
const path = require("path"),
  http = require("http"),
  express = require("express"),
  socketio = require("socket.io"),
  formatMessage = require("./utils/messages"),
  app = express(),
  server = http.createServer(app),
  io = socketio(server),
  {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
  } = require("./utils/users"),
  botName = "MondaBot";
//-------------------> variables
var mensaje = { "127.0.0": [{ text: "", ip: "127.0.0", time: 0 }] },
  blackList = {};
//-------------------> request handler
app.use((req, res, next) => {
  try {
    let ip = req.headers["x-forwarded-for"].split(",")[0];
    if (blackList.hasOwnProperty(ip) && blackList[ip] > 10) {
      res.redirect("https://ban-paichat.glitch.me/");
    }
  } catch (e) {}

  next();
});
try {
  app.use(express.static(path.join(__dirname, "public")));
} catch (e) {}

//------------------->then when the client is connected
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

  socket.on("chatMessage", msg => {
    const user = getCurrentUser(socket.id);

    let ip = socket.handshake.headers["x-forwarded-for"].split(",")[0];
    if (!mensaje.hasOwnProperty(ip)) {
      mensaje[ip] = [
        {
          text: undefined,
          ip: undefined,
          time: 1, 
          diference: undefined
        }
      ];
    }

    if (mensaje[ip].length > 20) {
      mensaje[ip].shift();
    }

    console.log(mensaje);
    var d = new Date();
    try {
      if (
        (mensaje[ip][mensaje[ip].length - 1].text == msg &&
          mensaje[ip][mensaje[ip].length - 1].ip == ip) ||
        mensaje[ip][mensaje[ip].length - 1].diference ==
          mensaje[ip][mensaje[ip].length - 2].diference
      ) {
        if (blackList.hasOwnProperty(ip)) {
          blackList[ip]++;
        } else {
          blackList[ip] = 0;
        }
      }
    } catch (e) {}

    //
    console.log(blackList); 
    if (blackList.hasOwnProperty(ip) && blackList[ip] > 10) {
      console.log(ip);

    } else if (msg.length < 500) {
      try {
        io.to(user.room).emit("message", formatMessage(user.username, msg));
        mensaje[ip].push({
          text: msg,
          ip: ip,
          time: d.getTime(),
          diference:
            (d.getTime() - mensaje[ip][mensaje[ip].length - 1].time) / 1000
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
