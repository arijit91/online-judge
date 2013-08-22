exports.requireLogin = function(req, res, next) {
  if (!req.session.username) {
    res.send('You have to be logged in for this.');
  } else {
    next();
  }
}

exports.requireNoLogin = function(req, res, next) {
  if (req.session.username) {
    res.send('You have to be logged out for this.');
  } else {
    next();
  }
}
