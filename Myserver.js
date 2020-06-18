module.exports = function MyService(config) {
    // console.log('--------initialisin=============',config)
    var self       = this,
    serviceMap     = {},
    express        = require("express"),
    fs             = require("fs"),
    path           = require("path"),
    async          = require("async"),
    _              = require("lodash"),
    bodyParser     = require("body-parser"),
    exphbs         = require("express-handlebars"),
    cors           = require ('cors');
    // self.appData = {}
    appConfig = require(config.appConfigPath);
    var app = express();
    self.sharedMap      = {}
   
    function initialise(cb) {
        mergeConf()
        initialiseRoutes(cb);
    }
    function mergeConf(){
        appConfig = _.merge({},appConfig, config);
        setSharedData("appConfig", appConfig);
    }

    function ensureAppConf(){
       if( _.isEmpty(self.sharedMap)){
          mergeConf();
       }
    }

    function initialiseRoutes(cb) {
        // router(app);
        app.use(express.static(appConfig.appPath+"/public"));
        app.set('views', path.join(appConfig.appPath, 'views'));
        app.set("view engine","handlebars");
        app.engine("handlebars", exphbs({defaultLayout: "main"}));
        app.use(bodyParser.urlencoded({extended:true}));
        app.use(bodyParser.json());
        app.use(cors())
        listenPort(cb);
        // cb(null,true)
    }
    function listenPort(cb) {
        setTimeout(function () {
            app.listen(config.port, ()=> {
                console.log("Listening on localhost:" + config.port);
                cb(null,true)
            });
        }, 500);
    }

    function getService(serviceName, cb) {
        if (serviceMap && serviceMap[serviceName]) {
            cb(null, serviceMap[serviceName]);
            return;
        }
        initialiseServices(serviceName, cb);
    }

    function initialiseServices(serviceName, cb) {
        if (serviceMap && serviceMap[serviceName]) {
            cb(null, serviceMap[serviceName]);
            return;
        }
        try {
            var s = require(config.servicesPath["servicePath"] +"/" +serviceName);
            var ss = new s(self);
            ensureAppConf();
            ss.initialise((err, res)=> {
                if (err) {
                    console.log("--error while initialising service--", err);

                    cb(err, null);
                    return;
                }
                serviceMap[serviceName] = ss;
                cb(null, ss);
            });
        } catch (e) {
            console.log("--------service not found-------", e, serviceName);
        }
    }
   
    function getSharedData(key) {
        return self.sharedMap[key];
    }

    function setSharedData(key, value) {
        self.sharedMap[key] = value;
    }

    this.getService = getService;
    this.getSharedData     = getSharedData;
    this.initialise     = initialise;
    this.app         = app;
};
