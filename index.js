const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())

const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect(dbConfig.url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log("Could not connect to the database", err);
    process.exit();
});

// define a simple route
app.get('/', (req, res) => {
    res.json({"message": "Welcome"});
});

require('./api/routes/user.routes.js')(app, {
  cors: {
    origin: '*'
  }
});

var server = require("http").Server(app);
var io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});

server.listen(process.env.PORT || 80);

var listJoined = [];
var room1 = [];
var room2 = [];
var room1Id = [];
var room2Id = [];
var numReadyRoom1 = 0;
var numReadyRoom2 = 0;
var room1Status = 0;
var room2Status = 0;
var listCard = ["c03a", "c04a", "c05a", "c06a", "c07a", "c08a", "c09a", "c10a", "c11a", "c12a", "c13a", "c14a", "c20a", "c03b", "c04b", "c05b", "c06b", "c07b", "c08b", "c09b", "c10b", "c11b", "c12b", "c13b", "c14b", "c20b", "c03c", "c04c", "c05c", "c06c", "c07c", "c08c", "c09c", "c10c", "c11c", "c12c", "c13c", "c14c", "c20c", "c03d", "c04d", "c05d", "c06d", "c07d", "c08d", "c09d", "c10d", "c11d", "c12d", "c13d", "c14d", "c20d"];
var turnRoom1 = "";
var turnRoom2 = "";
var preWinRoom1 = "";
var preWinRoom2 = "";

function shuffleCard(room, roomLength) {
	var listCardShuffle = listCard;
	var listCardPlay, listCardUser = [];
	var i, j, k;
	var startCard = 0;
	var endCard = 13;
	var tempCard = "";
	var minCard = "c03a";
	for (i = 0; i < 52; i++) {
        j = Math.floor(Math.random() * 52);
        tempCard = listCardShuffle[i];
        listCardShuffle[i] = listCardShuffle[j];
        listCardShuffle[j] = tempCard;
    }
    listCardPlay = listCardShuffle.slice(0, roomLength * 13).sort();
    minCard = listCardPlay[0];
    
	switch(room) {
    	case "r1":
	    	for (k = 0; k < roomLength; k++) {
		    	listCardUser = listCardShuffle.slice(startCard, endCard).sort();
		    	startCard = startCard + 13;
		    	endCard = endCard + 13;
		    	if (preWinRoom1 == "" && listCardUser.includes(minCard)) {
		    		turnRoom1 = room1[k];
		    	}
		    	io.to(room1Id[k]).emit("server-send-card", listCardUser);
		    }
	    	io.in(room).emit("server-send-turn", turnRoom1);
    		break;
    	case "r2":
	    	for (k = 0; k < roomLength; k++) {
		    	listCardUser = listCardShuffle.slice(startCard, endCard).sort();
		    	startCard = startCard + 13;
		    	endCard = endCard + 13;
		    	if (preWinRoom2 == "" && listCardUser.includes(minCard)) {
		    		turnRoom2 = room2[k];
		    	}
		    	io.to(room2Id[k]).emit("server-send-card", listCardUser);
		    }
	    	io.in(room).emit("server-send-turn", turnRoom2);
    		break;
    }
}

io.on("connection", function(socket){

	socket.on("disconnect", function(){
		if (socket.Username) {
			var user = socket.Username;
			var room = socket.Userroom;

			listJoined.splice(listJoined.indexOf(user), 1);
	        switch(room) {
				case "r1":
					room1.splice(room1.indexOf(user), 1);
					room1Id.splice(room1Id.indexOf(socket.id), 1);
					if (socket.Userready == 1) {
						numReadyRoom1 = numReadyRoom1 - 1;
						socket.broadcast.to(room).emit("server-send-end-game");
					}
					io.in(room).emit("server-send-joined-room", room1, numReadyRoom1);
					if (room1 == []) {
						numReadyRoom1 = 0;
					}
					break;
				case "r2":
					room2.splice(room2.indexOf(user), 1);
					room2Id.splice(room1Id.indexOf(socket.id), 1);
					if (socket.Userready == 1) {
						numReadyRoom2 = numReadyRoom2 - 1
						socket.broadcast.to(room).emit("server-send-end-game");				}
					io.in(room).emit("server-send-joined-room", room2, numReadyRoom2);
					if (room2 == []) {
						numReadyRoom2 = 0;
					}
					break;
			}
			//tam thoi
			room1Status = 0;
			room2Status = 0;
		}
	});

	socket.on("join", function(room, user) {
		if (listJoined.includes(user)) {
			socket.emit("server-send-user-joined");
			return;
		}

        switch(room) {
			case "r1":
				if (room1.length > 3) {
					socket.emit("server-send-room-full");
					return;
				} else {
					socket.join(room);
					room1.push(user);
					room1Id.push(socket.id);
					io.in(room).emit("server-send-joined-room", room1, numReadyRoom1);
				}
				break;
			case "r2":
				if (room2.length > 3) {
					socket.emit("server-send-room-full");
					return;
				} else {
					socket.join(room);
					room2.push(user);
					room2Id.push(socket.id);
					io.in(room).emit("server-send-joined-room", room2, numReadyRoom2);
				}
				break;
			}
		listJoined.push(user);
        socket.Userroom = room;
        socket.Username = user;
    });

    socket.on("user-send-messages", function(message){
		socket.broadcast.to(socket.Userroom).emit("server-send-messages", {un:socket.Username, ms:message});
	});

	socket.on("user-send-ready", function(){
		socket.Userready = 1;
		var room = socket.Userroom
		switch(room) {
			case "r1":
				if (room1Status == 1) {
					socket.emit("server-send-game-started");
					return;
				}
				numReadyRoom1 = numReadyRoom1 + 1;
				io.in(room).emit("server-send-joined-room", room1, numReadyRoom1);
				if (numReadyRoom1 > 1 && numReadyRoom1 == room1.length) {
					room1Status = 1;
					shuffleCard(room, room1.length);
				}
				break;
			case "r2":
				if (room2Status == 1) {
					socket.emit("server-send-game-started");
					return;
				}
				numReadyRoom2 = numReadyRoom2 + 1;
				io.in(room).emit("server-send-joined-room", room2, numReadyRoom2);
				if (numReadyRoom2 > 1 && numReadyRoom2 == room2.length) {
					room2Status = 1;
					shuffleCard(room, room2.length);
				}
				break;
		}
	});

	socket.on("user-send-not-ready", function(){
		socket.Userready = 0;
		var room = socket.Userroom
		switch(room) {
			case "r1":
				numReadyRoom1 = numReadyRoom1 - 1;
				io.in(room).emit("server-send-joined-room", room1, numReadyRoom1);
				break;
			case "r2":
				numReadyRoom2 = numReadyRoom2 - 1;
				io.in(room).emit("server-send-joined-room", room2, numReadyRoom2);
				break;
		}
	});

	socket.on("user-send-play", function(userSend, listCard){
		var room = socket.Userroom;
		var user = socket.Username;
		var indexOfUser = 0;

		switch(room) {
			case "r1":
				if (user == turnRoom1) {
					indexOfUser = room1.indexOf(user);
					indexOfUser = indexOfUser + 1;
					if (indexOfUser == room1.length) {
						indexOfUser = 0;
					}
					turnRoom1 = room1[indexOfUser];
					io.in(room).emit("server-send-play-ok",userSend, listCard, turnRoom1);
				} else {
					socket.emit("server-send-play-error");
				}
				break;
			case "r2":
				if (user == turnRoom2) {
					indexOfUser = room2.indexOf(user);
					indexOfUser = indexOfUser + 1;
					if (indexOfUser == room2.length) {
						indexOfUser = 0;
					}
					turnRoom2 = room2[indexOfUser];
					io.in(room).emit("server-send-play-ok",userSend, listCard, turnRoom2);
				} else {
					socket.emit("server-send-play-error");
				}
				break;
		}
	});

	socket.on("user-send-end-game", function(){
		socket.broadcast.to(socket.Userroom).emit("server-send-end-game");
	});

});

process.on('unhandledRejection', error => {
  //
});