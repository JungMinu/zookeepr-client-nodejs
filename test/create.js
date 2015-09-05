var zookeeper = require('../index.js');

var client = zookeeper.createClient(process.argv[2], { retries : 2 });
var path = process.argv[3];

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
