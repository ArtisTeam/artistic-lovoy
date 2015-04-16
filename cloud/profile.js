module.exports = function () {
  // libs
  var express = require('express');
  var app = express();
  var currProfile = null;

  // middleware
  // 1) require logged in
  // 2) querry the profile table -> get currProfile
  app.all('*', function (req, res, next) {
    if (!Parse.User.current()) {
      res.redirect('/login?redir=profile');
    } else {
      // check user type
      var query;
      var OrgProfile = Parse.Object.extend('OrgProfile');
      var VolProfile = Parse.Object.extend('VolProfile');
      if (Parse.User.current().get('group') === 1) {
        query = new Parse.Query(OrgProfile);
      } else if (Parse.User.current().get('group') === 2) {
        query = new Parse.Query(VolProfile);
      }
      // query!
      query.equalTo('createdBy', Parse.User.current());
      query.find({
        success: function (profiles) {
          alert('in success');
          if (profiles.length > 0) {
            currProfile = profiles[0];
            next();
          } else {
            res.send("Fail to query " + Parse.User.current());
          }
        },
        error: function(error) {
          res.send("Fail to query " + Parse.User.current());
        }
      });
    }
  });

  app.get('/', function (req, res) {
    // var moment = require("cloud/lib/moment.js");
    if (Parse.User.current()) {
      if (Parse.User.current().get('group') === 1) {
        res.render('profile/org-profile', {profile: currProfile});
      } else if (Parse.User.current().get('group') === 2) {
        res.render('profile/vol-profile', {profile: currProfile});
      }
    } else {
      res.redirect('/login?redir=profile');
    }
  });

  app.post('/edit', function (req, res) {
    // init valid keys
    // TODO: make them globally available
    var orgProfileKeys = ["name", "description", "website",
                          "contactName", "contactEmail", "contactPhone"];
    var volProfileKeys = ["firstName", "lastName", 
                          "contactEmail", "contactPhone",
                          "birthday",
                          "zipcode", "address", 
                          "gender", 
                          "profession",
                          "language"];
    var validProfileKeys = null;
    if (Parse.User.current().get('group') === 1) {
      validProfileKeys = orgProfileKeys;
    } else if (Parse.User.current().get('group') === 2) {
      validProfileKeys = volProfileKeys;
    }
    // function to check if value belong to array
    function isInArray(array, value) {
      return array.indexOf(value) > -1;
    }
    // update the values in Profile table!
    for (var key in req.body) {
      if (req.body.hasOwnProperty(key) && isInArray(validProfileKeys, key)) {
        currProfile.set(key, req.body[key]);
      }
    }
    // save!
    currProfile.save(null, {
      success: function (profile) {
        res.redirect('/profile');
      },
      error: function (profile, error) {
        res.send('Failed to save profile, with error code: ' + error.message);
      }
    });
  });

  return app;
}();
