var crypto = require('crypto');
var mongoose = require('mongoose');
var fs = require('fs');

// Excuse for not using password protection for MongoDB:
// Make sure that only localhost can bind to it (mongodb.conf)
// If someone has access to localhost, they can do worse damage anyway

var config = require('./config');
var schema = require('./schema');
var utils = require('./utils');

var middleware = require('./middleware');
var requireLogin = middleware.requireLogin;
var requireNoLogin = middleware.requireNoLogin;

module.exports = function(app) {

  app.get('/', function(req, res){
    res.redirect('/home');
  });

  app.get('/home', function(req, res){
    res.render('home');
  });

  app.get('/faq', function(req, res){
    res.render('faq');
  });

  app.get('/problems', function(req, res) {
    var ProblemSchema = schema.ProblemSchema;
    var Problem = mongoose.model('Problem', ProblemSchema);
  
    // display problems sorted by name
    Problem.find({}, null, {sort: {name: 1}}, function(err, problems) {
        if (err) {
            throw err;
            console.log(err);
        }
        else {
            res.render('problems', {problems: problems});
        }
    });
  });

  app.get('/problems/*', function(req, res) {
    var ProblemSchema = schema.ProblemSchema;
    var Problem = mongoose.model('Problem', ProblemSchema);

    var prob = {};
    prob.code = req.url.split('/problems/')[1];

    Problem.findOne(prob, function(err, problem) {
        if (err) {
            throw err;
            console.log(err);
        }
        else {
            if (!problem) {
                res.end("Problem does not exist.");
                return ;
            }
            res.render('problem_page', {problem: problem, auto_grade: config.AUTO_GRADING, manual_grade: config.MANUAL_GRADING});
        }
    });
  });

  app.get('/submit', requireLogin, function(req, res){
    var ProblemSchema = schema.ProblemSchema;
    var Problem = mongoose.model('Problem', ProblemSchema);
  
    // display problems sorted by name
    Problem.find({}, null, {sort: {name: 1}}, function(err, problems) {
        if (err) {
            throw err;
            console.log(err);
        }
        else {
            res.render('submit', {problems: problems});
        }
    });
  });

  function invalid(lang) {
      for (var i = 0; i < config.languages.length; i++) {
          if (lang == config.languages[i])
              return false;
      }
      return true;
  }

  app.post('/submit', requireLogin, function(req, res){
    var ProblemSchema = schema.ProblemSchema;
    var Problem = mongoose.model('Problem', ProblemSchema);

    var form = req.body;

    var prob = {};
    prob.code = form.problem_code;

    // Some server side validation.
    Problem.findOne(prob, function(err, problem) {
        if (err) {
            throw err;
            console.log(err);
        }
        else {
            if (!problem) {
                res.end("Problem does not exist.");
                return ;
            }
            if (invalid(form.language)) {
                res.end("Language does not exist.");
                return ;
            }

            // Language and Problem is valid, client ensures file is present
            // Create submission
            var SubmissionSchema = schema.SubmissionSchema;
            var Submission = mongoose.model('Submission', SubmissionSchema);

            var submission = new Submission();
            submission.problem_code = form.problem_code;
            submission.username = req.session.username;
            submission.language = form.language;
            submission.grading_type = problem.grading_type;

            if (submission.grading_type == config.AUTO_GRADING) {
                submission.judge_status = config.judge_statuses.QUEUED;
            }
            else {
                submission.judge_status = config.judge_statuses.MANUAL_GRADE_PENDING;
            }

            var filename = utils.generate_filename(form.language);
            submission.filename = filename;

            submission.save(function(err) {
                if (err) {
                    throw err;
                    console.log(err);
                }
                else {
                    console.log("Submission: " + submission.filename);
                    var basedir = __dirname + '/uploads/submissions';

                    var data = fs.readFileSync(req.files["file"].path);
                    var newPath = basedir + '/' + filename;
                    fs.writeFileSync(newPath, data);
                    res.redirect('/queue');
                }
            });
        }
    });

  });

  app.get('/queue', function(req, res){
    var SubmissionSchema = schema.SubmissionSchema;
    var Submission = mongoose.model('Submission', SubmissionSchema);
  
    Submission.find({}, null, {sort: {submission_date: -1}}, function(err, subs) {
        if (err) {
            throw err;
            console.log(err);
        }
        else {
            res.render('queue', {subs: subs});
        }
    });
  });

  app.get('/standings', function(req, res){
    var ScoreSchema = schema.ScoreSchema;
    var Score = mongoose.model('Score', ScoreSchema);
  
    Score.find({}, null, {sort: {score: -1, username: 1}}, function(err, scores) {
        if (err) {
            throw err;
            console.log(err);
        }
        else {
            res.render('standings', {scores: scores});
        }
    });
  });

  app.get('/profile', requireLogin, function(req, res){
    res.render('profile');
  });

  app.get('/submissions', requireLogin, function(req, res){
    var SubmissionSchema = schema.SubmissionSchema;
    var Submission = mongoose.model('Submission', SubmissionSchema);
  
    query = {username: req.session.username}
    Submission.find(query, null, {sort: {submission_date: -1}}, function(err, subs) {
        if (err) {
            throw err;
            console.log(err);
        }
        res.render('submissions', {subs: subs});
    });
  });

  app.get('/users', function(req, res){
    var UserSchema = schema.UserSchema;
    var User = mongoose.model('User', UserSchema);
  
    // display users sorted by name
    User.find({}, null, {sort: {name: 1}}, function(err, users) {
        if (err) {
            throw err;
            console.log(err);
        }
        else {
            res.render('users', {users: users});
        }
    });
  });

  app.get('/logout', function(req, res){
    delete req.session.username;
    delete req.session.is_admin;
    res.redirect('/login');
  });

  app.get('/login', requireNoLogin, function(req, res){
    res.render('login');
  });

  app.post('/login', requireNoLogin, function(req, res) {
    var form = req.body;

    var UserSchema = schema.UserSchema;
    var User = mongoose.model('User', UserSchema);
  
    var creds = {};

    creds.username = form.username;
    creds.password = crypto.createHash('sha256').update(config.salt + form.password).digest('hex');

    User.findOne(creds, function(err, user) {
        if (err) {
            throw err;
            console.log(err);
        }
        else {
            if (user) {
                // user found, log him in
                req.session.username = form.username;
                res.redirect('/home');
            }
            else {
                res.redirect('/login?invalid=1');
            }
        }
    });

  });

  app.get('/register', requireNoLogin, function(req, res){
    res.render('register');
  });


  app.get('/register/success', requireNoLogin, function(req, res){
      res.render('registersuccess', req.query);
  });

  // TODO: Validate this data similar to how it was done on the front end
  app.post('/register', requireNoLogin, function(req, res) {
    var form = req.body;

    if (req.body.passcode != config.passcode) {
      res.end("Incorrect passcode. Please obtain the correct" +
      " passcode and try registering again.");
    }
    else {
      var UserSchema = schema.UserSchema;
      var User = mongoose.model('User', UserSchema);
  
      var user = new User();

      // Check for duplicate usernames
      var creds = {};
      creds.username = form.username;
      console.log(creds);

      User.findOne(creds, function(err, result) {
          if (err) {
              throw err;
              console.log(err);
          }
          else {
              if (result) {
                  // username already exists
                  res.end("User name already exists in database, please choose a new one and try again.");
              }
              else {
                user.name = form.name;
                user.email = form.email;
                user.institute = form.institute;
                user.city = form.city;
                user.roll = form.roll;
                user.username = form.username;
                user.privilege_level = config.PRIVILEGE_USER;
                user.authcode = utils.generate_authcode();

                user.password = crypto.createHash('sha256').update(config.salt + form.pass1).digest('hex');

                user.save(function(err) {
                  if (err) {
                    throw err;
                    console.log(err);
                  } else {
                    console.log("New user added.");
                  }
                });

                // saved user to database, now redirect him
                
                var params = '?';
                params += 'username=' + user.username;
                params += '&authcode=' + user.authcode;

                res.redirect('/register/success' + params);
              }
          }
      });

    }
  });

  // Admin related stuff in routes_admin.js
};
