module.exports = function () {
  // libs
  var moment = require("cloud/lib/moment.js");
  var _ = require('cloud/lib/underscore.js');
  var express = require('express');
  var app = express();

  app.get('/', function (req, res) {
    if (Parse.User.current()) {
      if (Parse.User.current().get('group') === 1) { // org user
        var Event = Parse.Object.extend('Event');
        var query = new Parse.Query(Event);
        query.equalTo('createdBy', Parse.User.current());
        query.find({
          success: function (events) {
            for (var i=0; i<events.length; ++i) {
              events[i].createdAt =
                moment(events[i].createdAt).format("YYYY-MM-DD, hh:mm");
              events[i].updatedAt =
                moment(events[i].updatedAt).format("YYYY-MM-DD, hh:mm");
            }
            res.render('dashboard/org-dashboard', {events: events});
          },
          error: function (error) {
            res.send("Fail to query events: " + error.code + " " + error.message);
          }
        });
      } else if (Parse.User.current().get('group') === 2) { // vol user
        var Enroll = Parse.Object.extend('Enroll');
        var queryEnrolled = new Parse.Query(Enroll);
        queryEnrolled.equalTo('vol', Parse.User.current());
        queryEnrolled.include('event');
        queryEnrolled.find().then(
          function(eventsEnrolledPt) {
            // get eventsEnrolled
            var eventsEnrolled = new Array(eventsEnrolledPt.length);
            for (var i=0; i<eventsEnrolledPt.length; ++i) {
              eventsEnrolled[i] = eventsEnrolledPt[i].get('event');
            }
            for (var i=0; i<eventsEnrolled.length; ++i) {
              eventsEnrolled[i].createdAt =
                moment(eventsEnrolled[i].createdAt).format("YYYY-MM-DD, hh:mm");
              eventsEnrolled[i].updatedAt =
                moment(eventsEnrolled[i].updatedAt).format("YYYY-MM-DD, hh:mm");
            }
            // query all events
            var Event = Parse.Object.extend('Event');
            var queryEvent = new Parse.Query(Event);
            queryEvent.find({
              success: function (events) {
                for (var i=0; i<events.length; ++i) {
                  events[i].createdAt =
                    moment(events[i].createdAt).format("YYYY-MM-DD, hh:mm");
                  events[i].updatedAt =
                    moment(events[i].updatedAt).format("YYYY-MM-DD, hh:mm");
                }
                // get eventsId
                var eventsId = new Array(events.length);
                for (var i=0; i<events.length; ++i) {
                  eventsId[i] = events[i].id;
                }
                // get eventsEnrolledId
                var eventsEnrolledId = new Array(eventsEnrolled.length);
                for (var i=0; i<eventsEnrolled.length; ++i) {
                  eventsEnrolledId[i] = eventsEnrolled[i].id;
                }
                // get difference of eventsId and eventsEnrolledId
                var eventsNotEnrolledId = _.difference(eventsId, eventsEnrolledId);
                // construct not enrolled event obejcts array
                var eventsNotEnrolled = new Array(eventsNotEnrolledId.length);
                for (var i=0; i<eventsNotEnrolledId.length; ++i) {
                  eventsNotEnrolled[i] = events[eventsId.indexOf(eventsNotEnrolledId[i])];
                }
                // render!
                res.render('dashboard/vol-dashboard', {eventsEnrolled: eventsEnrolled,
                           eventsNotEnrolled: eventsNotEnrolled});
              },
              error: function (error) {
                res.send("Fail to query events: " + error.code + " " + error.message);
              }
            });
          },
          function(error) {
            res.send("Fail to query enrolled events")
          }
        );
      } // else if (Parse.User.current().get('group') === 2)
    } else { // if (Parse.User.current())
      res.redirect('/login?redir=dashboard');
    }
  });

  return app;
}();
