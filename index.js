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

// listen for requests
// app.listen(3001);
//app.listen(process.env.PORT || 3001);

var server = require("http").Server(app);
var io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
//server.listen(3002);
server.listen(process.env.PORT || 80);

var arrUsers = [""];

io.on("connection", function(socket){

	socket.on("disconnect", function(){
		if(arrUsers.indexOf(socket.Username)>0){
			arrUsers.splice(
				arrUsers.indexOf(socket.Username), 1
			);
			socket.broadcast.emit("server-send-list-users", arrUsers);
		}
	});

	socket.on("client-send-username", function(data){
		socket.Username = data;
		arrUsers.push(socket.Username);
		socket.emit("server-send-singup-success", data);
		io.sockets.emit("server-send-list-users", arrUsers);
	});

	socket.on("logout", function(){
		arrUsers.splice(
			arrUsers.indexOf(socket.Username), 1
		);
		socket.broadcast.emit("server-send-list-users", arrUsers);
	});

	socket.on("user-send-messages", function(data){
		socket.broadcast.emit("server-send-messages", {un:socket.Username, nd:data});
	});

	socket.on("typing", function(){
		socket.broadcast.emit("server-send-typing");
	});
	socket.on("stop-typing", function(){
		socket.broadcast.emit("server-send-stop-typing");
	});
});