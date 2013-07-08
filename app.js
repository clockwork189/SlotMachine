
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    admin = require('./routes/admin'),
    setup = require('./routes/setup'),
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
    IPBlocklist = require("./models/IPBlocklist.js"),
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
//   the user by ID when deserializing.  
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  user.find({email: obj.email} ,function(err, user){
    done(err, user);
  });
});

passport.use(new FacebookStrategy({
    clientID: "376845965748399",
    clientSecret: "36b3561ebfd0eba7935baba8f7e537ec",
    callbackURL: "http://localhost:3000/auth/facebook/callback", // Change this when LIVE
    profileFields: ['id','displayName', 'emails', 'photos'],
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    var fullName = profile._json.name;
    var email = profile._json.email;
    var pictureURL = profile._json.picture.data.url;
    var referralId = req.session.referral || "";
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // console.log(profile);
      user.add(email, fullName, "facebook", accessToken, refreshToken, pictureURL, referralId, function (err, user) {
        if (err) { return done(err); }
        done(null, user);
      });
    });
  }
));
passport.use(new TwitterStrategy({
    consumerKey: "8dJ4QhxjhvHXdVaMstYMsw",
    consumerSecret: "ImEGNtrrbCwkxZJhnoyok9bJ398ZvMleov5cEWobN8",
    callbackURL: "/auth/twitter/callback",
    passReqToCallback: true
  },
  function(req, token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      console.log(profile);
      var fullName = profile._json.name;
      var newUser = {
          email: "",
          full_name: fullName,
          pictureURL: profile._json.profile_image_url_https,
          token: token,
          tokenSecret: tokenSecret
      };
      req.session.user = newUser;
      done(null, newUser);
    });
  }
));
passport.use(new GoogleStrategy({
    clientID: "206420410955.apps.googleusercontent.com",
    clientSecret: "6kwVKkodeGjw6bpeeJxRJhYs",
    callbackURL: "/auth/google/callback",
    passReqToCallback: true
  },
  function(req, token, tokenSecret, profile, done) {
    var fullName = profile._json.name;
    var username = profile._json.email;
    var email = profile._json.email;
    var pictureURL =  profile._json.picture;
    var referralId = req.session.referral || "";
    process.nextTick(function () {
      user.add(email, fullName, "google", token, tokenSecret, pictureURL, referralId, function (err, user) {
        if (err) { return done(err); }
        done(null, user);
      });
    });
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
  app.use(express.session({ store: new mongoStore({url: 'mongodb://rooster:b4ehuSephequ7r@ds031978.mongolab.com:31978/slotmachine_1/sessions'}), secret: 'topsecret' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', getClientIp, routes.index);
app.get('/referral/:referralid', getClientIp, routes.addReferral); // Change this to the appropriate route
app.get('/privacy', getClientIp, routes.privacy);
app.get('/earnmorespins', getClientIp, routes.earnmorespins);
app.get('/getemail', getClientIp, routes.getemail);
app.get('/user/blockedip', getClientIp, routes.blockIP);
//Admin
app.get('/admin/login', admin.login);
app.get('/admin/index', restrict, admin.index);
app.get('/admin/add', admin.add);
app.get('/admin/view/users', restrict, admin.viewUsers);
app.get('/admin/view/winners', restrict, admin.viewWinners);
app.get('/admin/view/prizes', restrict, admin.viewPrizes);
app.get('/admin/blockip', restrict, admin.blockip);
app.get('/admin/blocklist/delete/:id',restrict, admin.deleteip);
app.get('/admin/settings', restrict, admin.settings);
app.get('/admin/setup', restrict, setup.setup);
app.get('/admin/prizes/edit/:id',restrict, admin.editPrizes);
app.get('/admin/prizes/delete/:id',restrict, admin.deletePrize);
app.post('/admin/add/blockedip', restrict, admin.addBlockedIP);

app.post('/admin/prizes/edit/:id',restrict, admin.updatePrizes);
app.post('/admin/create/prize', admin.addPrize);
app.post('/invite/email', user.inviteEmails);
app.post('/twitter/email', user.addTwitterEmail);
app.post('/post/add/winner', user.addWinner);
app.post('/post/update/player', user.updatePlayer);
app.post('/post/game/params', user.getGameParams);
app.post('/add/new/user', user.create);
app.post('/login/user', getClientIp, user.login);
app.post('/admin/auth', admin.auth);
app.post('/admin/update/prizes/available', admin.update_available_prizes);

app.get('/logout', function(req, res){
  req.logout();
  req.session.user = undefined;
  res.redirect('/');
});
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    req.session.user= req.user;
    res.render('authcallback.html', { title: 'Spin To Win: Authentication Success'});
  });


app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', {scope: "email", failureRedirect: '/' }),
  function(req, res) {
    req.session.user = req.user;
    res.render('twitterauthcallback.html', { title: 'Spin To Win: Authentication Success'});
  });

app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    req.session.user = req.user;
    res.render('authcallback.html', { title: 'Spin To Win: Authentication Success'});
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
  res.redirect('/');
}

function restrict(req, res, next) {
  if (req.session.administrator) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/admin/login');
  }
}
function getClientIp(req, res, next) {
  var ipAddress;
  // Amazon EC2 / Heroku workaround to get real client IP
  var forwardedIpsStr = req.header('x-forwarded-for');
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // Ensure getting client IP address still works in
    // development environment
    ipAddress = req.connection.remoteAddress;
  }
  console.log(ipAddress);
  IPBlocklist.findIP(ipAddress, function(err, ip) {
    if(ip) {
      res.redirect("/user/blockedip");
    } else {
      next();
    }
  });
  //return ipAddress;
}