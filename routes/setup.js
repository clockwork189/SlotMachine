exports.setup = function (req, res) {
	var game_settings = {
		prizes: {
			"prize_1": 0,
			"prize_2": 0,
			"prize_3": 0,
			"prize_4": 0,
			"prize_5": 0,
			"prize_6": 0,
			"prize_7": 0,
			"prize_8": 0,
			"prize_9": 0,
			"prize_10": 0,
			"prize_11": 0
		},
		max_number_prizes_per_day: 0,
		number_spins_per_user: 0,
		number_spins_per_share: 0,
		promotion_end_date: new Date()
	};

	//Set up Admins

	GameSettings.addSettings(game_settings, function(result) {
		res.redirect('/admin/index');
	});
};