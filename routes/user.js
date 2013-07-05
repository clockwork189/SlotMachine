var cons = require("consolidate");
var hash = require('./../library/Password').hash;
var md5 = require("MD5");
var Users = require("./../models/Users.js");
var GameSettings = require("./../models/GameSettings.js");
var Winners = require("./../models/Winners.js");
var fb = require('facebook-js');
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
            var method = "email";
            var networksConnected = {};
            networksConnected[method] = {};
            networksConnected[method].token = salt || "";
            networksConnected[method].tokenSecret = hash || "";
            var newUser = {
                email: req.body.email,
                unique_identifier: uuid(),
                full_name: req.body.fullname,
                networks: networksConnected,
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
exports.addTwitterEmail = function (req, res) {
    var email = req.body.email;
    var method = "twitter";
    var usr = req.session.user;
    usr.email = email;
    Users.findByEmail(email, function(err, user) {
        if(user) {
            user.networks = user.networks || {};
            user.networks[method] = user.networks[method] || {};
            user.networks[method].token = usr.token || "";
            user.networks[method].tokenSecret = usr.tokenSecret || "";
            Users.updateUser(user, function(err, usr) {
                req.session.user = [];
                req.session.user[0] = usr;
                res.redirect("/");
            });
        } else {
            GameSettings.findSettings(function(err, game_settings) {
                var networksConnected = {};
                networksConnected[method] = {};
                networksConnected[method].token = usr.token || "";
                networksConnected[method].tokenSecret = usr.tokenSecret || "";

                var newUser = {
                    email: email,
                    full_name: usr.full_name,
                    networks: networksConnected,
                    unique_identifier: uuid(),
                    numberSpins: game_settings[0].number_spins_per_user
                };
                Users.addUser(newUser, function(err, user) {
                    req.session.user = user;
                    res.redirect("/");
                });
            });
        }
    });
};

function checkFacebookLikes(accessToken, callback) {
    var pageId = "206419528643";
    var url = '/me/likes/' + pageId;
    fb.apiCall('GET', url, {access_token: accessToken},
        function (error, response, body) {
            // Page Id = 206419528643
            callback(body.data);
        }
    );
}

/*
 * add user.
 */

exports.add = function(email, fullname, method, token, tokenSecret, callback){
    var likesPage = false;
    if(method === "facebook") {
        checkFacebookLikes(token, function(pageInfo) {
            if(pageInfo.length > 0) {
                likesPage = true;
            }
            saveSettings();
        });
    } else {
        saveSettings();
    }
    var saveSettings = function () {
        GameSettings.findSettings(function(err, game_settings) {
            Users.findByEmail(email, function(err, user) {
                var settings = game_settings[0];
                if(user) {
                    user.networks = user.networks || {};
                    user.networks[method] = user.networks[method] || {};
                    user.networks[method].token = token || "";
                    user.networks[method].tokenSecret = tokenSecret || "";
                    user.awardedForLike = likesPage;
                    if(likesPage) {
                        user.numberSpins = user.numberSpins + parseInt(settings.number_spins_per_like, 10);
                    }
                    Users.updateUser(user, function(err, usr) {
                        callback(err, usr);
                    });
                } else {
                    var networksConnected = {};
                    networksConnected[method] = {};
                    networksConnected[method].token = token || "";
                    networksConnected[method].tokenSecret = tokenSecret || "";

                    var newUser = {
                        email: email,
                        full_name: fullname,
                        networks: networksConnected,
                        has_liked_page: likesPage,
                        unique_identifier: uuid(),
                        numberSpins: settings.number_spins_per_user
                    };
                    if(likesPage) {
                        newUser.numberSpins = newUser.numberSpins + parseInt(settings.number_spins_per_like, 10);
                    }
                    Users.addUser(newUser, function(err, user) {
                        callback(err, user);
                    });
                }
            });
        });
    };
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
        console.log("Valid User", user);
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
        var usr;
        if(req.session.user !== undefined) {
            usr = req.session.user[0];
        }
        res.json({ settings: game_settings[0], user: usr });
    });
};
exports.updatePlayer = function(req, res) {
    var user = req.body;
    Users.updateUser(user, function(err, result) {
        req.session.user = result;
        res.json({success: "true"});
    });
};
exports.addWinner = function(req, res) {
    var user = req.body.usr;
    var prize = req.body.prize;
    var winnerObj = {
        user: user,
        prize: "tile_" + prize,
        prize_id: prize
    };
    Winners.addWinner(winnerObj, function(err, result) {
        console.log(result);
        res.json({success: "true"});
    });
};
function authenticate(email, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', email, pass);
    Users.findByEmail(email, function(err, user) {
        if (!user) return fn(new Error('cannot find user'));
        hash(pass, user.networks.email.token, function(err, hash) {
            if (err) return fn(err);
            if (hash == user.networks.email.tokenSecret) return fn(null, user);
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

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
}

function uuid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}