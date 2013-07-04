var SPMongo = require("../lib/db");

exports.findByEmail = function(email, callback) {
	console.log('Retrieving user by email: ' + email);
	SPMongo.db.collection('users', function(err, collection) {
		collection.findOne({'email':email}, function(err, user) {
			if(err) {
				callback(err);
			} else {
				callback(null, user);
			}
		});
	});
};
exports.findAll = function(callback) {
	console.log('Retrieving all users');
	SPMongo.db.collection('users', function(err, collection) {
		collection.find().toArray(function(err, users) {
			if(err) {
				callback(err);
			} else {
				callback(null, users);
			}
		});
	});
};

exports.addUser = function(user, callback) {
	console.log('Adding user: ' + JSON.stringify(user));
	SPMongo.db.collection('users', function(err, collection) {
		collection.findOne({'email': user.email}, function(err, usr) {
			if(usr) {
				console.log("User already added");
				callback(null, usr);
			} else {
				collection.insert(user, {safe:true}, function(err, result) {
					if(err) {
						// Error!
						console.log("Error! User Not Added!");
						callback(err);
					} else {
						console.log("User Successfully Added");
						callback(null, result);
					}
				});
			}
		});
	});
};

exports.updateUser = function(user, callback) {
	console.log('Updating user');
	console.log(JSON.stringify(user));
	SPMongo.db.collection('users', function(err, collection) {
		collection.update({'email': user.email}, user, {safe:true}, function(err, result) {
			if(err) {
				callback(err);
			} else {
				callback(null, result);
			}
		});
	});
};

exports.deleteUser = function(email, callback) {
	console.log('Deleting users: ' + email);
	SPMongo.db.collection('users', function(err, collection) {
		collection.remove({'email': email}, {safe:true}, function(err, result) {
			if(err) {
				callback(err);
			} else {
				callback(null, result);
			}
		});
	});
};
