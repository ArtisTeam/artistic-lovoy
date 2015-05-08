Parse.User.enableRevocableSession();

require('cloud/app.js');
var moment = require('cloud/lib/moment.js');
var momentTz = require('cloud/lib/moment-timezone-with-data.js');
// moment.tz.add(require('cloud/lib/moment-timezone-with-data.js'));

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
  console.log("request: " + request.params);

  response.success("Twilio succeeded");


    // Require and initialize the Twilio module with your credentials
    var client = require('twilio')('AC15300787442c39ec0b8bd2bae0e90bfd', '91f45717322eec04c8eb917b9a5d623a');

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

Parse.Cloud.define("enrollEvent", function(request, response) {
  if (!Parse.User.current()) {
    response.error("The user hasn't logged in.");
  }
  var currEvent = null;

  var Event = Parse.Object.extend('Event');
  var query = new Parse.Query(Event);
  query.get(req.params.id, {
    success: function (event) {
      currEvent = event;
    },
    error: function (event, error) {
      var test;
      res.send("Fail /:id*: " + error.code + error.message +'\ntest='+test);
    }
  });
});

// Now the only notification is event approvals
Parse.Cloud.define("PushNotification", function(request, response) {
  // Our "Comment" class has a "text" key with the body of the comment itself

  var volunteerId = request.params.volunteerId;
  var eventName = request.params.eventName;

  var query = new Parse.Query(Parse.Installation);
  console.log("push msg received")

  query.equalTo('channels', 'registrationNotice');
  query.equalTo('userId', volunteerId);
  Parse.Push.send({ 
    where: query,
    data: {
      alert: "Your application for \"" + eventName + "\" has been approved!",
      badge: "Increment"
    }
  }, {
    success: function() {
      console.log("Push was successful");
    },
    error: function(error) {
      console.error(error);
    }
  })
});

// incomplete
Parse.Cloud.define("getHistoryEvents", function(request, response) {

  var userId = request.params.userId;
  console.log(userId);
  var obj = new Parse.User({id:userId});

  var enrollQuery = new Parse.Query(Enroll);
  enrollQuery.equalTo("vol", obj);
  enrollQuery.find
  ({
    success: function(results)                              
    {              
      console.log("getHistoryEvents() got results");
      var retData = [];
      if (results.length > 0) 
      {                       
        var data = {};
        for (var i = 0;i < results.length;i++) {
              // data["enrollId"] = results[i]["objectId"];
              // data["status"] = results[i]["status"];
              // data["completionRate"] = results[i]["completionRate"];
            }
            response.success(JSON.stringify(results));
          }
          else    
          {}
      },
      error: function(error) {
        console.error("getHistoryEvents error " + error);
      }
    })  
});

// set the event property "started"
Parse.Cloud.job("bgJob1", function(request, status) {
  Parse.Cloud.useMasterKey();

  var Event = Parse.Object.extend('Event');
  var eventQuery = new Parse.Query(Event);
  eventQuery.notEqualTo("started", true);
  eventQuery.each(function(event) {

      // compare time using moment
      var eventDateString = event.get("date");
      var startTimeString = event.get("startTime");
      var endTimeString = event.get("endTime");
      var zone = "America/New_York";
      var startTimeFormat = moment.tz(eventDateString + " " + startTimeString, "MM/DD/YYYY hh:mm a", zone).format();
      if (moment(new Date()).isAfter(moment(startTimeFormat))) {
        event.set("started", true);
        return event.save();
      }
    }).then(function() {
    // Set the job's success status
    status.success("successfully.");
  }, function(error) {
    // Set the job's error status
    status.error("Uh oh, something went wrong.");
  });
  });


