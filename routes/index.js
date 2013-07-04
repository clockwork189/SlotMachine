var cons = require("consolidate");
var GameSettings = require("./../models/GameSettings.js");
/*
 * GET home page.
 */

exports.index = function(req, res){
    GameSettings.findSettings(function(err, game_settings) {
        var usr = undefined;
        if(req.session.user !== undefined) {
            usr = req.session.user[0];
        }
        res.render('index.html', { title: 'Spin To Win', settings: game_settings[0], user: usr });
    });
};
exports.privacy = function(req, res){
    res.render('privacy.html', { title: 'Spin To Win: Privacy Policy' });
};
exports.earnmorespins = function(req, res){
    res.render('earnmorespins.html', { title: 'Spin To Win: Earn More Spins' });
};