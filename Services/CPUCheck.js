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
			    console.log('cpuStats---',stats);
			    if(stats > 50){
			    	console.log('---restaring server again----');
			    	// setTimeout(function () {
				    //     process.on("exit", function () {
				    //     	console.log('--process.argv---',process.argv)
				    //         require("child_process").spawn(process.argv.shift(), process.argv, {
				    //             cwd: process.cwd(),
				    //             detached : true,
				    //             stdio: "inherit"
				    //         });
				    //     });
				    //     process.exit();
				    // }, 3000);
				     process.exit(1);

			    }
			    setTimeout(checkCPUStatus,5*1000);
			});
		}
		cb(null,true)
	}

	this.initialise = initialise;
}