const chatForm = document.getElementById("chat-form"),
  chatMessages = document.querySelector(".chat-messages"),
  roomName = document.getElementById("room-name"),
  userList = document.getElementById("users");

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
  }),
  socket = io();
// Join chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on("message", message => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", e => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit("chatMessage", msg);

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  const p = document.createElement("p");
  p.classList.add("meta");
  p.innerText = message.username;
  p.innerHTML += `<span> ${message.time} </span>`;
  div.appendChild(p);
  const para = document.createElement("p");
  para.classList.add("text");
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector(".chat-messages").appendChild(div);
  //---------> esto es la parte de advertencia
  console.log("bloqueamos por ip , y pronto bloquearemos el DOM");
  console.log("chat pai 🤣😢😭🤢🥳💭👻👻😂🙏😂🤫");
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = "";
  users.forEach(user => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style("z-index", "-1");
}
const color = i => noise(i, float(frameCount) / 255) * 255;
function draw() {
  noFill();
  beginShape();
  for (let i = 0; i < width; i++) {
    let m = noise(0.01 * i, float(frameCount) / 500) * height;
    let r = color(i),
      g = color(i),
      b = color(i);
    stroke(r, 0, 0, 25);
    curveVertex(i, m);
  }
  endShape();
  beginShape();
  for (let i = 0; i < width; i++) {
    let m = noise(0.01 * i, float(frameCount) / 700) * height;
    let r = color(i);
    stroke(0, 0, r, 25);
    curveVertex(i, m);
  }
  endShape();
  beginShape();
  for (let i = 0; i < width; i++) {
    let m = noise(0.01 * i, float(frameCount) / 900) * height;

    stroke(0);
    curveVertex(i, m);
  }
  endShape();
}
