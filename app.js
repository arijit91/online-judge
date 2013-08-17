/**
 * Module dependencies.
 */

var config = require('./config');

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Switch to production
//app.set('env', 'production');

app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.cookieParser());
app.use(express.session({secret: config.session_secret}));

if ('development' == app.get('env')) {
  //app.use(express.errorHandler());
  app.use(express.logger('dev'));
}
else {
  app.use(express.logger());
}

var routes = require('./routes')(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));

  process.setgid(config.gid);
  process.setgid(config.uid);
  console.log('Dropping privileges to ' + config.gid + ', ' + config.uid)

  console.log('\nMode: ' + app.get('env'));
});

app.use(function (err, req, res, next) {
  console.log(err);
  res.send(500, 'There seems to be an error');
});
