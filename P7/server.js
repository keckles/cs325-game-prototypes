const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const fs = require('fs');
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')//,
    //port: 8081
};
const server = https.Server(options, app);
const io = require('socket.io').listen(server);


/*
// honestly i have no clue what this does its for encryption i guess
//var app = require("./app.js");

const server = require("greenlock-express")
    .init({
        packageRoot: __dirname,
        configDir: "./greenlock.d",

        // contact for security and critical bug notices
        maintainerEmail: "kecklesalt@gmail.com",

        // whether or not to run at cloudscale
        cluster: false
    })
    // Serves on 80 and 443
    // Get's SSL certificates magically!
    .serve(app);



/*
const PROD = false;
const lex = require('greenlock-express').create({
    version: 'draft-11',
    server: PROD ? 'https://acme-v02.api.letsencrypt.org/directory' : 'https://acme-staging-v02.api.letsencrypt.org/directory',
    approveDomains: (opts, certs, cb) => {
        if (certs) {
            // change domain list here
            opts.domains = ['biowar.gq', 'biowar.gq']
        } else {
            // change default email to accept agreement
            opts.email = 'kecklesalt@gmail.com';
            opts.agreeTos = true;
        }
        cb(null, { options: opts, certs: certs });
    }
    // optional: see "Note 3" at the end of the page
    // communityMember: true
});
const middlewareWrapper = lex.middleware;

const server = https.Server(lex.httpsOptions, middlewareWrapper(handler));
const io = require('socket.io').listen(server);*/

var players = {};
var objects = {};
var loadingPlayers = {};
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('a user connected');
    // create a new player and add it to our players object
    
    if (Object.keys(objects).length == 0) {
        console.log(socket.id + " is the master.");
        players[socket.id] = {
            x: 0,
            y: 0,
            score: 0,
            playerId: socket.id,
        };
        socket.emit('spawnNewObjects');
    } else {
        console.log(socket.id + " is a client.");
        console.log("their are " + Object.keys(objects).length + " objects.");
        loadingPlayers[socket.id] = {
            x: 0,
            y: 0,
            score: 0,
            playerId: socket.id,
        };
        players[socket.id] = loadingPlayers[socket.id];
        io.to(Object.keys(players)[0]).emit('getObjects', Object.keys(objects).length);
        
    }
    
    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // when a player disconnects, remove them from our players object
    socket.on('disconnect', function () {
        console.log('user disconnected');
        // remove this player from our players object
        delete players[socket.id];
        if (Object.keys(players).length == 0) {
            objects = {};
        }
        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
    });
    socket.on('objectsUpdated', function () {
        console.log("objects updated");
        Object.keys(loadingPlayers).forEach(plr => {
            io.to(plr).emit('spawnObjects', objects);
            delete loadingPlayers[plr];
        });
    })
    // when a player moves, update the player data
    socket.on('playerMovement', function (playerData) {
        players[socket.id].x = playerData.x;
        players[socket.id].y = playerData.y;
        players[socket.id].score = playerData.score;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });
    socket.on('objectChange', function (objectData) {
        objects[objectData.id] = {
            x: objectData.x,
            y: objectData.y,
            type: objectData.type
        }

        socket.broadcast.emit('objectChanged', objects[objectData.id]);
    });
    socket.on('destroyObject', function (id) {
        delete objects[id];
    });

});

server.listen(2053, function () {
    console.log(`Listening on ${server.address().port}`);
});

