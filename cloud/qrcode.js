module.exports = function () {
  var express = require('express');
  var app = express();

  // TODO: shall we verify this? or shall we just give the work to event.js?
  app.get('/:eventId/:volId', function (req, res) {
    if ((!Parse.User.current()) || Parse.User.current().id != req.params.volId) {
      res.redirect('/login');
    } else {
      // res.send(req.params.eventId + "+" + req.params.volId);
      res.render('qrcode', {eventId: req.params.eventId, volId: req.params.volId});
      // alert(req.params.eventId + "+" + req.params.volId);
      // var Event = Parse.Object.extend('Event');
      // var query = new Parse.Query(Event);
      // query.get(req.params.eventId, {
      //   success: function (currEvent) {
      //     // check if the current user has enrolled in this event
      //     var Enroll = Parse.Object.extend('Enroll');
      //     var query = new Parse.Query(Enroll);
      //     query.equalTo('vol', Parse.User.current());
      //     query.equalTo('event', currEvent);
      //     query.find({
      //       success: function (enroll) {
      //         if (enroll.length > 0) {
      //           // great, verified!
      //           res.render('qrcode', {event: currEvent});
      //         } else {
      //           res.send('You have not enrolled in this event');
      //         }
      //       }, 
      //       error: function(error) {
      //         res.send("Fail to query " + currUser + "events");
      //       }
      //     });
      //   },
      //   error: function (event, error) {
      //     res.send("Failed to query event");
      //   }
      // });
    }
  });

  return app;
}();
