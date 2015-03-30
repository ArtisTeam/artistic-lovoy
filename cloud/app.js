// Initialize Express in Cloud Code
var express = require('express');
var expressLayouts = require('cloud/express-layouts');
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

app.get('/dashboard', function (req, res) {
  res.render('event');
});

//testing entry point
app.get('/ming', function (req, res) {
  if (Parse.User.current()) {
    // We need to fetch because we need to show fields on the user object.
    Parse.User.current().fetch().then(function (user) {
      res.send('Cool, you are logged in as : ' + user.get('username'));
    },
    function (error) {
      res.send('fetch user error');
    });
  } else {
    res.redirect('/login');
  }
});

//User endpoint
app.use('/', require('cloud/user'));

//Event endpoint
app.use('/event', require('cloud/event'));

// Attach the Express app to Cloud Code.
app.listen();
