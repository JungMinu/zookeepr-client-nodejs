var async = require('async');
var exec = require('child_process').exec;

var gk = require("./common");
var config = gk.config;
var rsLauncher = gk.rsLauncher;
var rsStateWatcher = gk.rsStateWatcher.rsStateWatcher;
var rsStateEventHandler = gk.rsStateWatcher.EventHandler;

var rsArray = config.rsArray;

var zkConfig = config.zkConfig;
var zkRsPath = zkConfig.RsPath;
var zkArray = config.zkArray;
var QuorumNum = zkArray.length;

var zkHost = zkArray[0].host;
for (var i = 1; i < zkArray.length; i++) {
    zkHost = zkHost + "," + zkArray[i].host;
}

var EventEmitter = require('events').EventEmitter;
var zkServerStart = new EventEmitter();
var MongoStart = new EventEmitter();

// zookeeper server Cluster 실행
zkServerStart.on('start', function() {
    for (var i = 0; i < QuorumNum; i++) {
        exec("sudo " + zkArray[i].path + "zkServer.sh start", function(error, stdout, stderr) {
            console.log(stdout);
        });
    }
});

// Zookeeper cluster server 실행
async.series([    
    function asyncZkServerStart(cb) {
        zkServerStart.emit('start');
        cb(null, "zkServer start");
    },
    
], function done(error, results) {
    console.log('error: ', error);
    rsStateWatcher.start(rsArray, rsStateEventHandler, MongoConfig, zkRsPath, zkHost);
    console.log('Watcher Start');
});
