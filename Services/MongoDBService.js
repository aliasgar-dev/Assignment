module.exports = function MongoDBService(instance) {
	var self = this,
		mongoClient = require("mongodb").MongoClient,
		mongo = require("mongodb"),
		mongoConnection = null,
		dbName = "";
	function initialise(cb) {
		dbName =  instance.getSharedData("appConfig").dbName;
		getConnectinon(cb);
	}

	function getConnectinon(cb) {
		mongoClient.connect(
			"mongodb://localhost:27017",
			{ useUnifiedTopology: true },
			(err, res) => {
				if (err) {
					console.log("----- error while connecting to db--", err);
					cb(err, null);
					return;
				}
				console.log("-------- db connected-------");
				mongoConnection = res;
				cb(null, mongoConnection);
			}
		);
	}

	function save(collection, data, cb) {
		if (!mongoConnection) {
			getConnectinon(function (err, res) {});
		}
		// console.log('-------save------',data)
		// console.log('-------save--colex----',collection)
		mongoConnection
			.db(dbName)
			.collection(collection)
			.insertOne(data, (err, res) => {
				if (err) {
					cb(err, null);
					return;
				}
				delete res.connection;
				delete res.message;
				cb(null, res);
			});
	}

	function find(collection, query, optionQuery, cb) {
		if (!mongoConnection) {
			getConnectinon(function (err, res) {});
		}
		mongoConnection
			.db(dbName)
			.collection(collection)
			.find(query, { projection: optionQuery })
			.toArray(function (err, res) {
				if (err) {
					cb(err, null);
					return;
				}
				cb(null, res);
			});
	}

	function findOne(collection, query, optionQuery, cb) {
		if (!mongoConnection) {
			getConnectinon(function (err, res) {});
		}
		// console.log('-----dbName-----',dbName)
		// // console.log('-----dbName-----',mongoConnection)
		mongoConnection
			.db(dbName)
			.collection(collection)
			.findOne(query, { projection: optionQuery }, function (err, res) {
				if (err) {
					cb(err, null);
					return;
				}
				cb(null, res);
			});
	}

	function update(collection, query, data, option, cb) {
		if (!mongoConnection) {
			getConnectinon(function (err, res) {});
		}
		mongoConnection
			.db(dbName)
			.collection(collection)
			.update(query, data, option, (err, res) => {
				if (err) {
					cb(err, null);
					return;
				}
				delete res.connection;
				delete res.message;
				cb(null, res);
			});
	}

	function findOneAndUpdate(collection, query, data, option, cb) {
		if (!mongoConnection) {
			getConnectinon(function (err, res) {});
		}
		mongoConnection
			.db(dbName)
			.collection(collection)
			.findOneAndUpdate(query, data, option, (err, res) => {
				if (err) {
					cb(err, null);
					return;
				}
				delete res.connection;
				delete res.message;
				cb(null, res);
			});
	}

	this.initialise = initialise;
	this.save = save;
	this.find = find;
	this.findOne = findOne;
	this.update = update;
	this.findOneAndUpdate = findOneAndUpdate;
};
