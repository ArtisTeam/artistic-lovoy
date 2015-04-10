module.exports = function () {
  // libs
  var express = require('express');
  var app = express();

  app.get('/', function (req, res) {
    var currUser = Parse.User.current();
    var moment = require("cloud/lib/moment.js");
    if (currUser) {
      if (currUser.get('group') === 1) {
        res.render('org/profile');
      } else if (currUser.get('group') === 2) {
        alert('entered:' + currUser.get('group'));
        var Enroll = Parse.Object.extend('Enroll');
        var query = new Parse.Query(Enroll);
        query.equalTo('vol', currUser);
        query.include('event');
        query.find({
          success: function (events) {
            var eventPointedArr = new Array(events.length);
            for (var i=0; i<events.length; ++i) {
              eventPointedArr[i] = events[i].get('event');
            }
            res.render('vol/profile', {events: eventPointedArr});
          }, 
          error: function(error) {
            res.send("Fail to query " + currUser + "events")
          }
        });
      }
    } else {
      res.redirect('/login?redir=profile');
    }
  });

  return app;
}();
