var exc = require('child_process').exec;
var zooArray = [
        {
            "host": "localhost:2181",
            "path": "./zookeeper_cluster/zookeeper1/zookeeper-3.4.6/bin/"
        },
        {
            "host": "localhost:2182",
            "path": "./zookeeper_cluster/zookeeper2/zookeeper-3.4.6/bin/"
        },
        {
            "host": "localhost:2183",
            "path": "./zookeeper_cluster/zookeeper3/zookeeper-3.4.6/bin/"
        }
    ];

var zoonum = zooArray.length;
var EventEmitter = require('events').EventEmitter;
var zkServerStart = new EventEmitter();

// Cluster 실행
zkServerStart.on('start', function() {
     for (var i = 0; i < zoonum; i++) {
        exc("sudo " + zooArray[i].path + "zkServer.sh start", function(error, stdout, stderr) {
            console.log(stdout);
        });
    }
});

var async = require('async');
    async.series([    
     function asyncZkServerStart(cb) {
        zkServerStart.emit('start');
        cb(null, "start");
    }

], function done(error, results) {
   console.log('Zookeeper_Watcher 시작');
    
var zookeeper = require('node-zookeeper-client');

var zkHost = zooArray[0].host;

for (var i = 1; i < zooArray.length; i++) {
    zkHost = zkHost + "," + zooArray[i].host;
}
    var zkClient = zookeeper.createClient(zkHost);

    zkClient.connect();
});
