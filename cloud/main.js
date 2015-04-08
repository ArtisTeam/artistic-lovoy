Parse.User.enableRevocableSession();

require('cloud/app.js');

var Enroll = Parse.Object.extend("Enroll");

// Check if stopId is set, and enforce uniqueness based on the stopId column.
Parse.Cloud.beforeSave("Enroll", function(req, res) {
  // get requested vol and event
  var reqVol = req.Object.get("vol");
  var reqEvent = req.Object.get("event");
  // query if duplicated data exists
  var query = new Parse.Query(Enroll);
  query.equalTo('vol', reqVol);
  query.equalTo('event', reqEvent);
  query.find({
    success: function(women) {
      // Do stuff
    },
    error: function(error) {
      // Do stuff
    }
  }); // query.find
}); // Parse.Cloud.beforeSave

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
// Parse.Cloud.define("hello", function(req, res) {
//   res.success("Hello world!");
// });