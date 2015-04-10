// Initialize Express in Cloud Code
var express = require('express');
var expressLayouts = require('cloud/lib/express-layouts');
// var jQuery = require('cloud/lib/jquery-1.11.2.min.js');
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

// profile endpoint
app.use('/profile', require('cloud/profile'));

// user endpoint
app.use('/', require('cloud/user'));

// qrcode test endpoint
app.use('/qrcode', function (req, res) {
  res.render('qrcode');
});

// dashboard endpoint
app.use('/dashboard', require('cloud/dashboard'));

// event endpoint
app.use('/event', require('cloud/event'));

// attach the Express app to Cloud Code.
app.listen();
