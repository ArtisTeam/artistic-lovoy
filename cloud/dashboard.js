module.exports = function () {
  var express = require('express');
  var app = express();

  app.get('/', function (req, res) {
    var currUser = Parse.User.current();
    if (currUser) {
      var Event = Parse.Object.extend('Event');
      var query = new Parse.Query(Event);
      if (currUser.get('group') === 1) { // org user
        query.equalTo('createdBy', currUser);
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
      } else if (currUser.get('group') === 2) { // vol user
        query.descending("createdAt");
        // query.limit(10);
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
    } else { // if (currUser)
      res.redirect('login');
    }
  });
  
  return app;
}();
