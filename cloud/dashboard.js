module.exports = function () {
  // libs
  var moment = require("cloud/lib/moment.js");
  var express = require('express');
  var app = express();

  app.get('/', function (req, res) {
    if (Parse.User.current()) {
      var Event = Parse.Object.extend('Event');
      var query = new Parse.Query(Event);
      if (Parse.User.current().get('group') === 1) { // org user
        query.equalTo('createdBy', Parse.User.current());
        query.find({
          success: function (events) {
            for (var i=0; i<events.length; ++i) {
              events[i].createdAt = 
                moment(events[i].createdAt).format("YYYY-MM-DD, hh:mm");
              events[i].updatedAt = 
                moment(events[i].updatedAt).format("YYYY-MM-DD, hh:mm");
            }
            res.render('org/dashboard', {events: events});
          },
          error: function (error) {
            res.send("Fail to query events: " + error.code + " " + error.message);
          }
        });
      } else if (Parse.User.current().get('group') === 2) { // vol user
        query.descending("createdAt");
        query.find({
          success: function (events) {
            for (var i=0; i<events.length; ++i) {
              events[i].createdAt = 
                moment(events[i].createdAt).format("YYYY-MM-DD, hh:mm");
              events[i].updatedAt = 
                moment(events[i].updatedAt).format("YYYY-MM-DD, hh:mm");
            }
            res.render('vol/dashboard', {events: events});
          },
          error: function (error) {
            res.send("Fail to query events: " + error.code + " " + error.message);
          }
        });
      }
    } else { // if (Parse.User.current())
      res.redirect('/login?redir=dashboard');
    }
  });
  
  return app;
}();
