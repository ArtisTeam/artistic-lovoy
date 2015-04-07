// The order is important
// GET     /new         render event/new (done)
// POST    /new         submit form create new event (done)
// GET     /:id         render event/detail
// POST    /:id/delete  delete event
// GET     /:id/edit    render event/edit
// POST    /:id/edit    updeate event
// POST    /:id/enroll  enroll to event :id
// POST    /:id/enroll/delete uninroll
// GET     /            ?? to dashboard?

module.exports = function () {
  var express = require('express');
  var app = express();

  // render event/new
  app.get('/new', function (req, res) {
    res.render('event/new'); // must not include '/' in front
  });

  // submit form create new event
  app.post('/new', function (req, res) {
    var currUser = Parse.User.current();
    if (currUser && currUser.get('group') === 1) {
      var EventItem = Parse.Object.extend('Event');
      var eventItem = new EventItem();
      eventItem.set('createdBy', currUser); // pointer to user
      eventItem.set('eventName', req.body.eventName);
      eventItem.set('eventDescription', req.body.eventDescription);

      var acl = new Parse.ACL();
      acl.setPublicReadAccess(true);
      acl.setPublicWriteAccess(false);
      acl.setWriteAccess(currUser, true);
      eventItem.setACL(acl);

      eventItem.save(null, {
        success: function (event) {
          res.redirect('/dashboard');
        },
        error: function (event, error) {
          res.send('Failed to save event, with error code: ' + error.message);
        }
      });
    } else {
      res.redirect('/login');
    }
  });

  // render event/detail
  app.get('/:id', function (req, res) {
    var Event = Parse.Object.extend('Event');
    var query = new Parse.Query(Event);
    query.get(req.params.id, {
      success: function (event) {
        res.render('event/detail', {event: event});
      },
      error: function (event, error) {
        res.send("Fail to query events: " + error.code + " " + error.message);
      }
    });
  });

  // delete event
  // to optimize: use the same middleware for post delete and edit
  app.post('/:id/delete', function (req, res) {
    var currUser = Parse.User.current();
    if (currUser && currUser.get('group') === 1) { // logged in as org
      var Event = Parse.Object.extend('Event');
      var query = new Parse.Query(Event);
      alert('req.params.id' + req.params.id)
      query.equalTo('createdBy', currUser); // crated by curr user
      query.get(req.params.id, {
        success: function (event) {
          event.destroy({
            success: function (event) {
              alert('success destroied')
              res.redirect('/dashboard');
            },
            error: function (event, error) {
              res.send('Failed to save event, error code: ' + error.message);
            }
          });
        },
        error: function (error) {
          res.redirect('/dashboard');
        }
      });
    } else {
      res.redirect('/login');
    }
    alert("delete " + req.params.id);
  });
  
  // render event/edit
  app.get('/:id/edit', function (req, res) {
    var currUser = Parse.User.current();
    if (currUser && currUser.get('group') === 1) {
      var Event = Parse.Object.extend('Event');
      var query = new Parse.Query(Event);
      query.equalTo('createdBy', currUser);
      query.get(req.params.id, {
        success: function (event) {
          res.render('event/edit', {event: event});
        },
        error: function (event, error) {
          res.redirect('/dashboard');
        }
      });
    } else {
      res.redirect('/login');
    }
  });

  // update event
  app.post('/:id/edit', function (req, res) {
    var currUser = Parse.User.current();
    if (currUser && currUser.get('group') === 1) { // logged in as org
      var Event = Parse.Object.extend('Event');
      var query = new Parse.Query(Event);
      alert('req.params.id' + req.params.id)
      query.equalTo('createdBy', currUser); // crated by curr user
      query.get(req.params.id, {
        success: function (event) {
          alert('success find to post edit')
          event.set('eventName', req.body.eventName);
          event.set('eventDescription', req.body.eventDescription);
          event.save(null, {
            success: function (event) {
              res.redirect('/dashboard');
            },
            error: function (event, error) {
              res.send('Failed to save event, with error code: ' + error.message);
            }
          });
        },
        error: function (event, error) {
          res.redirect('/dashboard');
        }
      });
    } else {
      res.redirect('/login');
    }
  });

  // enroll in event - shall we use post or get?
  app.post('/:id/enroll', function (req, res) {
    alert("enroll " + req.params.id);
  });

  // unenroll in event
  app.post('/:id/enroll/delete', function (req, res) {
    alert("unenroll " + req.params.id);
  });

  return app;
}(); // end function