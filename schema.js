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

//var ProblemsSchema = new mongoose.Schema({
//    name: String,
//    code: String,
//    description: String,
//    input_format: String,
//    output_format: String,
//    constraints: String,
//    time_limit: { type: Number, min:0, },
//    memory_limit: { type: Number, min:0 },
//    sample_input: String,
//    sample_output: String,
//
//    type: String,
//});

exports.UserSchema = UserSchema;
//exports.ProblemSchema = ProblemSchema;
