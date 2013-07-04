var SPMongo = require("../lib/db");

exports.findByEmail = function(email, callback) {
	console.log('Retrieving user by email: ' + email);
	SPMongo.db.collection('winners', function(err, collection) {
		collection.findOne({'user.email':email}, function(err, user) {
			if(err) {
				callback(err);
			} else {
				callback(null, user);
			}
		});
	});
};
exports.findAll = function(callback) {
	console.log('Retrieving all winners');
	SPMongo.db.collection('winners', function(err, collection) {
		collection.find().toArray(function(err, winners) {
			if(err) {
				callback(err);
			} else {
				callback(null, winners);
			}
		});
	});
};

exports.addWinner = function(winner, callback) {
	console.log('Adding winner: ' + JSON.stringify(winner));
	SPMongo.db.collection('winners', function(err, collection) {
		collection.insert(winner, {safe:true}, function(err, result) {
			if(err) {
				// Error!
				console.log("Error! User Not Added!");
				callback(err);
			} else {
				console.log("Winner Successfully Added");
				callback(null, result);
			}
		});
	});
};

exports.deleteUser = function(email, callback) {
	console.log('Deleting users: ' + email);
	SPMongo.db.collection('winners', function(err, collection) {
		collection.remove({'user.email': email}, {safe:true}, function(err, result) {
			if(err) {
				callback(err);
			} else {
				callback(null, result);
			}
		});
	});
};
