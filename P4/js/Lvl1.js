"use strict";

GameStates.makeLvlOne = function( game, shared ) {
    // Create your own variables.
    var player = null;
    var blocks = [];
    var cars = [];
    var catSides = [];
    var powerUps = [];
    var playerSide = true;
    var wait = 0;
    var next;
    var prev;
    var text;
    function nextLvl() {
        console.log("next");
        game.state.start("Lvl2");
    }
    function prevLvl() {
        game.state.start("MainMenu");
    }
    /*function collect(player, cat) {
        cats[cats.length] = game.add.sprite(cat.body.position.x, cat.body.position.y, 'cat');
        catSides[cats.length-1] = Math.random() >= .5;
        cats[cats.length - 1].anchor.setTo(0.5);
        game.physics.arcade.enable(cats);
        cats[cats.length-1].body.collideWorldBounds = true;
        cat.destroy();
        shared.currentCats++;
    }*/
    function spawnCar() {
        cars[cars.length] = game.add.sprite(Math.random() * game.world.width, game.world.height, 'car');
        game.physics.arcade.enable(cars);
        cars[cars.length - 1].body.rotation = 45;
        cars[cars.length - 1].body.velocity.y = -300;
    }
    return {
    
        create: function () {
            cars = [];
            game.stage.backgroundColor = "#FFFFFF";
            //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
            //game.physics.arcade.gravity.y = 300;
            // Create a sprite at the center of the screen using the 'logo' image.
            
            player = game.add.sprite(100, game.world.height - 200, 'player');
            for (var f = 0; f < game.world.width/100; f++) {
                blocks[f] = game.add.sprite(f*100, game.world.height - 100, 'box');
            }

            //powerUps[0] = game.add.sprite(game.world.centerX, game.world.centerY, 'cat');
            next = game.add.sprite(game.world.width-1, game.world.height - 200, 'box');
            prev = game.add.sprite(-99, game.world.height - 200, 'box');
            
            // Anchor the sprite at its center, as opposed to its top-left corner.
            // so it will be truly centered.
            player.anchor.setTo(0.5);
            game.physics.arcade.enable([player, next, prev]);
            game.physics.arcade.enable(blocks);

            // Turn on the arcade physics engine for this sprite.
            game.physics.enable(player, Phaser.Physics.ARCADE );
            // Make it bounce off of the world bounds.
            
            next.body.allowGravity = false;
            next.body.immovable = true;
            prev.body.allowGravity = false;
            prev.body.immovable = true;
            
            player.body.collideWorldBounds = true;
            for(var b = 0; b < blocks.length; b++) {
                blocks[b].body.allowGravity = false;
                blocks[b].body.immovable = true;
            }
        },
        
        update: function () {
            //text.text = "Cats: " + cats.length;
            //~~~~~~~~~~~~~~~~~~~~~collisions~~~~~~~~~~~~~~~~~~~~~//
            game.physics.arcade.collide(player, blocks);
            //game.physics.arcade.collide(cats, blocks);
            //game.physics.arcade.collide(player, powerUps, collect);
            game.physics.arcade.collide(player, next, nextLvl);
            game.physics.arcade.collide(player, prev, prevLvl);
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
            //~~~~~~~~~~~~~~~~~~~~~~~~~Player~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
            
            if (this.input.keyboard.createCursorKeys().right.isDown) {
                player.body.velocity.x += 15;
                player.scale.x = 1;
            }
            if (this.input.keyboard.createCursorKeys().left.isDown) {
                player.body.velocity.x -= 15;
                player.scale.x = -1;
            }
            if (this.input.keyboard.createCursorKeys().up.isDown) {
                player.body.velocity.y -= 15;
                //player.scale.y = -1;
            }
            if (this.input.keyboard.createCursorKeys().down.isDown) {
                player.body.velocity.y += 15;
                //player.scale.y = 1;
                
            }
            if (!this.input.keyboard.createCursorKeys().left.isDown && !this.input.keyboard.createCursorKeys().right.isDown && !this.input.keyboard.createCursorKeys().down.isDown && !this.input.keyboard.createCursorKeys().up.isDown) {
                player.body.rotation = 0;
            } else {
                if (wait % 10 == 0) {
                    if (playerSide) {
                        player.body.rotation = 20;
                        playerSide = false;
                    } else {
                        player.body.rotation = -20;
                        playerSide = true;
                    }
                }
            }
            if (cars.length != 0) {
                cars[cars.length - 1].body.rotation = 90;
            }
            player.body.velocity.x -= player.body.velocity.x * .1;
            player.body.velocity.y -= player.body.velocity.y * .1;
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//



            //~~~~~timer~~~~~//
            if (wait == 50) {
                wait = 0;
                spawnCar();
            }
            wait++;
            //~~~~~~~~~~~~~~//

            //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
            
            // Accelerate the 'logo' sprite towards the cursor,
            // accelerating at 500 pixels/second and moving no faster than 500 pixels/second
            // in X or Y.
            // This function returns the rotation angle that makes it visually match its
            // new trajectory.
            //bouncy.rotation = game.physics.arcade.accelerateToPointer( bouncy, game.input.activePointer, 500, 500, 500 );\
        }
    };
};