// Initialize Express in Cloud Code
var express = require('express');
var expressLayouts = require('cloud/lib/express-layouts');
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var parseExpressCookieSession = require('parse-express-cookie-session');
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs'); // Set the template engine
app.use(expressLayouts);
app.use(express.bodyParser()); // Middleware for reading request body
app.use(parseExpressHttpsRedirect());
app.use(express.cookieParser('MING_QIN_SIGNING_SECRET'));
app.use(parseExpressCookieSession({
  fetchUser: true,
  key: 'lovoy.sess',
  cookie: {
    maxAge: 3600000 * 24 * 30
  }
}));

app.get('/', function (req, res) {
  res.render('welcome');
});

app.get('/profile', function (req, res) {
  var currUser = Parse.User.current();
  if (currUser) {
    if (currUser.get('group') === 1) {
      res.render('org/profile');
    } else if (currUser.get('group') === 2) {
      alert('entered:' + currUser.get('group'));
      res.render('vol/profile');
    }
  } else {
    res.redirect('/login?redir=profile');
  }
});

//User endpoint
app.use('/', require('cloud/user'));

// Dashboard endpoint
app.use('/dashboard', require('cloud/dashboard'));

//Event endpoint
app.use('/event', require('cloud/event'));

// Attach the Express app to Cloud Code.
app.listen();
