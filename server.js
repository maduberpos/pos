var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require("socket.io")().listen(server);

io.on("connection", function(socket) {
    console.log("A new Client has connected with id " + socket.id + "!");

    socket.on("disconnect", function() {
        console.log("the client has disconnected");
    });


    socket.on("order", function(data) {
        console.log(data.order);
        io.emit("order", data);
    });

    socket.on("kot_status_change", function(data) {
        console.log(data);
        io.emit("kot_status_change", data)
    })

})
require('dns').lookup(require('os').hostname(), function(err, add, fam) {

    console.log(add);
    server.listen(3000, add, function() {
        console.log(server.address({ port: 3000, family: 'IPv4', address: add }));
        // console.log("Listening on PORT " + 8080);
    })
});

// server.listen(3080, function() {
//     console.log("Listening on PORT " + 3080);
// })