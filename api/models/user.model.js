const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    nickname: String,
    email: String,
    phone: String,
    coin: Number,
    chip: Number,
    game: Number,
    win: Number,
    pay: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('User', NoteSchema);