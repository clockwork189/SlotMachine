var SPMongo = require("../lib/db");

// var OrganizationSchema = new db.Schema({
//     organization_name: String,
//     organization_owner_email: String,
//     date_created: Date
// });


// Native Driver
exports.findBlockedIPs = function(callback) {
	console.log('Retrieving Blocked IPs: ');
	SPMongo.db.collection('ip_blocklist', function(err, collection) {
		collection.find().toArray(function(err, blocked_ips) {
			if(err) {
				callback(err);
			} else {
				callback(null, blocked_ips);
			}
		});
	});
};

exports.addIP = function(ip, callback) {
	console.log('Adding Game Settings: ', ip);
	SPMongo.db.collection('ip_blocklist', function(err, collection) {
		collection.findOne({'ip_address': ip}, function(err, usr) {
			if(usr) {
				console.log("IP Address already added");
				callback(null, usr);
			} else {
				collection.insert(ip, {safe:true}, function(err, result) {
					if(err) {
						console.log("Error saving ip:", err);
						callback(err);
					} else {
						console.log("Success saving ip:", result);
						callback(null, result);
					}
				});
			}
		});
	});
};


exports.deleteIP = function(id, callback) {
	console.log('Deleting IP Address: ', id);
	SPMongo.db.collection('ip_blocklist', function(err, collection) {
		collection.remove({_id: collection.db.bson_serializer.ObjectID.createFromHexString(id)}, {safe:true}, function(err, result) {
			if(err) {
				callback(err);
			} else {
				callback(null, result);
			}
		});
	});
};