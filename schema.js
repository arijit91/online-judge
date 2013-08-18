var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    institute: String,
    city: String,
    roll: String,
    username: String,
    password: String,
    authcode: String,
    privilege_level: { type: Number, min:0, max:10 },
    creation_date: { type: Date, default: Date.now }
});

exports.UserSchema = UserSchema;
