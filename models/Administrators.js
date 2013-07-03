var SPMongo = require("../lib/db");

exports.findByEmail = function(email, callback) {
	console.log('Retrieving user by email: ' + email);
	SPMongo.db.collection('administrators', function(err, collection) {
		collection.findOne({'email':email}, function(err, user) {
			if(err) {
				callback(err);
			} else {
				callback(null, user);
			}
		});
	});
};

exports.addAdministrator = function(admin, callback) {
	console.log('Adding admin: ' + JSON.stringify(admin));
	SPMongo.db.collection('administrators', function(err, collection) {
		collection.findOne({'email': admin.email}, function(err, usr) {
			if(usr) {
				console.log("Administrator already added");
				callback(null, usr);
			} else {
				collection.insert(admin, {safe:true}, function(err, result) {
					if(err) {
						// Error!
						console.log("Error! Admin Not Added!");
						callback(err);
					} else {
						console.log("Admin Successfully Added");
						callback(null, result);
					}
				});
			}
		});
	});
};

exports.updateAdministrator = function(id, admin, callback) {
	console.log('Updating admin: ' + id);
	console.log(JSON.stringify(admin));
	SPMongo.db.collection('administrators', function(err, collection) {
		collection.update({'_id':collection.db.bson_serializer.ObjectID.createFromHexString(id)}, admin, {safe:true}, function(err, result) {
			if(err) {
				callback(err);
			} else {
				callback(null, result);
			}
		});
	});
};

exports.deleteAdministrator = function(id, callback) {
	console.log('Deleting administrators: ' + id);
	SPMongo.db.collection('administrators', function(err, collection) {
		collection.remove({'_id':collection.db.bson_serializer.ObjectID.createFromHexString(id)}, {safe:true}, function(err, result) {
			if(err) {
				callback(err);
			} else {
				callback(null, result);
			}
		});
	});
};
