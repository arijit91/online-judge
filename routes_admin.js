var mongoose = require('mongoose');

var schema = require('./schema');
module.exports = function(app) {
  app.get('/admin', function(req, res){
    res.render('admin');
  });
  app.get('/admin/problem/add', function(req, res){
    res.render('admin_problem_add');
  });
};
