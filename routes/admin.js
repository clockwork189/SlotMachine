var cons = require("consolidate");
var hash = require('./../library/Password').hash;
var md5 = require("MD5");
var Administrators = require("./../models/Administrators.js");
var GameSettings = require("./../models/GameSettings.js");
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
		console.log(game_settings);
		res.render('admin/index.html', { title: 'Spin To Win: Administrator', settings: game_settings[0] });
	});
};

/*
 * POST Authenticate User
 */
exports.auth = function(req, res){
	console.log("Here");
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
	var email = "charles.desouza3000@gmail.com";
	var password = "Charbird3494";
	hash(password, function(err, salt, hash){
		if (err) throw err;
		var newAdmin = {
			email: email,
			salt: salt,
			hash: hash
		};
		Administrators.addAdministrator(newAdmin, function(err, admin) {
			req.session.regenerate(function() {
				req.session.administrator = admin[0];
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
		prizes: {
			"prize_1": req.body.prize_1,
			"prize_2": req.body.prize_2,
			"prize_3": req.body.prize_3,
			"prize_4": req.body.prize_4,
			"prize_5": req.body.prize_5,
			"prize_6": req.body.prize_6,
			"prize_7": req.body.prize_7,
			"prize_8": req.body.prize_8,
			"prize_9": req.body.prize_9,
			"prize_10": req.body.prize_10,
			"prize_11": req.body.prize_11
		},
		max_number_prizes_per_day: req.body.max_prizes_awarded_per_day,
		number_spins_per_user: req.body.num_spins_per_user,
		number_spins_per_share: req.body.num_spins_per_share,
		promotion_end_date: req.body.promo_end_date
	};

	GameSettings.updateSettings(game_settings, function(result) {
		res.redirect('/admin/index');
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

function restrict(req, res, next) {
  if (req.session.administrator) {
	next();
  } else {
	req.session.error = 'Access denied!';
	res.redirect('/admin/login');
  }
}
