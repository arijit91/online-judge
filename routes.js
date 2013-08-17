var requireLogin = require('./middleware').requireLogin;

module.exports = function(app) {

  app.get('/', function(req, res){
    //res.render('index', { title: 'Express' });
    res.redirect('/home');
  });

  app.get('/home', function(req, res){
    res.render('home');
  });

  app.get('/test', requireLogin, function(req, res){
    res.render('test');
  });

  app.get('/login', function(req, res){
    res.render('login');
  });

  app.get('/register', function(req, res){
    res.render('register');
  });

};
