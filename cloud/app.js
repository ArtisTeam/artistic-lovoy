// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var expressLayouts = require('cloud/express-layouts');
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(expressLayouts);
app.use(express.bodyParser());    // Middleware for reading request body

app.get('/', function (req, res) {
  res.render('welcome');
});

// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
app.get('/login', function(req, res) {
  res.render('login', { message: 'Welcome to Lovoy!' });
});

// Example reading from the request body of an HTTP post request.
app.post('/login', function (req, res) {
    // POST http://example.parseapp.com/test (with request body "message=hello")
  res.send(req.body.message);
});

app.get('/signup', function(req,res) {
  res.render('signup', { message: 'Thank you for sign up Lovoy!'});
  // POST http://example.parseapp.com/test (with request body "message=hello")
  //res.send(req.body.message);
});

app.post('/signup', function (req, res) {
  var user = new Parse.User();
  user.set('username', req.body.name);
  user.set('password', req.body.password);
  user.set('email', req.body.email);
  user.signUp(null, {
    success: function(user) {
      alert('Success create user: ' + req.body.name);   
    },
    error: function(user, error) {
      alert('Error: ' + error.code + ' ' + error.message);
    }
  });
});
  

// Attach the Express app to Cloud Code.
app.listen();
