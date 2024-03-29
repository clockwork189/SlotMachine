var cons = require("consolidate");
var GameSettings = require("./../models/GameSettings.js");
var Winners = require("./../models/Winners.js");
var Prizes = require("./../models/Prizes.js");
var googleapis = require('googleapis');
/*
 * GET home page.
 */

exports.index = function(req, res){
    GameSettings.findSettings(function(err, game_settings) {
        Prizes.findAll(function(err, prizes) {
            Winners.findAll(function(err, winners) {
                var usr;
                console.log(req.session.user);
                if(req.session.user) {
                    usr = req.session.user;
                }
                res.render('index.html', { title: 'Spin To Win', settings: game_settings[0], user: usr, prizes: prizes, showAskEmail: false, winners: winners });
            });
        });
    });
};
exports.privacy = function(req, res){
    res.render('privacy.html', { title: 'Spin To Win: Privacy Policy' });
};
exports.earnmorespins = function(req, res){
	GameSettings.findSettings(function(err, game_settings) {
        var usr;
        if(req.session.user !== undefined) {
            usr = req.session.user;
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
exports.addReferral = function (req, res) {
    var referrer = req.params.referralid;
    req.session.referral = referrer;
    res.redirect("/");
};

exports.blockIP = function (req,res) {
    res.render('blockedip.html', { title: 'Spin To Win'});
};
exports.modal_signup = function (req, res) {
    res.render('modal_signup.html', { title: 'Spin To Win'});
};
exports.modal_signin = function (req, res) {
    res.render('modal_login.html', { title: 'Spin To Win'});
};
exports.modal_get_more_spins = function (req, res) {
    res.render('modal_get_more_spins.html', { title: 'Spin To Win'});
};

