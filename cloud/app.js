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

app.get('/login', function(req, res) {
  res.render('login', { message: 'Welcome to Lovoy!' });
});

app.post('/login', function (req, res) {
  // POST http://example.parseapp.com/test (with request body "message=hello")
  // res.send(req.body.message);
  Parse.User.logIn(req.body.username, req.body.password, {
  success: function(user) {
    res.send('Success Login');
  },
  error: function(user, error) {
    res.send('Login failed');
  }
});
});

app.get('/signup', function(req,res) {
  res.render('signup', {message: 'Thank you for sign up Lovoy!'});
});

app.post('/signup', function (req, res) {
  var user = new Parse.User();
  user.set('username', req.body.username);
  user.set('password', req.body.password);
  user.set('email', req.body.email);
  user.signUp(null, {
    success: function(user) {
      alert('Success create user: ' + req.body.username);   
    },
    error: function(user, error) {
      alert('Error: ' + error.code + ' ' + error.message);
    }
  });
});
  
// Attach the Express app to Cloud Code.
app.listen();