// JSON을 Stirng으로 변환
function JSONtoString(object) {
    var results = [];
    for (var property in object) {
        var value = object[property];
        if (value)
            results.push(property.toString() + ': ' + value);
    }

    return '{' + results.join(', ') + '}';
}

// 만약 특정 mongod에 해당하는 Ephemeral Node가 deleted될 경우 실행.
// rs set이 primary가 존재하는 경우 rs 상태를 zkRsPath(/rs1)에 저장.
// primary가 존재하지 않는 경우(몽고 서버 장애) zkRsPath에 에러사항 저장({"ok": -1}).
function IfDeletedZnodeThenChangeRsStat(zkClient, zkRsPath) {
    zkClient.getChildren(
        zkRsPath,
        function(error, children, stat) {
            var rsNum = children.length;
            if (rsNum >= 3) {
                var rsMember = children[0];
                var path = zkRsPath + '/' + rsMember;

                // mongo server가 정상 상태라면 rs member 중 특정 멤버의 port를 얻어옴.
                zkClient.getData(
                    path,
                    function(error, data, stat) {
                        if(error) {
                            console.log(error.stack);
                        }

                        // 얻어온 port로 해당 mongo server에 접속해 rs 상태를 얻어와 '/rs1' znode에 저장.
                        rsPort = data.toString();
                        var MongoClient = require('mongodb').MongoClient;
                        MongoClient.connect('mongodb://localhost:' + rsPort, function(err, db) {
                            if(db == null) {
                                zkClient.setData(zkRsPath, new Buffer('{\"ok\": -1}'), -1, function(error, stat) {
                                    if(error) {
                                        console.log(error.stack);
                                    }
                                });

                                IfDeletedZnodeThenChangeRsStat(zkClient, zkRsPath);
                                return;
                            } else {
                                var rsStats = db.admin().s.topology.isMasterDoc;

                                rsStats = JSONtoString(rsStats);
                                zkClient.setData(zkRsPath, new Buffer(rsStats), -1, function(error, stat) {
                                    if(error) {
                                        console.log(error.stack);
                                    }
                                    return db.close();
                                }); // zkClient.setData
                            }
                        });
                    }
                );  // zkClient.getData
            }
            // 만약 mongo 서버가 장애가 있는 경우에는 '/rs1' znode에 에러사항({"ok": -1}) 저장.
            else {
                zkClient.setData(zkRsPath, new Buffer('{\"ok\": -1}'), -1, function(error, stat) {
                    if(error) {
                        console.log(error.stack);
                    }
                });
                return;
            }   // else : rsNum < 3
        }
    );  // zkClient.getChildren
}
exports.start = function(zkClient, zkRsPath) {
    IfDeletedZnodeThenChangeRsStat(zkClient, zkRsPath);
}
