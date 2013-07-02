// Retrieve
var mongo = require('mongodb');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var server = new Server('ds031978.mongolab.com', 31978, {auto_reconnect: true});
//user: "clockwork189", password: "Cal_Charbird3494"
var database = new Db('slotmachine_1', server);
// Native Driver
function openDb () {
	database.open(function(err, db) {
		if(!err) {
			db.authenticate("rooster", "b4ehuSephequ7r", function(err, result) {
				if(err) {
					console.log(err);
				}else {
					console.log("Connected to Slot Machine database");
					// db.collection('tasks', {safe:true}, function(err, collection) {
					// 	if (err) {
					// 		console.log("The tasks collection doesn't exist. Creating it now...");
					// 	}
					// });
				}
			});
		}
	});
}
openDb();
exports.db = database;
