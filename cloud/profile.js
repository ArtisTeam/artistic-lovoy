module.exports = function () {
  // libs
  var express = require('express');
  var app = express();

  app.get('/', function (req, res) {
    var currUser = Parse.User.current();
    var moment = require("cloud/lib/moment.js");
    if (currUser) {
      if (currUser.get('group') === 1) {
        res.render('profile/org-profile');
      } else if (currUser.get('group') === 2) {
        res.render('profile/vol-profile');
      }
    } else {
      res.redirect('/login?redir=profile');
    }
  });

  return app;
}();
