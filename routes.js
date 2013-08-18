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

  app.get('/login', function(req, res){
    res.render('login');
  });

  app.get('/register', function(req, res){
    res.render('register');
  });

  //
  //app.get('/test', requireLogin, function(req, res){
  //  res.render('test');
  //});
};
