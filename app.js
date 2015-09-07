var async = require('async');
var exec = require('child_process').exec;

var gk = require("./common");
var config = gk.config;
var smLauncher = gk.smLauncher;
var smStateWatcher = gk.smStateWatcher.smStateWatcher;
var smStateEventHandler = gk.smStateWatcher.EventHandler;

var smArray = config.smArray;

var zooConfig = config.zooConfig;
var zoosmPath = zooConfig.smPath;
var zooArray = config.zooArray;
var QuorumNum = zooArray.length;

var zooHost = zooArray[0].host;

for (var i = 1; i < zooArray.length; i++) {
    zooHost = zooHost + "," + zooArray[i].host;
}

var EventEmitter = require('events').EventEmitter;
var zooServesmtart = new EventEmitter();
var MongoStart = new EventEmitter();

zooServesmtart.on('start', function() {
    for (var i = 0; i < QuorumNum; i++) {
        exec("sudo " + zooArray[i].path + "zooServer.sh start", function(error, stdout, stderr) {
            console.log(stdout);
        });
    }
});

// Zookeeper cluster server 실행
async.series([    
    function asynczooServesmtart(cb) {
        zooServesmtart.emit('start');
        cb(null, "zooServer start");
    },
    
], function done(error, results) {
    console.log('err: ', error);
    smStateWatcher.start(smArray, smStateEventHandler, MongoConfig, zoosmPath, zooHost);

});
