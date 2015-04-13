
module.exports = function () {
  var express = require('express');
  var app = express();

  app.get('/signup', function (req, res) {
    res.render('user/signup');
  });

  app.post('/signup', function (req, res) {
    // get request data
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var group = parseInt(req.body.group);
    // verify password strength
    if ((!password) || password.length < 6) {
      res.send('Error: password not valid');
    }
    // create new user
    var user = new Parse.User();
    user.set('username', username);
    user.set('password', password);
    user.set('email', email);
    user.set('group', group);
    // sign up user
    user.signUp(null, {
      success: function (user) {
        //---use this to create new attributes
        //var OrgProfile = Parse.Object.extend('OrgProfile', {
        //  initialize: function (attrs, options) {
        //    this.name = 'noname';
        //  }
        //});
        if (group === 1) {
          var profile = Parse.Object.extend('OrgProfile');
        }
        else {
          var profile = Parse.Object.extend('VolProfile');
        }
        var prof = new profile();
        var profACL = new Parse.ACL();
        profACL.setPublicReadAccess(true);
        profACL.setPublicWriteAccess(false);
        profACL.setWriteAccess(Parse.User.current(), true);
        prof.setACL(profACL);

        //orgProf.set('name', 'UCSD'); //TODO: let user change this
        prof.set('createdBy', Parse.User.current());
        prof.save(null, {
          success: function (prof) {
            res.redirect('/dashboard');
          },
          error: function (prof, error) {
            res.render('general-message', {
              message:'Failed to create OrgProfile, with error code: ' + error.message
            });
          }
        });
      },
      error: function (user, error) {
        //TODO :tell user what's wrong. "The most likely case is that the username or email has already been taken by another user. You should clearly communicate this to your users, and ask them try a different username.
        // alert('Error: ' + error.code + ' ' + error.message);
        res.render('general-message', {
          message:'Error: ' + error.code + ' ' + error.message
        });
      }
    });
  });

  app.get('/login', function (req, res) {
    res.render('user/login');
  });

  app.post('/login', function (req, res) {
    // POST http://example.parseapp.com/test (with request body "message=hello")
    Parse.User.logIn(req.body.username, req.body.password).then(function (user) {
      var EventItem = Parse.Object.extend('Event');
      var query = new Parse.Query(EventItem);
      query.equalTo('createdBy', req.body.username);
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
      res.render('general-message', {
        message:'login fail'
      });
    });
  });

  // Logs out the user
  app.get('/logout', function (req, res) {
    Parse.User.logOut();
    res.redirect('/');
  });

  app.post('/password-edit', function (req,res) {
    if (!Parse.User.current()) {
      res.redirect('/login?redir=password-edit');
    } else {
      var name = Parse.User.current().get('username')
      Parse.User.logIn(name, req.body.oldPassword, {
        success: function(user) {
          user.set('password', req.body.newPassword)
          user.save(null, {
            success: function(user){
              res.render('general-message', {
                message:'Password changed'
              });
              //TODO: more detail
            },
            error: function(user, error){
              res.render('general-message', {
                message:'Failed to save new password'
              });
            }
          });
        },
        error: function(user, error) {
          Parse.User.logOut();//TODO: don't need to logout?
          res.render('general-message', {
            message:'login fail' + error.message
          });
        }
      });
    }
  });

  app.get('/forgot-password', function(req,res) {
    res.render('user/forgot-password');
  });

  app.post('/forgot-password', function(req,res) {
    Parse.User.requestPasswordReset(req.body.email, {
      success: function() {
        res.render('general-message', {
          message:'An email has been sent to your mailbox. Please follow the instruction there'
        });
      },
      error: function(error) {
        // res.send("Error: " + error.code + " " + error.message);
        res.render('general-message', {
          message:'Error: ' + error.code + ' ' + error.message
        });
      }
    });
  });

  return app;
}(); // end function
