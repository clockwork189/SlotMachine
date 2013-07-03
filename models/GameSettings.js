var SPMongo = require("../lib/db");

// var OrganizationSchema = new db.Schema({
//     organization_name: String,
//     organization_owner_email: String,
//     date_created: Date
// });


// Native Driver
exports.findSettings = function(callback) {
	console.log('Retrieving Game Settings: ');
	SPMongo.db.collection('game_settings', function(err, collection) {
		collection.find().toArray(function(err, settings) {
			if(err) {
				callback(err);
			} else {
				callback(null, settings);
			}
		});
	});
};

exports.addSettings = function(settings, callback) {
	console.log('Adding Game Settings: ', settings);
	SPMongo.db.collection('game_settings', function(err, collection) {
		collection.insert(settings, {safe:true}, function(err, result) {
			if(err) {
				console.log("Error saving settings:", err);
				callback(err);
			} else {
				console.log("Success saving settings:", result);
				callback(null, result);
			}
		});
	});
};


exports.updateSettings = function(settings, callback) {
	console.log('Updating Game Settings: ', settings);
	SPMongo.db.collection('game_settings', function(err, collection) {
		collection.find().toArray(function(err, old_settings) {
			if(err) {
				callback(err);
			} else {
				collection.update({'_id': old_settings[0]._id}, settings, {safe:true}, function(err, result) {
					if(err) {
						callback(err);
					} else {
						callback(null, result);
					}
				});
			}
		});
	});
};