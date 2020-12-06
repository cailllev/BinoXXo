"use strict";

const express = require('express'),
      morgan = require('morgan'),
      path = require('path'),
      app = express();

let port = process.env.PORT || 8000;

app.use(morgan('dev'));


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/src/css/:name', function(req, res) {
    res.sendFile(path.join(__dirname + '/src/css/' + req.params.name));
});

app.get('/src/:name', function(req, res) {
    res.sendFile(path.join(__dirname + '/src/' + req.params.name));
});

app.get('/tags/:name', function(req, res) {
    res.sendFile(path.join(__dirname + '/tags/' + req.params.name));
});


app.listen(port, function(){
    console.log("serving index.html @ port: " + port);
});
