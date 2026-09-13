const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const players = {};

io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    players[socket.id] = {
        x: 100,
        y: 100
    };

    socket.emit("currentPlayers", players);

    socket.broadcast.emit("playerJoined", {
        id: socket.id,
        player: players[socket.id]
    });

    socket.on("move", (position) => {
        if (!players[socket.id]) return;

        players[socket.id].x = position.x;
        players[socket.id].y = position.y;

        socket.broadcast.emit("playerMoved", {
            id: socket.id,
            x: position.x,
            y: position.y
        });
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);

        delete players[socket.id];

        io.emit("playerLeft", socket.id);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
