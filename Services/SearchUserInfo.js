module.exports = function SearchUserInfo(instance) {
	
	var self = this,
	mongoService = null,
	mongodb = require("mongodb"),
	async = require("async");

	function initialise(cb) {
		getMongoService();

		function getMongoService() {
			instance.getService("MongoDBService", (err, mongo) => {
				if (err) {
					console.log("----error while getting mongo service in SearchUserInfo--",err);
					cb(err, null);
					return;
				}
				mongoService = mongo;
				cb(null, true);
			});
		}
	}

	function searchUserInfo(data, cb) {
		if (data && data.text === "") {
			cb({ reason: "please enter user name to search" }, null);
			return;
		}
		var text = data.text;
		var query = { firstName: { $regex: text, $options: "si" } };
		mongoService.find("User", query, {}, (err, users) => {
			if (err) {
				console.log("----eoror while getting user---", err);
				cb(err, null);
				return;
			}
			if(users && users.length>0){
				getOtherInfo(users);
			}
			else{
				cb(null,[]);
				return;
			}
		});

		function getOtherInfo(users) {
			var allInfo = [];
			async.mapSeries(users,function (eachUser, done) {
				
				var policyInfo = {};
				var q = { userId: eachUser._id.toString() };
				mongoService.findOne("Policy", q, {}, (err, policyData) => {
					if (err) {
						console.log("-----error while getting policy info--", err);
						done(err, null);
						return;
					}
					policyInfo 			= policyData;
					policyInfo.userName = eachUser.firstName;
					policyInfo.email = eachUser.email;
					var policyCategoryId = policyData.policyCategoryId;
					var catId = {_id: mongodb.ObjectID.createFromHexString(policyCategoryId)};
					mongoService.findOne("LOB", catId, {}, (err, categoryObj) => {
						if (err) {
							console.log("-----error while getting catObj--", err);
							done(err, null);
							return;
						}
						policyInfo.category_name = categoryObj.category_name;
						var carrierId = {_id: mongodb.ObjectID.createFromHexString(policyInfo.policyCarrierId)
						};
						mongoService.findOne("Carrier", carrierId, {},(err,carrierInfo)=> {
							if (err) {
								console.log("----error while getting Carrier--", err);
								done(err, null);
								return;
							}
							policyInfo.companyName = carrierInfo.company_name;
							allInfo.push(policyInfo);
							done(null, true);
						});
					});
				});
				},function (err, res) {
					if (err) {
						cb(err, null);
						return;
					}
					// console.log("--final---", allInfo);
					cb(null, allInfo);
				}
			);
		}
	}

	this.initialise = initialise;
	this.searchUserInfo = searchUserInfo;
};
