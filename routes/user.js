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
                full_name: req.body.full_name,
                authentication_method: "online",
                token: "",
                tokenSecret: "",
                salt: salt,
                hash: hash,
                numberSpins: settings.number_spins_per_user
            };
            exports.addUser(newUser, function(err, user) {
                req.session.regenerate(function() {
                    req.session.user = user[0];
                    res.redirect('/');
                });
            });
        });
    });
};

/*
 * add user.
 */

exports.add = function(email, fullname, method, token, tokenSecret, salt, hash){
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
        exports.addUser(newUser, function(err, user) {
            req.session.regenerate(function() {
                req.session.user = user[0];
                res.redirect('/');
            });
        });
    });
};