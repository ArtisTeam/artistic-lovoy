// GET     /            ?? to dashboard?
// GET     /new         get new event form (done)
// POST    /new         submit form create new event (done)
// GET     /:id/edit    get edit event form
// GET     /:id         event detail form
// DELETE  /:id         delete event
// POST    /:id/enroll  enroll to event :id

module.exports = function () {
  var express = require('express');
  var app = express();

  app.get('/new', function (req, res) {
    res.render('event/new'); // must not include '/' in front
  });

  app.post('/new', function (req, res) {
    var currUser = Parse.User.current();
    if (currUser) {
      // TODO GROUP
      var EventItem = Parse.Object.extend('Event');
      var eventItem = new EventItem();
      eventItem.set('createBy', currUser); // pointer to user
      eventItem.set('eventName', req.body.eventName);
      eventItem.set('eventDescription', req.body.eventDescription);

      var acl = new Parse.ACL();
      acl.setPublicReadAccess(true);
      acl.setPublicWriteAccess(false);
      acl.setWriteAccess(currUser, true);
      eventItem.setACL(acl);

      eventItem.save(null, {
        success: function (event) {
          // alert(eventItem.get('eventDescription'));
          res.redirect('/dashboard');
        },
        error: function () {
          res.send('Failed to save event, with error code: ' + error.message);
        }
      });
    } else {
      res.redirect('/login');
    }
  });

  app.get('/:id', function (req, res) {
    alert(req.params.id);
  });

  return app;
}(); // end function