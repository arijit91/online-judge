var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    institute: String,
    city: String,
    roll: String,

    // Required to be distinct
    username: String,

    password: String,
    authcode: String,
    privilege_level: { type: Number, min:0, max:10 },
    creation_date: { type: Date, default: Date.now }
});

var ProblemSchema = new mongoose.Schema({
    name: String,

    // Required to be distinct
    code: String,

    description: String,
    points: Number,
    grading_type: String,

    // The stuff below makes sense only for auto grading
    input_format: String,
    output_format: String,
    constraints: String,
    time_limit: { type: Number, min:0, },
    memory_limit: { type: Number, min:0 },
    sample_input: String,
    sample_output: String,
    num_input_files: Number,

    // Should add up to 100
    input_file_weights: [Number]
});

var SubmissionSchema = new mongoose.Schema({
    problem_code: String,
    username: String,
    submission_date: { type: Date, default: Date.now },
    language: String,
    grading_type: String,

    // SHA 1 hash with file extension
    filename: String,

    judge_status : String,

    // Results for input files: 0 or 1
    judge_result_auto: [Number],

    // Result of manual grading
    judge_result_manual: Number,

    compile_error: String,
});

var ManualGradeSchema = new mongoose.Schema({
    problem_code: String,
    username: String,
    score: Number
});

var ScoreSchema = new mongoose.Schema({
    username: String,
    score: Number
});

exports.UserSchema = UserSchema;
exports.ProblemSchema = ProblemSchema;
exports.SubmissionSchema = SubmissionSchema;
exports.ManualGradeSchema = ManualGradeSchema;
exports.ScoreSchema = ScoreSchema;
