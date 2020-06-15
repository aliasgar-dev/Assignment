//Starting point of Node Express server.

const {Worker, isMainThread, parentPort, workerData} = require('worker_threads');
var path = require("path");;
var multer = require("multer");
var upload = multer({ dest: "uploads/" });

var config = {
    port: 3000,
    appPath: __dirname,
    servicesPath: {
        coreServicePath: __dirname + "/./coreServices",
        servicePath: __dirname + "/./Services/"
    },
    appConfigPath: __dirname + "/./appConfig.json",
    uploadFilePath: __dirname+"/uploads"
};

var app = require("./Myserver");
var d = new app(config);
if(isMainThread){
   var resolved =  new Promise((resolve,reject)=>{
        d.initialise((err, res)=> {
            if (err) {
                console.log("---------error while initialisng app---", err);
                return;
            }
            trackCPU();
            handleAllRoute()
            resolve('true')
        });
    });
   resolved.then((data)=>{
        handleRoute();
   })

    function trackCPU(){
        d.getService("CPUCheck",(err,cpuCheckService)=>{
            if(err){
                console.log('----error while getting cpu service--');
                return
            }
        });
    }

    async function mainThreadExec(fileName){
       return new Promise((resolve,reject)=>{
          const worker = new Worker(__filename, {workerData: {fileName:fileName,fileupload:true}});
           worker.on('message', (result)=>{
            console.log('----- on message----',result)
            resolve('executed');
          });
       })
    }
    function handleRoute(){
        d.app.post("/upload", upload.single("myfile"), async (req, res) => {
            let fileName = req.file.filename;
             var result = await mainThreadExec(fileName);
              res.send("uploaded successfully");
        });
    }
}
else{

    var uploadedFile =  workerData && workerData.fileupload;
    var fileData = workerData && workerData.fileName;
    if(uploadedFile){
      d.getService("UploadFileService", (err, uploadService)=> {
        if (err) {
          throw err;
        }
        uploadService.uploadFile({ fileName: fileData}, (err, result)=> {
           if (err) {
            throw err;
          } else {
              console.log('--final--',result)
            parentPort.postMessage(result);
          }
        });
      });
    }
}

function handleAllRoute(){
    d.app.get("/", function (req, res) {
      res.render("home");
   });

    d.app.get("/searchUser", (req, res) => {
        d.getService("SearchUserInfo", function (err, searchUserService) {
            if (err) {
                console.log("--------error while SearchUserInfo service--", err);
                throw err;
            } 
            else {
                searchUserService.searchUserInfo(req.query, (err, result) => {
                    if (err) {
                        res.send({ err, result });
                    } else {
                        res.send({ err, result });
                    }
                });
            }
        });
    });

    d.app.post("/scheduleMsg", (req, res) => {
        d.getService("ScheduleService", function (err, scheduleService) {
            if (err) {
                console.log("--------error while SearchUserInfo service--", err);
                throw err;
            } 
            else {
                scheduleService.scheduleMessage(req.body, (err, result) => {
                    if (err) {
                        res.send({ err, result });
                    } else {
                        res.send({ err, result });
                    }
                });
            }
        });
    });

    d.app.post("/aggeregateUser", (req, res) => {
        d.getService("AggregatePolicy", function (err, aggrePolicy) {
            console.log('dfdfdfd',req.body)
            if (err) {
                console.log("--------error while SearchUserInfo service--", err);
                throw err;
            } 
            else {
                aggrePolicy.getAggregatePolicies(req.body, (err, result) => {
                    if (err) {
                        res.send({ err, result });
                    } else {
                        res.send({ err, result });
                    }
                });
            }
        });
    });
}
