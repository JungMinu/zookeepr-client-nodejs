var zookeeper = require('node-zookeeper-client');

function Dispatcher(zkClient, rsPort, NodeCreatedEventHandler, NodeDeletedEventHandler, znode, zkRsPath, isStoreState) {
    zkClient.exists(
    znode,
    function (event) {
        console.log('Got Watcher event: %s', event);
        isStoreState = false;

        // 와쳐를 걸어 둔 Node가 생성됐다면
        if (event.type == zookeeper.Event.NODE_CREATED) {
            isStoreState = true;
        }
        // 와쳐를 걸어 둔 Node가 삭제됐다면
        else if (event.type == zookeeper.Event.NODE_DELETED) {
            NodeDeletedEventHandler.start(zkClient, zkRsPath);
        }
        // 와쳐를 걸어 둔 Node가 그 외의 이벤트 타입이라면
        else {
        }

        Dispatcher(zkClient, rsPort, NodeCreatedEventHandler, NodeDeletedEventHandler, znode, zkRsPath, isStoreState);
    }, function (error, stat) {
        if(error) {
            console.log(error.stack);
        }

        
    });
} 

// Watcher 로직을 실행한다.
function watchAndStoreRsStat(zkClient, rsArray, rsStateEventHandler, MongoConfig, zkRsPath) {
    var rsNum = rsArray.length;
    var isStoreState = true;
    var NodeCreatedEventHandler = rsStateEventHandler.NodeCreatedEventHandler;
    var NodeDeletedEventHandler = rsStateEventHandler.NodeDeletedEventHandler;

    for(var i = 0; i < rsNum; i++) {
        var znode = zkRsPath + '/' + rsArray[i].name;
        Dispatcher(zkClient, rsArray[i].port, NodeCreatedEventHandler, NodeDeletedEventHandler, znode, zkRsPath, isStoreState);
    }
}

function JSONtoString(object) {
    var results = [];
    for (var property in object) {
        var value = object[property];
        if (value)
            results.push(property.toString() + ': ' + value);
    }
                                                 
    return '{' + results.join(', ') + '}';
}

exports.start = function(rsArray, rsStateEventHandler, zkRsPath, zkHost) {

    console.log('Zookeeper_Watcher operate');
	var zkClient = zookeeper.createClient(zkHost);

	zkClient.once('connected', function () {
		console.log('Zookeeper_Watcher Connected to ZooKeeper.');
		watchAndStoreRsStat(zkClient, rsArray, rsStateEventHandler, zkRsPath);
	});

	zkClient.connect();
}
