module.exports = function AggregatePolicy(instance){

	var mongodb = require('mongodb'),
		mongoService = null,
		async = require('async')
		;


	function initialise(cb){

		getMongoService();

		function getMongoService(){
			instance.getService("MongoDBService",function(err,monogo){
				if(err){
					console.log('---------error while getting mongoService in AggregatePolicy---',err);
					cb(err,null);
					return;
				}
				mongoService = monogo;
				cb(null,true);
			});
		}
	}

	function getAggregatePolicies(data,cb){
		console.log('----gaa---',data)
		var allPolicyInfo = {}
		var userNames = data.userArr;
		if(userNames && userNames.length == 0){
			cb({reason:"please add userNames to aggregate"},allPolicyInfo);
			return;
		}
		async.mapSeries(userNames,getPolicyforEachUser,function(err,res){
			if(err){
				console.log('-----error while getting policies----',err);
				cb(err,null);
				return;
			}
			cb(null,allPolicyInfo);
		});

		function getPolicyforEachUser(userName,done){
			var query = {"firstName":userName};
			mongoService.findOne("User",query,{},function(err,userInfo){
				if(err){
					console.log('-----error while getting userInfo---',err);
					done(err,null);
					return;
				}
				if(userInfo){
					var userId = userInfo._id.toString();
					getPolicyForUser(userId,userInfo.firstName);
				}
				else{
					done(null,{})
				}
			});

			function getPolicyForUser(userId,name){
				var policyQuery = {"userId": userId};
				mongoService.find("Policy",policyQuery,{},function(err,allPolicies){
					if(err){
						console.log('----error while getting Policy info--',err);
						done(err,null);
						return;
					}
					allPolicyInfo[name] = allPolicies;
					done(null,true);
				});
			}
		}
	}

	this.initialise = initialise;
	this.getAggregatePolicies = getAggregatePolicies;
}