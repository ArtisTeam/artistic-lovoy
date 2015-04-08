require('cloud/app.js');

var Enroll = Parse.Object.extend("Enroll");

// Check if stopId is set, and enforce uniqueness based on the stopId column.
Parse.Cloud.beforeSave("Enroll", function(request, response) {
  // get requested vol and event
  var reqVol = request.object.get("vol");
  var reqEvent = request.object.get("event");
  // query if duplicated data exists
  var query = new Parse.Query(Enroll);
  query.equalTo('vol', reqVol);
  query.equalTo('event', reqEvent);
  alert(reqVol);
  query.find({
    success: function(events) {
      if (events.length === 0) {
        response.success();
      }
      else {
        response.error();
      }
    },
    error: function(error) {
      // Do stuff
      response.error();
    }
  }); // query.find
}); // Parse.Cloud.beforeSave

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
// Parse.Cloud.define("hello", function(req, res) {
//   res.success("Hello world!");
// });