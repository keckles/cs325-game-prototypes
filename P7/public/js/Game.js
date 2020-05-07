"use strict";
//console.log("makegame");
//import { Phaser } from "./phaser.min";


GameStates.makeGame = function (game, shared) {
    // Create your own variables.
    const numCells = 500;
    const numVirus = 50;
    const dist = 15000;
    var debug = 0;
    var player = null;
    var pg;
    var playerPosition = { x: 0, y: 0 };
    var GameObjects;
    var walls;
    var wall;
    var cells;
    var virus;
    var keys = {};
    var background;
    var cell;
    var vc;
    var otherPlayers;
    var points = 0;
    var text;
    var socket;
    var style;
    var texts = {};
    var health = 1000;
    var hp;
    function test() {
        //console.log("testing");
    }
    function bump(vc) {
        //console.log("do it be?");
        vc.destroy();
        //console.log(virus.length);
        //console.log(debug++);
        if (virus.length == 500) {
            //console.log(virus.length);
            //console.log(debug++);
            if (virus.countLiving() <= 1) {
                //console.log("do it be?");
                game.state.start('MainMenu');
                //console.log("do it be?");
            }
        }
        //console.log(debug++);
        /*console.log("do it be?");
        chaseCell(vc);*/
    }

    function chaseCell(vc) {
        var closest = null;
        while (closest == null || closest.body == null) {
            cells.forEach(cell => {
                if (cell.body != null) {
                    //console.log(cell);
                    if (cell != null && (closest == null || Phaser.Math.distance(closest.body.position.x, closest.body.position.y, vc.body.position.x, vc.body.position.y) > Phaser.Math.distance(cell.body.position.x, cell.body.position.y, vc.body.position.x, vc.body.position.y))) {
                        closest = cell;
                    }
                }
            });
            game.physics.arcade.velocityFromAngle((game.physics.arcade.angleBetween(vc, closest) * (180 / Math.PI)), 200, vc.body.velocity);
        }
        //game.physics.arcade.moveToObject(vc,closest,200);
        //cells.getRandom()
        

        //game.physics.arcade.velocityFromAngle((game.physics.arcade.angleBetween(closest,vc)*(180/Math.PI)),200,vc.body.velocity);
    }
    function infectCell(vc, cell) {
        var newVirus = game.add.sprite(cell.body.position.x - virus.position.x, cell.body.position.y - virus.position.y, 'virus');
        virus.add(newVirus);

        newVirus.anchor.setTo(0.5, 0.5);
        //GameObjects.filter(GO => GO == cell);
        //cells.filter(GO => GO == cell);

        cell.destroy();
        if (cells.countLiving() <= 1) {
            //console.log("u ded");
            socket.emit('disconnect');
            game.state.start('MainMenu');
        }
        game.physics.enable(newVirus, Phaser.Physics.ARCADE);
        chaseCell(vc);
        chaseCell(newVirus);

    }
    function eatVirus(vc, player) {
        //GameObjects.filter(GO => GO == vc);
        //virus.filter(GO => GO == vc);
        points++;
        health = health - 100;
        vc.destroy();
        if (virus.countLiving() <= 1 || health <= 0) {
            health = 1000;
            socket.emit('disconnect');
            game.state.start('MainMenu');
        }
    }
    function otherEatVirus(vc, player) {
        //GameObjects.filter(GO => GO == vc);
        //virus.filter(GO => GO == vc);
        vc.destroy();
        if (virus.countLiving() <= 1) {
            socket.emit('disconnect');
            game.state.start('MainMenu');
        }
    }
    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }

    var oldPosition;
    return {

        create: function () {

            socket = io('https://biowar.gq:2053/');

            style = { font: "15px Verdana", fill: "#ffffffff", align: "center" };
            keys = {
                left: this.input.keyboard.createCursorKeys().left,
                right: this.input.keyboard.createCursorKeys().right,
                down: this.input.keyboard.createCursorKeys().down,
                up: this.input.keyboard.createCursorKeys().up
            };
            //console.log(debug++);
            GameObjects = game.add.group();

            game.physics.arcade.gravity.y = 0;
            // Create a sprite at the center of the screen using the 'logo' image.
            GameObjects.add(background = game.add.sprite(game.world.centerX, game.world.centerY, 'background'));
            game.physics.enable(background, Phaser.Physics.ARCADE);
            background.scale.x = 20;
            background.scale.y = 20;
            background.anchor.setTo(0.5, 0.5);

            otherPlayers = game.add.group();
            
            socket.on('currentPlayers', function (players) {
                Object.keys(players).forEach(function (id) {
                    if (players[id].playerId != socket.id) {
                        var oplr = game.add.sprite(-players[id].x, -players[id].y, 'wbcell');
                        oplr.playerId = players[id].playerId;
                        otherPlayers.add(oplr);
                        oplr.anchor.setTo(0.5, 0.5);
                        game.physics.enable(oplr, Phaser.Physics.ARCADE);
                        oplr.body.moves = false;
                        texts[id] = game.add.text(players[id].x - game.world.centerX, players[id].y + 25 - game.world.centerY, "0", style);
                        //texts[playerInfo.playerId].anchor.setTo(0.5, 0.5);
                        walls.add(texts[players[id].playerId]);

                    }
                })
            });
            socket.on('newPlayer', function (playerInfo) {
                var oplr = game.add.sprite(0, 0, 'wbcell');
                oplr.playerId = playerInfo.playerId;
                otherPlayers.add(oplr);
                oplr.anchor.setTo(0.5, 0.5);
                game.physics.enable(oplr, Phaser.Physics.ARCADE);
                oplr.body.moves = false;
                texts[playerInfo.playerId] = game.add.text(playerInfo.x + game.world.centerX, playerInfo.y + 40 + game.world.centerY, "0", style);
                //texts[playerInfo.playerId].anchor.setTo(0.5, 0.5);
                walls.add(texts[playerInfo.playerId]);
            });
            socket.on('getObjects', function (numObjects) {
                console.log("updating objects");
                var i = 0;
                cells.forEach(cell => {
                    socket.emit('objectChange', { id: i, x: cell.body.position.x, y: cell.body.position.y, type: 'cell' });
                    i++;
                });
                virus.forEach(virus => {
                    socket.emit('objectChange', { id: i, x: virus.body.position.x, y: virus.body.position.y, type: 'virus' });
                    i++;
                });
                for (; i < numObjects; i++) {
                    socket.emit('destroyObject', i);
                }
                socket.emit('objectsUpdated');
            });
            socket.on('disconnect', function (playerId) {
                otherPlayers.forEach(function (otherPlayer) {
                    if (playerId === otherPlayer.playerId) {
                        otherPlayer.destroy();
                        texts[playerId].destroy();
                    }
                });
            });
            //otherPlayers.
            socket.on('playerMoved', function (playerInfo) {
                otherPlayers.forEach(function (otherPlayer) {
                    if (playerInfo.playerId == otherPlayer.playerId) {
                        ///otherPlayer.body.setRotation(playerInfo.rotation);
                        console.log(playerInfo.x, playerInfo.y);
                        otherPlayer.x = playerInfo.x * -1;
                        otherPlayer.y = playerInfo.y * -1;
                        texts[otherPlayer.playerId].text = playerInfo.score;
                        texts[otherPlayer.playerId].x = otherPlayer.x + game.world.centerX;
                        texts[otherPlayer.playerId].y = otherPlayer.y - 40 + game.world.centerY;
                    }
                });
            });
            player = game.add.sprite(game.world.centerX, game.world.centerY, 'wbcell');
            pg = game.add.group();
            pg.add(player);
            cells = game.add.group();
            virus = game.add.group();
            walls = game.add.group();
            wall = walls.add(game.add.sprite(dist * .75, 0, 'wall'));
            game.physics.enable(wall, Phaser.Physics.ARCADE);
            wall.anchor.setTo(0.5, 0.5);
            wall.body.immovable = true;
            wall = walls.add(game.add.sprite(-dist * .75, 0, 'wall'));
            game.physics.enable(wall, Phaser.Physics.ARCADE);
            wall.anchor.setTo(0.5, 0.5);
            wall.body.immovable = true;
            wall = walls.add(game.add.sprite(0, -dist * .75, 'wall'));
            game.physics.enable(wall, Phaser.Physics.ARCADE);
            wall.anchor.setTo(0.5, 0.5);
            wall.angle = 90;
            wall.body.immovable = true;
            wall = walls.add(game.add.sprite(0, dist * .75, 'wall'));
            game.physics.enable(wall, Phaser.Physics.ARCADE);
            wall.anchor.setTo(0.5, 0.5);
            wall.angle = 90;
            wall.body.immovable = true;


            cell = game.add.sprite(dist, dist, 'cell');
            cells.add(cell);
            game.physics.enable(cell, Phaser.Physics.ARCADE);
            cell.anchor.setTo(0.5, 0.5);
            vc = game.add.sprite(-dist, -dist, 'virus');
            game.physics.enable(vc, Phaser.Physics.ARCADE);
            vc.anchor.setTo(0.5, 0.5);
            virus.add(vc);

            socket.on('spawnNewObjects', function () {
                for (let index = 0; index < numCells; index++) {
                    cell = game.add.sprite(Math.random() * dist - dist / 2, Math.random() * dist - dist / 2, 'cell');
                    cells.add(cell);
                    game.physics.enable(cell, Phaser.Physics.ARCADE);
                    cell.anchor.setTo(0.5, 0.5);
                    socket.emit('objectChange', { id: index, x: cell.body.position.x, y: cell.body.position.y, type: 'cell' });
                }
                for (let index = 0; index < numVirus; index++) {
                    vc = game.add.sprite(Math.random() * dist - dist / 2, Math.random() * dist - dist / 2, 'virus');
                    virus.add(vc);
                    game.physics.enable(vc, Phaser.Physics.ARCADE);
                    vc.anchor.setTo(0.5, 0.5);
                    chaseCell(vc);
                    socket.emit('objectChange', { id: index + numCells, x: cell.body.position.x, y: cell.body.position.y, type: 'virus' });
                }
            });
            socket.on('spawnObjects', function (objects) {
                console.log("spawning objects");
                Object.keys(objects).forEach(object => {
                    if (objects[object].type == 'virus') {
                        vc = game.add.sprite(objects[object].x, objects[object].y, objects[object].type);
                        virus.add(vc);
                        game.physics.enable(vc, Phaser.Physics.ARCADE);
                        vc.anchor.setTo(0.5, 0.5);
                        chaseCell(vc);
                    }
                    if (objects[object].type == 'cell') {
                        cell = game.add.sprite(objects[object].x, objects[object].y, objects[object].type);
                        cells.add(cell);
                        game.physics.enable(cell, Phaser.Physics.ARCADE);
                        cell.anchor.setTo(0.5, 0.5);
                    }
                });
            });
            //console.log(debug++);
            

            // Anchor the sprite at its center, as opposed to its top-left corner.
            // so it will be truly centered.
            player.anchor.setTo(0.5, 0.5);
            // Turn on the arcade physics engine for this sprite.
            game.physics.enable(player, Phaser.Physics.ARCADE);
            player.body.moves = false;




            text = game.add.text(game.world.centerX, game.world.centerY-25, "0", style);
            text.anchor.setTo(0.5, 0.5);


            hp = game.add.text(25, 25, "0", style);
            hp.anchor.setTo(0, 0);
            // Add some text using a CSS style.
            // Center it in X, and position its top 15 pixels from the top of the world.

            //console.log(debug++);

            // When you click on the sprite, you go back to the MainMenu.
            /*bouncy.inputEnabled = true;
            bouncy.events.onInputDown.add( function() { quitGame(); }, this );*/
        },

        update: function () {
            text.text = points;
            hp.text = health;
            //player.body.velocity.x = player.body.velocity.y = 0;
            //console.log(debug++);
            game.physics.arcade.overlap(virus, cells, infectCell);
            game.physics.arcade.overlap(virus, pg, eatVirus);
            game.physics.arcade.overlap(virus, otherPlayers, otherEatVirus);
            game.physics.arcade.collide(virus, walls);
            //game.physics.arcade.collide(background, player, test);
            var lastPos = [playerPosition.x, playerPosition.y];
            if (keys.right.isDown) {
                playerPosition.x -= 5;
            }
            if (keys.left.isDown) {
                playerPosition.x += 5;
            }
            if (keys.up.isDown) {
                playerPosition.y += 5;
            }
            if (keys.down.isDown) {
                playerPosition.y -= 5;
            }
            /*GameObjects.forEach(GameObject => {
                if(GameObject.body != null){
                    GameObject.body.position.x = GameObject.body.position.x-lastPos[0]+playerPosition.x;
                    GameObject.body.position.y = GameObject.body.position.y-lastPos[1]+playerPosition.y;
                }
            });*/
            //console.log(debug++);
            if (oldPosition && (playerPosition.x !== oldPosition.x || playerPosition.y !== oldPosition.y)) {
                console.log("test");
                socket.emit('playerMovement', { x: playerPosition.x, y: playerPosition.y,score:points });
            }
            if (health < 1000) {
                health++;
            }
            // save old position data
            oldPosition = {
                x: playerPosition.x,
                y: playerPosition.y,
            };
            cells.position.x = playerPosition.x;
            cells.position.y = playerPosition.y;
            virus.position.x = playerPosition.x;
            virus.position.y = playerPosition.y;
            background.position.x = playerPosition.x;
            background.position.y = playerPosition.y;
            walls.position.x = playerPosition.x;
            walls.position.y = playerPosition.y;
            otherPlayers.position.x = playerPosition.x + game.world.centerX;
            otherPlayers.position.y = playerPosition.y + game.world.centerY;
            //console.log(debug++);

            virus.forEach(v => {
                chaseCell(v);
            });

            //console.log(debug++);
            //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!

            // Accelerate the 'logo' sprite towards the cursor,
            // accelerating at 500 pixels/second and moving no faster than 500 pixels/second
            // in X or Y.
            // This function returns the rotation angle that makes it visually match its
            // new trajectory.
            //bouncy.rotation = game.physics.arcade.accelerateToPointer( bouncy, game.input.activePointer, 500, 500, 500 );
        }
    };
};

