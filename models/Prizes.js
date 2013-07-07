var SPMongo = require("../lib/db");

exports.findAll = function(callback) {
	console.log('Retrieving all prize');
	SPMongo.db.collection('prizes', function(err, collection) {
		collection.find().toArray(function(err, prizes) {
			if(err) {
				callback(err);
			} else {
				callback(null, prizes);
			}
		});
	});
};

exports.findPrize = function(id, callback) {
	console.log('Retrieving prize: ', id);
	SPMongo.db.collection('prizes', function(err, collection) {
		collection.findOne({_id: collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(err, prize) {
			if(err) {
				callback(err);
			} else {
				callback(null, prize);
			}
		});
	});
};

exports.addPrize = function(prize, callback) {
	console.log('Adding Prize: ', prize);
	SPMongo.db.collection('prizes', function(err, collection) {
		collection.insert(prize, {safe:true}, function(err, result) {
			if(err) {
				console.log("Error saving prize:", err);
				callback(err);
			} else {
				console.log("Success saving prize:", result);
				callback(null, result);
			}
		});
	});
};


exports.updatePrize = function(prize, callback) {
	console.log('Updating Prizes: ', prize);
	SPMongo.db.collection('prizes', function(err, collection) {
		collection.findOne({_id: collection.db.bson_serializer.ObjectID.createFromHexString(prize.id)}, function(err, old_prize) {
			if(err) {
				callback(err);
			} else {
				collection.update({'_id': old_prize._id}, prize, {safe:true}, function(err, result) {
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


exports.deletePrize = function(id, callback) {
	console.log('Deleting Prize: ', id);
	SPMongo.db.collection('prizes', function(err, collection) {
		collection.remove({_id: collection.db.bson_serializer.ObjectID.createFromHexString(id)}, {safe:true}, function(err, result) {
			if(err) {
				callback(err);
			} else {
				callback(null, result);
			}
		});
	});
};