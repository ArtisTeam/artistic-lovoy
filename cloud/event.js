// [Notes on security]
// 1. The order is important
// 2. Use next() to fix order and middleware problem
// 3. Three kinds of access rights for middleware
//    > global: only GET /:id
//    > require login
//      > require vol: /enroll/*
//      > require org: otherthing
// 
// GET     /new         render event/new (done)
// POST    /new         submit form create new event (done)
// GET     /:id         render event/detail (the only thing that can be viewed
//                                           without login)
// POST    /:id/delete  delete event
// GET     /:id/edit    render event/edit
// POST    /:id/edit    updeate event
// POST    /:id/enroll  enroll to event :id
// POST    /:id/enroll/delete uninroll
// GET     /            ?? to dashboard?

module.exports = function () {
  var express = require('express');
  var app = express();
  var currUser = null;  

  // render event/detail, the only view not require login
  app.get('/:id', function (req, res, next) {
    if (req.params.id === 'new') {
      next();
    }
    var Event = Parse.Object.extend('Event');
    var query = new Parse.Query(Event);
    query.get(req.params.id, {
      success: function (currEvent) {
        res.render('event/detail', {event: currEvent});
      },
      error: function (currEvent, error) {
        res.send("Fail to query events: " + error.code + " " + error.message);
      }
    });
  });

  // middleware, require whichever login, set current user
  app.all('*', function (req, res, next) {
    currUser = Parse.User.current();
    if (currUser) {
      alert("whichever middleware accepted");
      next();
    } else {
      alert("whichever middleware rejected, redirect to login");
      res.redirect('/login');
    }
  });

  // middle-ware, require loged in as volunteer when enroll/unenroll
  app.all('/:id/enroll*', function (req, res, next) {
    if (currUser.get('group') === 2) {
      alert("vol middleware accepted");
      next();
    } else {
      alert("vol middleware rejected, redirect to dashboard");
      res.redirect('/dashboard');
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

  // middle-ware, for anything else, require organization logged in
  app.all('*', function (req, res, next) {
    if (currUser.get('group') === 1) {
      alert("org middleware accepted");
      next();
    } else {
      alert("org middleware rejected, redirect to dashboard");
      res.redirect('/dashboard');
    }
  });

  // render event/new
  app.get('/new', function (req, res) {
    res.render('event/new'); // must not include '/' in front
  });

  // submit form create new event
  app.post('/new', function (req, res) {
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
      success: function (currEvent) {
        res.redirect('/dashboard');
      },
      error: function (currEvent, error) {
        res.send('Failed to save event, with error code: ' + error.message);
      }
    });
  });

  // delete event
  // to optimize: use the same middleware for post delete and edit
  app.post('/:id/delete', function (req, res) {
    var Event = Parse.Object.extend('Event');
    var query = new Parse.Query(Event);
    query.equalTo('createdBy', currUser); // crated by curr user
    query.get(req.params.id, {
      success: function (currEvent) {
        currEvent.destroy({
          success: function (currEvent) {
            res.redirect('/dashboard');
          },
          error: function (currEvent, error) {
            res.send('Failed to save event, error code: ' + error.message);
          }
        });
      },
      error: function (error) {
        res.redirect('/dashboard');
      }
    });
  });
  
  // render event/edit
  app.get('/:id/edit', function (req, res) {
    var Event = Parse.Object.extend('Event');
    var query = new Parse.Query(Event);
    query.equalTo('createdBy', currUser);
    query.get(req.params.id, {
      success: function (currEvent) {
        res.render('event/edit', {event: currEvent});
      },
      error: function (currEvent, error) {
        res.redirect('/dashboard');
      }
    });
  });

  // update event
  app.post('/:id/edit', function (req, res) {
    var Event = Parse.Object.extend('Event');
    var query = new Parse.Query(Event);
    query.equalTo('createdBy', currUser); // crated by curr user
    query.get(req.params.id, {
      success: function (currEvent) {
        currEvent.set('eventName', req.body.eventName);
        currEvent.set('eventDescription', req.body.eventDescription);
        currEvent.save(null, {
          success: function (currEvent) {
            res.redirect('/dashboard');
          },
          error: function (currEvent, error) {
            res.send('Failed to save event, with error code: ' + error.message);
          }
        });
      },
      error: function (currEvent, error) {
        res.redirect('/dashboard');
      }
    });
  });

  return app;

}(); // module.exports = function ()