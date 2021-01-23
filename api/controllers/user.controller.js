const User = require('../models/user.model.js');

// Create and Save a new user
exports.create = (req, res) => {
    // Validate request
    if(!req.body.username || !req.body.password || !req.body.nickname) {
        return res.status(400).send({
            message: "username password nickname can not be empty"
        });
    }

    // Create a user
    const user = new User({
        username: req.body.username || "Untitled user", 
        password: req.body.password || "Untitled password",
        nickname: req.body.nickname || "Untitled nickname",
        email: "",
        phone: "",
        coin: "0",
        chip: "0",
        game: "0",
        win: "0",
        pay: "0"
    });

    // Save user in the database
    user.save()
    .then(data => {
        res.json({"message": "ok"});
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the user."
        });
        res.status(404).send({
            message: err.message || "Some error occurred while creating the user."
        });
    });
};

// Retrieve and return all users from the database.
exports.findAll = (req, res) => {
    User.find()
    .then(users => {
        res.send(users);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    });
};

// Find a single user with a userId
exports.findOne = (req, res) => {
    User.findById(req.params.userId)
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "user not found"
            });            
        }
        res.send(user);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "user not found"
            });                
        }
        return res.status(500).send({
            message: "Error retrieving user"
        });
    });
};

// Update a user identified by the userId in the request
exports.update = (req, res) => {

    // Find user and update it with the request body
    User.findByIdAndUpdate(req.params.userId, req.body, {new: true})
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "user not found"
            });
        }
        res.json({"message": "ok"});
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "user not found"
            });                
        }
        return res.status(500).send({
            message: "Error updating user"
        });
    });
};

// Delete a user with the specified userId in the request
exports.delete = (req, res) => {
    User.findByIdAndRemove(req.params.userId)
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "user not found"
            });
        }
        res.send({message: "ok"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "user not found"
            });                
        }
        return res.status(500).send({
            message: "Could not delete user"
        });
    });
};

// Check login
exports.login = (req, res) => {
    User.findOne({username: req.body.username, password: req.body.password})
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "user not found"
            });            
        }
        res.send({message: "ok"});
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "user not found"
            });                
        }
        return res.status(500).send({
            message: "Error login"
        });
    });
};