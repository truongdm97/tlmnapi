module.exports = (app) => {
    const users = require('../controllers/user.controller.js');

    // Create a new user
    app.post('/users', users.create);

    // Retrieve all users
    app.get('/users', users.findAll);

    // Retrieve a single user with userId
    app.get('/users/:userId', users.findOne);

    // Update a user with userId
    app.put('/users/:userId', users.update);

    // Delete a user with userId
    app.delete('/users/:userId', users.delete);

    // Check login
    app.post('/login', users.login);

    // 404
    app.post('*', function(req, res){
      res.status(404).json({"message": "404"});
    });

    app.get('*', function(req, res){
      res.status(404).json({"message": "404"});
    });
}