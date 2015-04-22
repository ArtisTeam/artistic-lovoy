Parse.User.enableRevocableSession();

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
    success: function(enrolls) {
      if (enrolls.length === 0 || request.object.id === enrolls[0].id) {
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


Parse.Cloud.define("sendTwilioMessage", function(request, response) {
    // Require and initialize the Twilio module with your credentials
    var client = require('twilio')('AC15300787442c39ec0b8bd2bae0e90bfd', '91f45717322eec04c8eb917b9a5d623a');
     
    console.log("request: " + request.params);
    // Send an SMS message
    client.sendSms({
        to: request.params.phoneNumber,
        from: '+17162496228', 
        body: 'Hello ' + request.params.firstName + ', your verification code for Lovoy is ' + request.params.passcode
      }, function(err, responseData) { 
        if (err) {
          console.log(err);
        response.error("Twilio failed");
        } else { 
          console.log(responseData.from); 
          console.log(responseData.body);
          response.success("Twilio succeeded");
        }
      }
    );
});

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
// Parse.Cloud.define("hello", function(req, res) {
//   res.success("Hello world!");
// });
