const express = require('express'),
    route = express();

route.use(express.static(__dirname));

const server = route.listen(80, function runServer() {
    const port = server.address().port
    console.log("server run at http://127.0.0.1:" + port)
});


