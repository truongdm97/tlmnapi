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
var room3 = [];
var room4 = [];
var room1Id = [];
var room2Id = [];
var room3Id = [];
var room4Id = [];
var numReadyRoom1 = 0;
var numReadyRoom2 = 0;
var numReadyRoom3 = 0;
var numReadyRoom4 = 0;
var room1Status = 0;
var room2Status = 0;
var room3Status = 0;
var room4Status = 0;
var listCard = ["c03a", "c04a", "c05a", "c06a", "c07a", "c08a", "c09a", "c10a", "c11a", "c12a", "c13a", "c14a", "c20a", "c03b", "c04b", "c05b", "c06b", "c07b", "c08b", "c09b", "c10b", "c11b", "c12b", "c13b", "c14b", "c20b", "c03c", "c04c", "c05c", "c06c", "c07c", "c08c", "c09c", "c10c", "c11c", "c12c", "c13c", "c14c", "c20c", "c03d", "c04d", "c05d", "c06d", "c07d", "c08d", "c09d", "c10d", "c11d", "c12d", "c13d", "c14d", "c20d"];

function shuffleCard(room) {
	var listCardShuffle = listCard;
	var roomIdTemp, listCardUser = [];
	var i, j, k;
	var startCard = 0;
	var endCard = 13;
	var tempCard = '';
	for (i = 0; i < 52; i++) {
        j = Math.floor(Math.random() * 52);
        tempCard = listCardShuffle[i];
        listCardShuffle[i] = listCardShuffle[j];
        listCardShuffle[j] = tempCard;
    }
    switch(room) {
    	case "r1":
    		roomIdTemp = room1Id;
    		break;
    	case "r2":
    		roomIdTemp = room2Id;
    		break;
    	case "r3":
    		roomIdTemp = room3Id;
    		break;
    	case "r4":
    		roomIdTemp = room4Id;
    		break;
    }
    for (k = 0; k < roomIdTemp.length; k++) {
    	listCardUser = listCardShuffle.slice(startCard, endCard).sort();
    	io.to(roomIdTemp[k]).emit("server-send-game-start", listCardUser);
    	startCard = startCard + 13;
    	endCard = endCard + 13;
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
						numReadyRoom2 = numReadyRoom2 - 1;
					}
					io.in(room).emit("server-send-joined-room", room2, numReadyRoom2);
					if (room2 == []) {
						numReadyRoom2 = 0;
					}
					break;
				case "r3":
					room3.splice(room3.indexOf(user), 1);
					room3Id.splice(room1Id.indexOf(socket.id), 1);
					if (socket.Userready == 1) {
						numReadyRoom3 = numReadyRoom3 - 1;
					}
					io.in(room).emit("server-send-joined-room", room3, numReadyRoom3);
					if (room3 == []) {
						numReadyRoom3 = 0;
					}
					break;
				case "r4":
					room4.splice(room4.indexOf(user), 1);
					room4Id.splice(room1Id.indexOf(socket.id), 1);
					if (socket.Userready == 1) {
						numReadyRoom4 = numReadyRoom4 - 1;
					}
					io.in(room).emit("server-send-joined-room", room4, numReadyRoom4);
					if (room4 == []) {
						numReadyRoom4 = 0;
					}
					break;
			}
			//tam thoi
			room1Status = 0;
			room2Status = 0;
			room3Status = 0;
			room4Status = 0;
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
			case "r3":
				if (room3.length > 3) {
					socket.emit("server-send-room-full");
					return;
				} else {
					socket.join(room);
					room3.push(user);
					room3Id.push(socket.id);
					io.in(room).emit("server-send-joined-room", room3, numReadyRoom3);
				}
				break;
			case "r4":
				if (room4.length > 3) {
					socket.emit("server-send-room-full");
					return;
				} else {
					socket.join(room);
					room4.push(user);
					room4Id.push(socket.id);
					io.in(room).emit("server-send-joined-room", room4, numReadyRoom4);
				}
				break;
			}
		listJoined.push(user);
        socket.Userroom = room;
        socket.Username = user;
    });

    socket.on("user-send-messages", function(data){
		socket.broadcast.to(socket.Userroom).emit("server-send-messages", {un:socket.Username, nd:data});
	});

	socket.on("user-send-ready", function(data){
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
					shuffleCard(room);
				}
				break;
			case "r2":
				if (room2Status == 1) {
					socket.emit("server-send-game-started");
					return;
				}
				numReadyRoom1 = numReadyRoom1 + 1;
				io.in(room).emit("server-send-joined-room", room2, numReadyRoom2);
				if (numReadyRoom2 > 1 && numReadyRoom2 == room2.length) {
					room2Status = 1;
					shuffleCard(room);
				}
				break;
			case "r3":
				if (room3Status == 1) {
					socket.emit("server-send-game-started");
					return;
				}
				numReadyRoom1 = numReadyRoom1 + 1;
				io.in(room).emit("server-send-joined-room", room3, numReadyRoom3);
				if (numReadyRoom3 > 1 && numReadyRoom3 == room3.length) {
					room3Status = 1;
					shuffleCard(room);
				}
				break;
			case "r4":
				if (room4Status == 1) {
					socket.emit("server-send-game-started");
					return;
				}
				numReadyRoom1 = numReadyRoom1 + 1;
				io.in(room).emit("server-send-joined-room", room4, numReadyRoom4);
				if (numReadyRoom4 > 1 && numReadyRoom4 == room4.length) {
					room4Status = 1;
					shuffleCard(room);
				}
				break;
		}
	});

	socket.on("user-send-not-ready", function(data){
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
			case "r3":
				numReadyRoom3 = numReadyRoom3 - 1;
				io.in(room).emit("server-send-joined-room", room3, numReadyRoom3);
				break;
			case "r4":
				numReadyRoom4 = numReadyRoom4 - 1;
				io.in(room).emit("server-send-joined-room", room4, numReadyRoom4);
				break;
		}
	});

});

process.on('unhandledRejection', error => {
  //
});