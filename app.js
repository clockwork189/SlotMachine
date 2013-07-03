
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    admin = require('./routes/admin'),
    http = require('http'),
    swig = require('swig'),
    cons = require("consolidate"),
    mongoStore = require('connect-mongo')(express),
    db = require("./lib/db"),
    socket = require('socket.io'),
    fs = require('fs'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    path = require('path');

var app = express();
var server = http.createServer(app);
var io = socket.listen(server, { log: false});

app.configure('development', function() {
  app.set('db-name', "slotmachine_1");
  app.use(express.errorHandler({ dumpExceptions: true }));
  app.set('view options', {
  pretty: true
  });
});

app.configure('production', function() {
  app.set('db-name', "slotmachine_1");
});

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
    clientID: "376845965748399",
    clientSecret: "36b3561ebfd0eba7935baba8f7e537ec",
    callbackURL: "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("THis is the users facebook profile: ", profile);
    // User.findOrCreate(..., function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });
  }
));
passport.use(new TwitterStrategy({
    consumerKey: "8dJ4QhxjhvHXdVaMstYMsw",
    consumerSecret: "ImEGNtrrbCwkxZJhnoyok9bJ398ZvMleov5cEWobN8",
    callbackURL: "/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    console.log("This is the users twitter profile: ", profile);
    // User.findOrCreate(..., function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });
  }
));
passport.use(new GoogleStrategy({
    clientID: "206420410955.apps.googleusercontent.com",
    clientSecret: "6kwVKkodeGjw6bpeeJxRJhYs",
    callbackURL: "/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
    console.log("This is the users gplus profile: ", profile);
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return done(err, user);
    // });
  }
));
// This helps it know where to look for includes and parent templates
swig.init({
    root: __dirname + '/views',
    cache: false,
    filters: {
    jsonify: function (input) { return JSON.stringify(input); }
  },
    allowErrors: true // allows errors to be thrown and caught by express instead of suppressed by Swig
});

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.engine('html', cons.swig);
  app.set('view engine', 'html');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  // app.use(express.session({ store: new mongoStore({db: app.set('db-name')}), secret: 'topsecret' }));
  app.use(express.session({ store: new mongoStore({url: 'mongodb://rooster:b4ehuSephequ7r@ds031978.mongolab.com:31978/slotmachine_1/sessions'}), secret: 'topsecret' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/privacy', routes.privacy);
app.get('/earnmorespins', routes.earnmorespins);
app.get('/admin/login', admin.login);
app.get('/admin/index', admin.index);
app.get('/admin/add', admin.add);
app.post('/admin/auth', admin.auth);
app.post('/admin/update/prizes/available', admin.update_available_prizes);

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback',  passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/' }));


// GET /auth/twitter
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Twitter authentication will involve redirecting
//   the user to twitter.com.  After authorization, the Twitter will redirect
//   the user back to this application at /auth/twitter/callback
app.get('/auth/twitter', passport.authenticate('twitter'),
  function(req, res){
    // The request will be redirected to Twitter for authentication, so this
    // function will not be called.
  });

// GET /auth/twitter/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email'] }),
  function(req, res){
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
  });

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}