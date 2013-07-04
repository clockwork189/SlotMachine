var cons = require("consolidate");
var hash = require('./../library/Password').hash;
var md5 = require("MD5");
var Users = require("./../models/Users.js");
var GameSettings = require("./../models/GameSettings.js");
/*
    Authentication Methods:
    Facebook,
    Google,
    Twitter,
    Online
*/

/*
 *  Create new User
 */
exports.create = function(req, res){
    GameSettings.findSettings(function(err, game_settings) {
        var settings = game_settings[0];
        var password = req.body.password;
        hash(password, function(err, salt, hash){
            if (err) throw err;
            var newUser = {
                username: req.body.username,
                email: req.body.email,
                full_name: req.body.fullname,
                authentication_method: "online",
                token: "",
                tokenSecret: "",
                salt: salt,
                hash: hash,
                numberSpins: settings.number_spins_per_user
            };
            Users.addUser(newUser, function(err, user) {
                console.log("I will add the user to the session", user);
                req.session.user = user;
                res.redirect('/');
            });
        });
    });
};

/*
 * add user.
 */

exports.add = function(email, fullname, method, token, tokenSecret, salt, hash, callback){
    GameSettings.findSettings(function(err, game_settings) {
        var settings = game_settings[0];
        var newUser = {
            username: email,
            email: email,
            full_name: fullname,
            authentication_method: method,
            token: token,
            tokenSecret: tokenSecret,
            salt: "",
            hash: "",
            numberSpins: settings.number_spins_per_user
        };
        Users.addUser(newUser, function(err, user) {
            callback(err, user);
        });
    });
};

/*
 *  Find User By Email
 */
exports.find = function(email, callback) {
    Users.findByEmail(email, function(err, user) {
        if(err) {
            callback(err);
        } else {
            callback(null, err);
        }
    });
};
/*
 *  Login User
 */
exports.login = function(req, res){
    authenticate(req.body.email, req.body.password, function(err, user){
        console.log("Valid User");
        if (user) {
            console.log("Legit User: ", user);
            var arr = [];
            arr.push(user);
            req.session.user = arr;
            res.redirect('/');
        } else {
            req.session.error = 'Authentication failed, please check your username and password.';
            res.redirect('/');
        }
    });
};
exports.getGameParams = function(req, res) {
    GameSettings.findSettings(function(err, game_settings) {
        var usr = undefined;
        if(req.session.user !== undefined) {
            usr = req.session.user[0];
        }
        res.json({ settings: game_settings[0], user: usr });
    });
};

function authenticate(email, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', email, pass);
        Users.findByEmail(email, function(err, user) {
        if (!user) return fn(new Error('cannot find user'));
        hash(pass, user.salt, function(err, hash) {
            if (err) return fn(err);
            if (hash == user.hash) return fn(null, user);
            fn(new Error('invalid password'));
        });
    });
}

function restrict(req, res, next) {
  if (req.session.administrator) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/admin/login');
  }
}
