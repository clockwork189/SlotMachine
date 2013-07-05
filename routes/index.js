var cons = require("consolidate");
var GameSettings = require("./../models/GameSettings.js");
var googleapis = require('googleapis');
/*
 * GET home page.
 */

exports.index = function(req, res){
    GameSettings.findSettings(function(err, game_settings) {
        var usr = undefined;
        if(req.session.user !== undefined) {
            usr = req.session.user[0];
        }
        res.render('index.html', { title: 'Spin To Win', settings: game_settings[0], user: usr, showAskEmail: false });
    });
};
exports.privacy = function(req, res){
    res.render('privacy.html', { title: 'Spin To Win: Privacy Policy' });
};
exports.earnmorespins = function(req, res){
	GameSettings.findSettings(function(err, game_settings) {
        var usr;
        if(req.session.user !== undefined) {
            usr = req.session.user[0];
            googleapis.discover('urlshortener', 'v1').execute(function(err, client) {
                var API_KEY = "AIzaSyAHjmx_CbOWcybqrntv2mzn_mPuPSEqHDI";
                client.urlshortener.url.insert(null, { longUrl: 'http://localhost:3000/referral/' + usr.unique_identifier }).withApiKey(API_KEY).execute(function(err, result) {
                    res.render('earnmorespins.html', { title: 'Spin To Win: Earn More Spins', user: usr, settings: game_settings[0], shortenedURL: result.id });
                  });
             });
        } else {
            res.redirect("/");
        }
    });
};
exports.getemail = function (req, res) {
    GameSettings.findSettings(function(err, game_settings) {
        res.render('index.html', { title: 'Spin To Win', settings: game_settings[0], user: req.session.user, showAskEmail: true });
    });
};