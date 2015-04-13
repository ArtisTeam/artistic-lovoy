module.exports = function () {
  // libs
  var express = require('express');
  var app = express();

  app.get('/', function (req, res) {
    var currUser = Parse.User.current();
    // var moment = require("cloud/lib/moment.js");
    if (currUser) {
      if (currUser.get('group') === 1) {
        res.render('profile/org-profile');
      } else if (currUser.get('group') === 2) {
        res.render('profile/vol-profile');
      }
    } else {
      res.redirect('/login?redir=profile');
    }
  });

  app.post('/edit', function (req, res) {
    var currUser = Parse.User.current();

    function isInArray(array, value) {
      return array.indexOf(value) > -1;
    }

    // example of how to get all keys
    // for (var key in req.body) {
    //   if (req.body.hasOwnProperty(key)) {
    //     resStr += key + ' ' + req.body[key] + '|';
    //   }
    // }

    // TODO: make this globally available
    var orgProfileKeys = ["name", "description"];
    var volProfileKeys = ["name"];

    if (currUser) {
      if (currUser.get('group') === 1) {
        // query OrgProfile table
        var OrgProfile = Parse.Object.extend('OrgProfile');
        var query = new Parse.Query(OrgProfile);
        query.equalTo('createdBy', currUser);
        query.find({
          success: function (profiles) {
            alert('in success');
            if (profiles.length > 0) {
              profile = profiles[0];
              // insert new properties
              for (var key in req.body) {
                if (req.body.hasOwnProperty(key) &&
                    isInArray(orgProfileKeys, key)) {
                  profile.set(key, req.body[key]);
                }
              }
              profile.save(null, {
                success: function (event) {
                  res.render('profile/org-profile');
                },
                error: function (event, error) {
                  res.send('Failed to save profile, with error code: ' + error.message);
                }
              });
            } else {
              res.send("Fail to query " + currUser);
            }
          },
          error: function(error) {
            res.send("Fail to query " + currUser);
          }
        });
      } else if (currUser.get('group') === 2) {
        res.render('profile/vol-profile');
      }
    } else {
      res.redirect('/login?redir=profile');
    }
  });

  return app;
}();
