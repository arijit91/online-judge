var mongoose = require('mongoose');
var mkdirp = require('mkdirp');
var fs = require('fs');

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

              res.redirect('/admin/problem/edit');
            }
        }
    });
   }); 
}
