
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    swig = require('swig'),
    cons = require("consolidate"),
    mongoStore = require('connect-mongo')(express),
    db = require("./lib/db"),
    socket = require('socket.io'),
    fs = require('fs'),
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
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
