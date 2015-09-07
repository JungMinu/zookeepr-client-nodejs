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

for (var i = 0; i < zoonum; i++) {
        exc("sudo " + zooArray[i].path + "zkServer.sh start", function(error, stdout, stderr) {
            console.log(stdout);
        });
}
