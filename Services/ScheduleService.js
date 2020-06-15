module.exports = function ScheduleService(instance) {
	
	var self = this,
	mongoService = null,
	scheduler = require("node-schedule");
	
	function initialise(cb) {
		
		getMongoService();

		function getMongoService() {
			instance.getService("MongoDBService", function (err, mongo) {
				if (err) {
					console.log("--error while getting mongoservice in ScheduleService--",err);
					cb(err, null);
					return;
				}
				mongoService = mongo;
				cb(null, true);
			});
		}
	}

	function scheduleMessage(data, cb) {
		// var date = new Date(data.date);
		// var time = data.time.split(":");
		// data.month = date.getMonth() + 1;
		// data.day = date.getDate();
		console.log("-----data---", data);
		var rule = data.minute +" "+data.hr +" " +data.day +" " +"*" +" " +"*";
		
		var job = scheduler.scheduleJob(rule, () => {
			
			mongoService.save("Schedule", { message: data.msg }, (err, res) => {
				console.log("data saved after schedule----");
				job.cancel();
			});
		});
		cb(null, true);
	}

	this.initialise = initialise;
	this.scheduleMessage = scheduleMessage;
};
