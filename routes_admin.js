var fs = require('fs');
var async = require('async');
var mongoose = require('mongoose');
var mkdirp = require('mkdirp');

var config = require('./config');
var schema = require('./schema');

module.exports = function(app) {
  app.get('/admin', function(req, res){
    res.render('admin');
  });

  app.get('/admin/problem/add', function(req, res){
    res.render('admin_problem_add', { auto_grade: config.AUTO_GRADING, manual_grade:
        config.MANUAL_GRADING});
  });
  
  app.post('/admin/problem/add', function(req, res, next) {
    var form = req.body;

    var num_files = form.num_input_files;
    for(var i = 1 ; i <= num_files; i++) {
        if (form.grading_type == config.AUTO_GRADING) {
            if ((!req.files["infile"+i]) || (!req.files["outfile"+i])) {
                res.end("Some files missing. Please try again.");
                return ;
            }
        }
    }

    var ProblemSchema = schema.ProblemSchema;
    var Problem = mongoose.model('Problem', ProblemSchema);
    
    var problem = new Problem();

    // Check for duplicate problem code
    var creds = {};
    creds.code = form.code;
    
    Problem.findOne(creds, function(err, result) {
        if (err) {
            throw err;
            console.log(err);
        }
        else {
            if (result) {
                // problem already exists
                res.end("Problem code '"+form.code+"' already exists in database, please choose a new one and try again.");
            }
            else {
              problem.name = form.name;
              problem.code = form.code;
              problem.description = form.description;
              problem.points = form.points;
              problem.grading_type = form.grading_type;

              if (problem.grading_type == config.AUTO_GRADING) {

                  problem.input_format = form.input_format;
                  problem.output_format = form.output_format;
                  problem.constraints = form.constraints;
                  problem.time_limit = form.time_limit;
                  problem.sample_input = form.sample_input;
                  problem.sample_output = form.sample_output;
                  problem.num_input_files = form.num_input_files;
                  problem.input_file_weights = []
    
                  for (var i = 1; i <= problem.num_input_files; i++) {
                      problem.input_file_weights.push(form["weight"+i]);
                  }

                  var basedir = __dirname + '/uploads/problems/' + problem.code;

                  // File handling stuff
                  mkdirp.sync(basedir + '/input/');
                  mkdirp.sync(basedir + '/output/');

                  for (var i = 1; i <= problem.num_input_files; i++) {
                      var data = fs.readFileSync(req.files["infile"+i].path);
                      var newPath = basedir + '/input/' + i + '.in';
                      fs.writeFileSync(newPath, data);

                      data = fs.readFileSync(req.files["outfile"+i].path);
                      newPath = basedir + '/output/' + i + '.out';
                      fs.writeFileSync(newPath, data);
                  }
              }

              problem.save(function(err) {
                  if (err) {
                      throw err;
                      console.log(err);
                  } 
                  else {
                      console.log("New problem added.");
                  }
              });

              res.redirect('/problems');
            }
        }
    });
   }); 

  app.get('/admin/problem/grade', function(req, res){
    var ProblemSchema = schema.ProblemSchema;
    var Problem = mongoose.model('Problem', ProblemSchema);
  
    // display problems sorted by name
    Problem.find({}, null, {sort: {name: 1}}, function(err, problems) {
        if (err) {
            throw err;
            console.log(err);
        }
        else {
            res.render('admin_problem_grade', {problems: problems});
        }
    });
  });

  app.get('/admin/problem/grade/*/*', function(req, res){
      var extra = req.url.split('/admin/problem/grade/')[1];
      var problem_code = extra.split('/')[0];
      var user_name = extra.split('/')[1];

      var ProblemSchema = schema.ProblemSchema;
      var Problem = mongoose.model('Problem', ProblemSchema);

      var prob = {'code': problem_code}

      Problem.findOne(prob, function(err, problem) {
          if (err) {
              throw err;
              console.log(err);
          }
          else {
              if (!problem) {
                throw err;
                console.log(err);
                return ;
              }
              var ManualGradeSchema = schema.ManualGradeSchema;
              var ManualGrade = mongoose.model('ManualGrade', ManualGradeSchema);

              var grade_query = {problem_code: problem_code, username: user_name};
              ManualGrade.findOne(grade_query, function(err, grade){
                  if (err) {
                      throw err;
                      console.log(err);
                  }
                  else {
                      var params = {problem_code: problem_code, username: user_name, points: problem.points};
                      if (!grade) {
                          params.graded = false;
                      }
                      else {
                          params.graded = true;
                          params.score = grade.score;
                      }

                      // Get submissions of user for problem latest to earliest
                      var SubmissionSchema = schema.SubmissionSchema;
                      var Submission = mongoose.model('Submission', SubmissionSchema);

                      var query = {problem_code: problem_code, username: user_name};

                      Submission.find(query, 'submission_date filename', {sort: {submission_date: -1}}, 
                        function(err, subs) {
                            if (err) {
                                throw err;
                                console.log(err);
                            }
                            else {
                                var num_subs = subs.length;
                                params.num_subs = num_subs;
                                params.submission_date = [];

                                for (var i = 0; i < num_subs; i++) {
                                    params.submission_date.push(subs[i].submission_date);
                                }

                                // Use an async task to get the contents of the files
                                var calls = [];
                                for (var i = 0; i < num_subs; i++) {
                                    // weird closure thingy is weird
                                    calls.push((function(index) {
                                        return function(callback) {
                                            var path = __dirname + '/uploads/submissions/' + subs[index].filename;
                                            fs.readFile(path, function(err, data) {
                                                if (err) {
                                                    throw err;
                                                    console.log(err);
                                                }
                                                else {
                                                    // converting buffer to string
                                                    callback(null, data);
                                                }
                                            });
                                        }
                                    })(i));
                                }

                                async.series(calls, function(err, stuff) {
                                    if (err) {
                                        throw err;
                                        console.log(err);
                                    }
                                    else {
                                        params.files = stuff;
                                        res.render('admin_problem_grade_user', params);
                                    }
                                });
                            }
                        });
                  }
              });
          }
      });

  });

  app.post('/admin/problem/grade/*/*', function(req, res){
      var form = req.body;
      var points = form.points;
      var extra = req.url.split('/admin/problem/grade/')[1];
      var problem_code = extra.split('/')[0];
      var user_name = extra.split('/')[1];

      var query = {problem_code: problem_code, username: user_name};

      var ManualGradeSchema = schema.ManualGradeSchema;
      var ManualGrade = mongoose.model('ManualGrade', ManualGradeSchema);

      ManualGrade.findOne(query, function(err, grade) {
          if (err) {
              throw err;
              console.log(err);
          }
          if (grade) {
            // Already exists, update
            ManualGrade.update(query, {$set: {score: points}}, 
              function(err) {
                if (err) {
                    throw err;
                    console.log(err);
                    return ;
                }
                var url = '/admin/problem/grade/';
                url += problem_code;
                url += '/';
                url += user_name;
                res.redirect(url);
              });
          }
          else {
            // Does not exist, create
            var mg = new ManualGrade();
            mg.problem_code = problem_code; 
            mg.username = user_name;
            mg.score = points;
            mg.save(function(err) {
                if (err) {
                    throw err;
                    console.log(err);
                    return ;
                }
                var url = '/admin/problem/grade/';
                url += problem_code;
                url += '/';
                url += user_name;
                res.redirect(url);
              });
            }
      });
  });

  app.get('/admin/problem/grade/*', function(req, res){
    var ProblemSchema = schema.ProblemSchema;
    var Problem = mongoose.model('Problem', ProblemSchema);

    var prob = {};
    prob.code = req.url.split('/admin/problem/grade/')[1];

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
            if (problem.grading_type != config.MANUAL_GRADING) {
                res.end("Not a manually graded problem.");
                return ;
            }

            var UserSchema = schema.UserSchema;
            var User = mongoose.model('User', UserSchema);

            User.find({}, null, {sort: {name: 1}}, function(err, users) {
                if (err) {
                    throw err;
                    console.log(err);
                }
                else {
                    res.render('admin_problem_grade_page', {users: users, problem: problem});
                }
            });
        }
    });
  });
}
