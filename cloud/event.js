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
  var currUser = Parse.User.current();
  var currEvent = null;

  app.all('/:id*', function (req, res, next) {
    alert('[app.all]: req.params.id = ' + req.params.id)
    if (req.params.id === 'new') {
      next();
    } else {
      var Event = Parse.Object.extend('Event');
      var query = new Parse.Query(Event);
      query.get(req.params.id, {
        success: function (event) {
          currEvent = event;
          next();
        },
        error: function (event, error) {
          res.send("Fail to query event: " + error.code + " " + error.message);
        }
      });
    }
  });

  // render event/detail, the only view not require login
  app.get('/:id', function (req, res, next) {
    if (req.params.id === 'new') {
      next();
    } else {
      // currEvent must exist now
      res.render('event/detail', {event: currEvent});
    }
  });

  // middleware, require whichever login, set current user
  app.all('*', function (req, res, next) {
    if (!currUser) {currUser = Parse.User.current();}
    if (currUser) {
      alert("whichever middleware accepted");
      next();
    } else {
      alert("whichever middleware rejected, redirect to login");
      res.redirect('/login');
    }
  });

  // middleware, require loged in as volunteer when enroll/unenroll
  app.all('/:id/enroll*', function (req, res, next) {
    if (!currUser) {currUser = Parse.User.current();}
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
    if (!currUser) {currUser = Parse.User.current();}
    var Enroll = Parse.Object.extend('Enroll');
    var enroll = new Enroll();
    enroll.set('vol', currUser);
    enroll.set('event', currEvent);
    enroll.save(null, {
      success: function (event) {
        res.redirect('/dashboard');
      },
      error: function (event, error) {
        res.send('Failed to enroll, with error code: ' + error.message);
      }
    });
  });

  // unenroll in event
  app.post('/:id/enroll/delete', function (req, res) {
    alert("unenroll " + req.params.id);
  });

  // middleware, for anything else, require organization logged in
  app.all('*', function (req, res, next) {
    if (!currUser) {currUser = Parse.User.current();}
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
    if (!currUser) {currUser = Parse.User.current();}
    var EventItem = Parse.Object.extend('Event');
    var eventItem = new EventItem();
    eventItem.set('createdBy', currUser); // pointer to user
    eventItem.set('name', req.body.name);
    eventItem.set('description', req.body.description);

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
  });

  // delete event
  app.post('/:id/delete', function (req, res) {
    if (!currUser) {currUser = Parse.User.current();}
    if (currEvent.get('createdBy').id === currUser.id) {
      currEvent.destroy({
        success: function (event) {
          res.redirect('/dashboard');
        },
        error: function (event, error) {
          res.send('Failed to delete event, error code: ' + error.message);
        }
      });
    } else {
      res.send('Event not belong to current user.');
    }
  });
  
  // render event/edit
  app.get('/:id/edit', function (req, res) {
    res.render('event/edit', {event: currEvent});
  });

  // update event
  app.post('/:id/edit', function (req, res) {
    currEvent.set('name', req.body.name);
    currEvent.set('description', req.body.description);
    currEvent.save(null, {
      success: function (event) {
        res.redirect('/dashboard');
      },
      error: function (event, error) {
        res.send('Failed to save event, with error code: ' + error.message);
      }
    });
  });

  return app;

}(); // module.exports = function ()