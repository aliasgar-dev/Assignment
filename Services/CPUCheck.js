module.exports = function CPUCheck(instance){

	var cpuStats = require('cpu-stat');

	function initialise(cb){

		checkCPUStatus();

		function checkCPUStatus(){
			cpuStats.usagePercent(function(err, percent, seconds) {
			    if (err) {
			      return console.log(err);
			    }
			    var stats  = parseFloat(percent).toFixed(2);
			    console.log('cpu usages: ',stats);
			    if(stats > 70){
			    	console.log('---restaring server again----');
				    process.exit(1);
			    }
			    setTimeout(checkCPUStatus,5*1000);
			});
		}
		cb(null,true)
	}

	this.initialise = initialise;
}