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

io.on("connection", function(socket){

	socket.on("disconnect", function(){
		if (socket.Username) {
			var user = socket.Username;
	    	var room = socket.Userroom;

			listJoined.splice(listJoined.indexOf(user), 1);
	        switch(room) {
				case "r1":
					room1.splice(room1.indexOf(user), 1);
					break;
				case "r2":
					room2.splice(room2.indexOf(user), 1);
					break;
				case "r3":
					room3.splice(room3.indexOf(user), 1);
					break;
				case "r4":
					room4.splice(room4.indexOf(user), 1);
					break;
			}
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
					socket.emit("server-send-joined-room", room1);
					room1.push(user);
				}
				break;
			case "r2":
				if (room2.length > 3) {
					socket.emit("server-send-room-full");
					return;
				} else {
					socket.emit("server-send-joined-room", room2);
					room2.push(user);
				}
				break;
			case "r3":
				if (room3.length > 3) {
					socket.emit("server-send-room-full");
					return;
				} else {
					socket.emit("server-send-joined-room", room3);
					room3.push(user);
				}
				break;
			case "r4":
				if (room4.length > 3) {
					socket.emit("server-send-room-full");
					return;
				} else {
					socket.emit("server-send-joined-room", room4);
					room4.push(user);
				}
				break;
			}
		listJoined.push(user);
		socket.join(room);
        socket.Userroom = room;
        socket.Username = user;
    });

	socket.on("user-send-messages", function(room, data){
		socket.broadcast.to(room).emit("server-send-messages", {un:socket.Username, nd:data});
	});

});

process.on('unhandledRejection', error => {
  //
});