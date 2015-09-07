function JSONtoString(object) {
    var results = [];
    for (var property in object) {
        var value = object[property];
        if (value)
            results.push(property.toString() + ': ' + value);
    }

    return '{' + results.join(', ') + '}';
}

function IfRsIsOkThenStoreRsState(zkClient, rsPort, znode, zkRsPath) {
    zkClient.getChildren(
        zkRsPath,
        function(error, children, stat) {
            var rsNum = children.length;
            // rs 멤버가 셋 이상 살아있는 경우는 항상 primary 존재(primary1, secondary2, arbiter1 기준).
            if (rsNum >= 3) {
                var MongoClient = require('mongodb').MongoClient;
                MongoClient.connect('mongodb://localhost:' + rsPort, function(err, db) {
                    // mongo server가 stable한 상태임에도 'db == null'이라면 다시 시도해 상태정보 저장.
                    if (db == null) {
                        IfRsIsOkThenStoreRsState(zkClient, rsPort, znode, zkRsPath);
                    } else {
                        var rsState = db.admin().s.topology.isMasterDoc;

                        rsState = JSONtoString(rsState);
                        zkClient.setData(zkRsPath, new Buffer(rsState), -1, function(error, stat) {
                            if(error) {
                                console.log(error.stack);
                            }
                            return db.close();
                        });
                    }
                });
            }
            // rs 멤버가 셋 미만으로 살아있다면 mongo 서버는 항상 장애(primary1, secondary2, arbiter1 기준).
            // 따라서 mongo가 장애가 있다고 판단되므로 에러사항 저장({"ok": -1}).
            else {
                zkClient.setData(zkRsPath, new Buffer('{\"ok\": -1}'), -1, function(error, stat) {
                    if(error) {
                        console.log(error.stack);
                    }
                });
                return;
            }
        }
    );
}

exports.start = function(zkClient, rsPort, znode, zkRsPath) {
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect('mongodb://localhost:' + rsPort, function(err, db) {
        // 만약 몽고 서버에 정상적으로 connection이 되지 않는다면
        if (db == null) {
            // rs의 상태를 보고 장애여부가 없다면 rs 상태정보를 다시 갱신하려 시도한다.
            IfRsIsOkThenStoreRsState(zkClient, rsPort, znode, zkRsPath);
        } else {
            var rsState = db.admin().s.topology.isMasterDoc;
            rsState = JSONtoString(rsState);
            zkClient.setData(zkRsPath, new Buffer(rsState), -1, function(error, stat) {
                if(error) {
                    console.log(error.stack);
                }
                db.close();
            });
        }
    });
}
