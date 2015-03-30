
module.exports = function () {
  var express = require('express');
  var app = express();

  app.get('/signup', function (req, res) {
    res.render('signup');
  });

  app.post('/signup', function (req, res) {
    var user = new Parse.User();
    user.set('username', req.body.username);
    user.set('password', req.body.password);
    user.set('email', req.body.email);
    user.set('group', req.body.group);
    alert(req.body.group);
    user.signUp(null, {
      success: function (user) {
        //---use this to create new attributes
        //var OrgProfile = Parse.Object.extend('OrgProfile', {
        //  initialize: function (attrs, options) {
        //    this.orgName = 'noname';
        //  }
        //});
        var OrgProfile = Parse.Object.extend('OrgProfile');
        var orgProf = new OrgProfile();
        var orgProfACL = new Parse.ACL();
        orgProfACL.setPublicReadAccess(true);
        orgProfACL.setPublicWriteAccess(false);
        orgProfACL.setWriteAccess(Parse.User.current(), true);
        orgProf.setACL(orgProfACL);

        //orgProf.set('orgName', 'UCSD'); //TODO: let user change this
        orgProf.set('createBy', Parse.User.current());
        orgProf.save(null, {
          success: function (orgProf) {
            res.redirect('/dashboard');
          },
          error: function (orgProf, error) {
            alert('Failed to create new OrgProfile, with error code: ' + error.message);
            res.send('Failed to create OrgProfile, with error code: ' + error.message);
          }
        });
      },
      error: function (user, error) {
        // alert('Error: ' + error.code + ' ' + error.message);
        res.send('Error: ' + error.code + ' ' + error.message);
      }
    });
  });

  app.get('/login', function (req, res) {
    res.render('login');
  });

  app.post('/login', function (req, res) {
    // POST http://example.parseapp.com/test (with request body "message=hello")
    Parse.User.logIn(req.body.username, req.body.password).then(function (user) {
      var EventItem = Parse.Object.extend('Event');
      var query = new Parse.Query(EventItem);
      query.equalTo('createBy', req.body.username);
      query.descending('createdAt');
      query.find({
        success: function (results) {
          alert(results);
        },
        error: function (error) {
          alert('query fail!');
        }
      });
      res.redirect('/dashboard');
    }, function (error) {
      res.send('login fail');
    });
  });

  // Logs out the user
  app.get('/logout', function (req, res) {
    Parse.User.logOut();
    res.redirect('/');
  });

  return app;
}(); // end function