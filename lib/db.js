// Retrieve
var mongo = require('mongodb');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;
var host = 'ds031978.mongolab.com';
var port = 31978;
var user = "rooster";
var password = "b4ehuSephequ7r";

var server = new Server(host, port, {auto_reconnect: true});
var database = new Db('slotmachine_1', server);
// Native Driver
function openDb () {
	database.open(function(err, db) {
		if(!err) {
			db.authenticate(user, password, function(err, result) {
				if(err) {
					console.log(err);
				}else {
					console.log("Connected to Slot Machine database");
					db.collection('administrators', {safe:true}, function(err, collection) {
						if (err) {
							console.log("The administrators collection doesn't exist. Creating it now...");
						}
						db.collection('users', {safe:true}, function(err, collection) {
							if (err) {
								console.log("The users collection doesn't exist. Creating it now...");
							}
							db.collection('game_settings', {safe:true}, function(err, collection) {
								if (err) {
									console.log("The game_settings collection doesn't exist. Creating it now...");
								}
								db.collection('ip_blocklist', {safe:true}, function(err, collection) {
									if (err) {
										console.log("The ip_blocklist collection doesn't exist. Creating it now...");
									}
									db.collection('winners', {safe:true}, function(err, collection) {
										if (err) {
											console.log("The winners collection doesn't exist. Creating it now...");
										}
									});
								});
							});
						});
					});
				}
			});
		}
	});
}
openDb();
exports.db = database;
