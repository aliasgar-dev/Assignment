module.exports = function UploadFileService(instance) {
	var self = this,
		mongoService = null,
		csv = require("csvtojson"),
		mongodb = require("mongodb"),
		fs = require("fs"),
		_ = require("lodash"),
		async = require("async"),
		appConfig = null;

	function initialise(cb) {
		instance.getService("MongoDBService", (err, mongo)=> {
			if (err) {
				console.log("------error while getting mongo in UploadFileService---",err);
				cb(err, null);
				return;
			}
			mongoService = mongo;
			appConfig = instance.getSharedData('appConfig');
			cb(null, true);
		});
	}

	function uploadFile(fileInfo ,cb) {
		if(!fileInfo || !fileInfo.fileName){
			cb({reason:"please select csv file to upload"},null);
			return;
		}
		csv().fromFile(appConfig.uploadFilePath + "/" + fileInfo.fileName)
		.then((jsonObj) => {
			saveFilesData(jsonObj, cb);
		});
	}

	function saveFilesData(fileData, cb) {
		async.mapSeries(fileData,(eachData, done) => {
			
			var userInfo = {};
			var policyInfo = {};
			var userAccount = {};
			var categoryName;
			var policyCarrier;
			var policyNumber = eachData["policy_number"];
			var agent = eachData["agent"];
			userInfo.firstName = eachData["firstname"];
			userInfo.userType = eachData["userType"];
			userInfo.dob = eachData["dob"];
			userInfo.gender = eachData["gender"];
			userInfo.email = eachData["email"];
			userInfo.phoneNo = eachData["phone"];
			userInfo.address = eachData["address"];
			userInfo.zipCode = eachData["zip"];
			userInfo.state = eachData["state"];
			userAccount["accountName"] = eachData["account_name"];
			categoryName = eachData["category_name"];
			policyCarrier = eachData["company_name"];
			// policyInfo.policyNumber = eachData["policy_number"];
			policyInfo.policyStartDate = eachData["policy_start_date"];
			policyInfo.policyEndDate = eachData["policy_end_date"];
			policyInfo.premiumAmount = eachData["premium_amount"];
			policyInfo.policyType = eachData["policy_type"];
			policyInfo.policyMode = eachData["policy_mode"];
			policyInfo.companyName = policyCarrier
			policyInfo.policyNumber = policyNumber;
			saveAgent();
			
			function saveAgent(){
				let agentQuery = { agentName: agent };
				var updateObj = { agentName: agent };
				mongoService.findOneAndUpdate("Agent",agentQuery,{$set: updateObj,$push: { policyNumber: policyNumber }},{ upsert: true },(err, res) => {
					if (err) {
						console.log("----error while updating Agent info in db--",err);
						done(err, null);
						return;
					}
					saveUsers();
				});
			}
			function saveUsers(){
				var userQ = {"firstName":userInfo.firstName,"email":userInfo.email}
				mongoService.findOneAndUpdate("User",userQ, {$set:userInfo},{upsert:true}, (err, res) => {
					if (err) {
						console.log("----error while saving user info--",err);
						done(err, null);
						return;
					}
					var userId;
					if (res.lastErrorObject &&res.lastErrorObject.updatedExisting) {
						userId = res.value._id;
					} 
					else {
						userId = res.lastErrorObject.upserted;
					}
					policyInfo.userId = userId.toString();
					saveUserAccount();
				});
			}

			function saveUserAccount(){
				var accQuery = {accountName: userAccount["accountName"]};
				var upObj = {accountName: userAccount["accountName"]};
				mongoService.findOneAndUpdate("UserAccount",accQuery,{ $set: upObj },{upsert:true},(err, res) => {
					if (err) {
						done(err, null);
						return;
					}
					saveCategory();
				});
			}

			function saveCategory(){
				mongoService.findOneAndUpdate("LOB",{ category_name: categoryName },{$set: {category_name: categoryName}},{ upsert: true },(err, res) => {
					if (err) {
						done(err, null);
						return;
					}
					var policyCategoryId;
					if (res.lastErrorObject &&res.lastErrorObject.updatedExisting) {
						policyCategoryId = res.value._id;
					} 
					else {
						policyCategoryId = res.lastErrorObject.upserted;
					}
					policyInfo.policyCategoryId = policyCategoryId.toString();
					saveCarrier();
				});
			}

			function saveCarrier(){
				mongoService.findOneAndUpdate("Carrier",{ company_name: policyCarrier },{$set: {company_name: policyCarrier}},{ upsert: true },(err, res) => {
					if (err) {
						console.log("--error while adding Carrierin db--",err);
						done(err, null);
						return;
					}
					var policyCarrierId;
					if (res.lastErrorObject &&res.lastErrorObject.updatedExisting) {
							policyCarrierId = res.value._id;
					} 
					else {
						policyCarrierId = res.lastErrorObject.upserted;
					}
					policyInfo.policyCarrierId = policyCarrierId.toString();
					savePolicyInfo();
				});
			}

			function savePolicyInfo(){
				var policyQ = {"policyNumber":policyInfo.policyNumber};
				mongoService.findOneAndUpdate("Policy",policyQ,{$set:policyInfo},{upsert:true},(err, res) => {
					if (err) {
						console.log("---error while adding policyInfo--",err);
						done(err, null);
						return;
					}
					var policyId;
					if (res.lastErrorObject && res.lastErrorObject.updatedExisting) {
						policyId = res.value._id;
					} 
					else {
						policyId = res.lastErrorObject.upserted;
					}
					done(null, policyId.toString());
				});
			}
			},function (err, result) {
				cb(err,true);
			}
		);
	}

	this.initialise = initialise;
	this.uploadFile = uploadFile;
};
