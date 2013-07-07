var cons = require("consolidate");
var hash = require('./../library/Password').hash;
var md5 = require("MD5");
var Administrators = require("./../models/Administrators.js");
var Prizes = require("./../models/Prizes.js");
var GameSettings = require("./../models/GameSettings.js");
var IPBlocklist = require("./../models/IPBlocklist.js");
var Users = require("./../models/Users.js");
var Winners = require("./../models/Winners.js");
var Filepicker = require('filepicker');
var filepicker = new Filepicker('AGSGfwtfxTcms1R4gVNzEz');
/*
 * GET home page.
 */
exports.login = function(req, res){
	if(req.session.administrator) {
		res.redirect('/admin/index');
	} else {
		res.render('login.html', { title: 'Spin To Win' });
	}
};

/*
 * GET Admin Dashboard
 */
exports.index = function(req, res){
	GameSettings.findSettings(function(err, game_settings) {
		res.render('admin/index.html', { title: 'Spin To Win: Administrator', settings: game_settings[0] });
	});
};

/*
 * GET Admin Users
 */
exports.viewUsers = function(req, res){
	Users.findAll(function(err, users) {
		console.log(users);
		res.render('admin/users.html', { title: 'Spin To Win: Administrator', users: users });
	});
};

/*
 * GET Winners
 */
exports.viewWinners = function(req, res){
	Winners.findAll(function(err, winners) {
		res.render('admin/winners.html', { title: 'Spin To Win: Administrator', winners: winners });
	});
};

/*
 * GET Prizes Awarded
 */
exports.viewPrizes = function(req, res){
	Prizes.findAll(function(err, prizes) {
		res.render('admin/prizes.html', { title: 'Spin To Win: Administrator', prizes: prizes });
	});
};

/*
 * GET Edit Prizes
 */
exports.editPrizes = function(req, res){
	Prizes.findPrize(req.params.id, function(err, prize) {
		res.render('admin/edit_prize.html', { title: 'Spin To Win: Administrator', prize: prize });
	});
};

exports.updatePrizes = function (req, res) {
	var updatedPrize = {
		id: req.body.prize_id,
		name: req.body.prize_name,
		number_available: req.body.number_prizes_available,
		image_url: req.body.img_url
	};
	Prizes.updatePrize(updatedPrize, function(err, result) {
		res.redirect('/admin/view/prizes');
	});
};
/*
 * GET Delete Prize
 */
exports.deletePrize = function(req, res){
	Prizes.deletePrize(req.params.id, function(err, prizes) {
		res.redirect('admin/view/prizes');
	});
};
/*
 * GET Settings
 */
exports.settings = function(req, res){
	GameSettings.findSettings(function(err, game_settings) {
		res.render('admin/settings.html', { title: 'Spin To Win: Administrator', settings: game_settings[0] });
	});
};

/*
 * POST Add an IP to be blocked
 */
exports.addBlockedIP = function (req,res) {
	var newIp = {
		ip_address: req.body.ip_address
	};
	IPBlocklist.addIP(newIp, function(err, result) {
		res.redirect('/admin/blockip');
	});
};

/*
 * GET Admin Dashboard
 */
exports.blockip = function(req, res){
	IPBlocklist.findBlockedIPs(function(err, result){
		res.render('admin/blockip.html', { title: 'Spin To Win: Administrator', blockedIPs: result});
	});
};

exports.deleteip = function(req, res) {
	IPBlocklist.deleteIP(req.params.id, function(err, result){
		res.redirect('/admin/blockip');
	});
};

/*
 * POST Authenticate User
 */
exports.addPrize = function (req, res) {
	var newPrize = {
		name: req.body.prize_name,
		number_available: req.body.number_prizes_available,
		image_url: req.body.img_url,
		date_created: new Date()
	};
	Prizes.addPrize(newPrize, function(err, result) {
		res.redirect('/admin/view/prizes');
	});
};
/*
 * POST Authenticate User
 */
exports.auth = function(req, res){
	authenticate(req.body.email, req.body.password, function(err, administrator){
		console.log("Valid Admin");
		if (administrator) {
			req.session.regenerate(function() {
				req.session.administrator = administrator;
				res.redirect('/admin/index');
			});
		} else {
			req.session.error = 'Authentication failed, please check your username and password.';
			res.redirect('/admin/login');
		}
	});
};
/*
 * POST Add Admin
 */
exports.add = function (req, res) {
	var email = "administrator";
	var password = "SpinToWin";
	hash(password, function(err, salt, hash){
		if (err) throw err;
		var newAdmin = {
			email: email,
			salt: salt,
			hash: hash
		};
		Administrators.addAdministrator(newAdmin, function(err, admin) {
			req.session.regenerate(function() {
				req.session.administrator = admin;
				res.redirect('admin/index');
			});
		});
	});
};
/*
 * POST Update Available Prizes
 */
exports.update_available_prizes = function (req, res) {
	var game_settings = {
		max_number_prizes_per_day: req.body.max_prizes_awarded_per_day,
		number_spins_per_user: req.body.num_spins_per_user,
		number_spins_per_share: req.body.num_spins_per_share,
		number_spins_per_like: req.body.num_spins_like,
		promotion_end_date: req.body.promo_end_date,
		number_spins_per_invite: req.body.number_spins_per_invite,
		tweeting_text: req.body.tweeting_text,
		twitter_direct_message_text: req.body.twitter_direct_message_text,
		facebook_invite_text: req.body.facebook_invite_text,
		facebook_sharing_text: req.body.facebook_sharing_text,
		googleplus_invite_text: req.body.googleplus_invite_text,
		googleplus_sharing_text: req.body.googleplus_sharing_text,
		number_direct_tweets_per_user: req.body.number_direct_tweets_per_user,
		email_text: req.body.email_text
	};

	GameSettings.updateSettings(game_settings, function(result) {
		res.redirect('/admin/settings');
	});
};

function authenticate(email, pass, fn) {
	if (!module.parent) console.log('authenticating %s:%s', email, pass);
	Administrators.findByEmail(email, function(err, administrator) {
		if (!administrator) return fn(new Error('cannot find administrator'));
		hash(pass, administrator.salt, function(err, hash) {
			if (err) return fn(err);
			if (hash == administrator.hash) return fn(null, administrator);
			fn(new Error('invalid password'));
		});
	});
}