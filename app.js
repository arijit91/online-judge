/**
 * Module dependencies.
 */

var config = require('./config');
var schema = require('./schema');

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/'+config.db);

// all environments
app.set('port', config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Switch to production, right now no diff as error handler not used in dev
//app.set('env', 'production');

app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.cookieParser());
app.use(express.session({secret: config.session_secret}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

function requireAdmin(req, res, next) {
    var user = req.session.username;
    if (!user) {
        res.send('You have to be logged in as admin for this');
    }
    else {
        var UserSchema = schema.UserSchema;
        var User = mongoose.model('User', UserSchema);
      
        var creds = {};
        creds.username = user;
        User.findOne(creds, function(err, doc) {
            if (err) {
                throw err;
                console.log(err);
            }
            else {
                if (doc) {
                    // user found, check if he is admin
                    if (doc.privilege_level == config.PRIVILEGE_ADMIN) {
                        next();
                    }
                    else {
                        res.send('You have to be logged in as admin for this');
                    }
                }
                else {
                    console.log("Should not come here!");
                    res.status(500).end('Error 500: Server internal error');
                }
            }
        });
    }
}

app.use("/admin", requireAdmin);

app.all("/admin/*", requireAdmin, function(req, res, next) {
    next();
});

if ('development' == app.get('env')) {
  //app.use(express.errorHandler());
  app.use(express.logger('dev'));
}
else {
  app.use(express.logger());
}

var routes = require('./routes')(app);
var routes = require('./routes_admin')(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));

  process.setgid(config.gid);
  process.setgid(config.uid);
  console.log('Dropping privileges to ' + config.gid + ', ' + config.uid)

  console.log('\nMode: ' + app.get('env'));
});

app.use(function (err, req, res, next) {
  console.log(err);
  res.status(500).end('Error 500: Server internal error');
});

// Is the assumption that everything here is a 404 correct?
app.use(function(req, res) {
  res.status(404).end('Error 404: Page not found');
});
