var crypto = require('crypto');
var mongoose = require('mongoose');

var config = require('./config');

// Excuse for not using password protection for MongoDB:
// Make sure that only localhost can bind to it (mongodb.conf)
// If someone has access to localhost, they can do worse damage anyway
var db = mongoose.connect('mongodb://localhost/'+config.db);

var schema = require('./schema');
var utils = require('./utils');

var requireLogin = require('./middleware').requireLogin;

module.exports = function(app) {

  app.get('/', function(req, res){
    //res.render('index', { title: 'Express' });
    res.redirect('/home');
  });

  app.get('/home', function(req, res){
    res.render('home');
  });

  app.get('/faq', function(req, res){
    res.render('faq');
  });

  app.get('/problems', function(req, res){
    res.render('problems');
  });

  app.get('/queue', function(req, res){
    res.render('queue');
  });

  app.get('/standings', function(req, res){
    res.render('standings');
  });

  app.get('/profile', function(req, res){
    res.render('profile');
  });

  app.get('/submissions', function(req, res){
    res.render('submissions');
  });

  app.get('/users', function(req, res){
    res.render('users');
  });

  app.get('/login', function(req, res){
    res.render('login');
  });

  app.get('/register', function(req, res){
    res.render('register');
  });

  app.get('/register/success', function(req, res){
      res.render('registersuccess', req.query);
  });

  app.post('/register', function(req, res) {
    var form = req.body;

    if (req.body.passcode != config.passcode) {
      res.end("Incorrect passcode. Please obtain the correct" +
      " passcode and try registering again.");
    }
    else {
      var UserSchema = schema.UserSchema;
      var User = mongoose.model('User', UserSchema);
  
      var user = new User();

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

  });

  //
  //app.get('/test', requireLogin, function(req, res){
  //  res.render('test');
  //});
};
