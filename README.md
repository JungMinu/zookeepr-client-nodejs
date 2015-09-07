# zookeeper-node.js study

[Node.js](http://nodejs.org) 관리를 위한 자바스크립트로 작성된 [ZooKeeper](http://zookeeper.apache.org) 클라이언드 모듈

ZooKeeper version 3.4.*과 호환됩니다

---

## app.js

Zookeeper clustering, Node.js 코디네이션 모듈

## 예제

1\. 다음과 같은 방법으로 node를 생성합니다:

```javascript
var zookeeper = require('node-zookeeper-client');

var client = zookeeper.createClient('localhost:2181');
var path = process.argv[2];

client.once('connected', function () {
    console.log('Connected to the server.');

    client.create(path, function (error) {
        if (error) {
            console.log('Failed to create node: %s due to: %s.', path, error);
        } else {
            console.log('Node: %s is successfully created.', path);
        }

        client.close();
    });
});

client.connect();
```

2\. node의 자식 프로세스를 리스트하고 감시합니다

```javascript
var zookeeper = require('node-zookeeper-client');

var client = zookeeper.createClient('localhost:2181');
var path = process.argv[2];

function listChildren(client, path) {
    client.getChildren(
        path,
        function (event) {
            console.log('Got watcher event: %s', event);
            listChildren(client, path);
        },
        function (error, children, stat) {
            if (error) {
                console.log(
                    'Failed to list children of %s due to: %s.',
                    path,
                    error
                );
                return;
            }

            console.log('Children of %s are: %j.', path, children);
            
        }
    );
}

client.once('connected', function () {
    console.log('Connected to ZooKeeper.');
    listChildren(client, path);
});

client.connect();
```

### 클라이언트 생성 - createClient(connectionString, [options])

Factory method를 이용하여 새로운new zookeeper [client](#client) instance를 생성합니다

---

### 클라이언트

ZooKeeper 클라이언트 모듈의 메인 클래스입니다. 앱은 반드시 [`createClient`] 메소드를 활용하여 클라이언트를 초기화합니다.
클라이언트로부터 서버까지의 연결이 수립된 이후, 세션 아이디가 클라이언트로 부여됩니다.
그 후, 클라이언트는 주기적으로 서버로 하트비트를 전송하기 시작하여 세션을 유지하도록 합니다.

만약 클라이언트가 서버로 긴 시간동안 하트비트를 보내지 못한다면, 서버는 세션을 파기합니다.
파기되면 클라이언트 객체는 더이상 사용되지 않습니다.

만약 ZooKeeper 서버가 클라이언트로부터 연결 실패되거나 응답이 없다면, 클라이언트는 자동으로 다른 서버로 연결해서 세션 타임아웃을 방지합니다. 성공적으로 연결되면, 애플리케이션은 클라이언트를 계속해서 사용합니다.

---

**예제**

```javascript
zookeeper.create(
    '/test/demo',
    new Buffer('data'),
    CreateMode.EPHEMERAL,
    function (error, path) {
        if (error) {
            console.log(error.stack);
            return;
        }

        console.log('Node: %s is created.', path);
    }
);
```

---
### Zookeeper 클러스터링
#### Zookeeper 서버, 클라이언트 실행파일 및 설정정보
주키퍼는 3개의 서버로 클러스터링 되어 실행됩니다.<br>
.
```
Cluster1: ./zoo/zoo_cluster/zookeeper1/zookeeper-3.4.6/bin/zkServer.sh
Cluster2: ./zoo/zoo_cluster/zookeeper2/zookeeper-3.4.6/bin/zkServer.sh
Cluster3: ./zoo/zoo_cluster/zookeeper3/zookeeper-3.4.6/bin/zkServer.sh
```
```
