// The order is important
// GET     /new         render event/new (done)
// POST    /new         submit form create new event (done)
// GET     /:id         render event/detail
// DELETE  /:id         delete event
// GET     /:id/edit    render event/edit
// POST    /:id/enroll  enroll to event :id
// GET     /            ?? to dashboard?

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
    var Event = Parse.Object.extend('Event');
    var query = new Parse.Query(Event);
    query.get(req.params.id, {
      success: function (event) {
        alert("get " + req.params.id);
        res.render('event/detail', {event: event});
      },
      error: function (error) {
        res.send("Fail to query events: " + error.code + " " + error.message);
      }
    });
  });

  app.get('/:id', function (req, res) {
    alert("delete " + req.params.id);
  });
  
  app.get('/:id/edit', function (req, res) {
    alert("edit " + req.params.id);
  });

  app.get('/:id/enroll', function (req, res) {
    alert("enroll " + req.params.id);
  });

  return app;
}(); // end function