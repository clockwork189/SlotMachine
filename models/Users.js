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
exports.findByUUID = function(uuid, callback) {
	console.log('Retrieving user by uuid: ' + uuid);
	SPMongo.db.collection('users', function(err, collection) {
		collection.findOne({'unique_identifier':uuid}, function(err, user) {
			if(err) {
				callback(err);
			} else {
				callback(null, user);
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
						callback(null, result[0]);
					}
				});
			}
		});
	});
};

exports.updateUser = function(user, callback) {
	console.log('Updating user');
	SPMongo.db.collection('users', function(err, collection) {
		collection.update({'_id': user._id}, user, {safe:true}, function(err, result) {
			if(err) {
				console.log("Error", err);
				callback(err);
			} else {
				collection.findOne({'_id':user._id}, function(err, user) {
					if(err) {
						callback(err);
					} else {
						callback(null, user);
					}
				});
			}
		});
	});
};

exports.updateUserById = function(user, callback) {
	console.log('Updating user');
	SPMongo.db.collection('users', function(err, collection) {
		var id = collection.db.bson_serializer.ObjectID.createFromHexString(user._id);
		delete user._id;
		collection.update({'_id': id}, user, {safe:true}, function(err, result) {
			if(err) {
				console.log("Error", err);
				callback(err);
			} else {
				collection.findOne({'_id': id}, function(err, usr) {
					if(err) {
						callback(err);
					} else {
						callback(null, usr);
					}
				});
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
