module.exports = function () {
  var express = require('express');
  var app = express();

  app.get('/new', function (req, res) {
    res.render('event');
  });

  app.post('/new', function (req, res) {
    var currUser = Parse.User.current();
    if (currUser) {
      var EventItem = Parse.Object.extend('Event');
      var eventItem = new EventItem();
      eventItem.set('createBy', currUser);
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
        error: function () {
          res.send('Failed to save event, with error code: ' + error.message);
        }
      });
    } else {
      res.redirect('/login');
    }
  });
  return app;
}(); // end function