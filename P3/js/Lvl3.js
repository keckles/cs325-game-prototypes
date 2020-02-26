"use strict";

GameStates.makeLvlThree = function( game, shared ) {
    // Create your own variables.
    var player = null;
    var blocks = [];
    var cats = [];
    var catSides = [];
    var powerUps = [];
    var playerSide = true;
    var wait = 0;
    var next;
    var prev;
    var text;
    function nextLvl() {
        game.state.start("Win");
    }
    function prevLvl() {
        game.state.start("Lvl1");
    }
    function collect(player, cat) {
        cats[cats.length] = game.add.sprite(cat.body.position.x, cat.body.position.y, 'cat');
        catSides[cats.length-1] = Math.random() >= .5;
        cats[cats.length - 1].anchor.setTo(0.5);
        game.physics.arcade.enable(cats);
        cats[cats.length-1].body.collideWorldBounds = true;
        cat.destroy();
        shared.currentCats++;
    }
    return {
    
        create: function () {
            console.log(shared.currentCats);
            powerUps = [];
            cats = [];
            game.stage.backgroundColor = "#FFFFFF";
            //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
            game.physics.arcade.gravity.y = 300;
            // Create a sprite at the center of the screen using the 'logo' image.
            
            player = game.add.sprite(50, game.world.height - 200, 'player');
            for (var f = 0; f < game.world.width/100; f++) {
                blocks[f] = game.add.sprite(f*100, game.world.height - 100, 'box');
            }
            blocks[f + 1] = blocks[f] = game.add.sprite(game.world.centerX + 100, game.world.height - 200, 'box');
            blocks[f + 2] = blocks[f] = game.add.sprite(game.world.centerX-100, game.world.centerY, 'box');
            blocks[f + 3] = blocks[f] = game.add.sprite(100, 200, 'box');
            blocks[f + 4] = blocks[f] = game.add.sprite(game.world.centerX, game.world.centerY-200, 'box');
            powerUps[0] = game.add.sprite(game.world.width-100, 100, 'cat');
            next = game.add.sprite(game.world.width - 1, game.world.height - 200, 'box');
            blocks[f+5] = game.add.sprite(-100, game.world.height - 200, 'box');
            
            // Anchor the sprite at its center, as opposed to its top-left corner.
            // so it will be truly centered.
            player.anchor.setTo(0.5);
            game.physics.arcade.enable([player, next/*, prev*/]);

            for (var p = 0; p < shared.currentCats; p++) {
                cats[p] = game.add.sprite(player.body.position.x, player.body.position.y, 'cat');
                catSides[p] = Math.random() >= .5;
                cats[p].anchor.setTo(0.5);
            }

            game.physics.arcade.enable(blocks);
            game.physics.arcade.enable(cats);
            game.physics.arcade.enable(powerUps);

            // Turn on the arcade physics engine for this sprite.
            game.physics.enable(player, Phaser.Physics.ARCADE );
            // Make it bounce off of the world bounds.

            next.body.allowGravity = false;
            next.body.immovable = true;
            //prev.body.allowGravity = false;
            //prev.body.immovable = true;


            for (var p = 0; p < powerUps.length; p++) {
                powerUps[p].body.allowGravity = false;
                powerUps[p].body.immovable = true;
            }
            for (var c = 0; c < cats.length; c++) {
                cats[c].body.collideWorldBounds = true;
            }
            //player.body.collideWorldBounds = true;
            for(var b = 0; b < blocks.length; b++) {
                blocks[b].body.allowGravity = false;
                blocks[b].body.immovable = true;
            }
            // Add some text using a CSS style.
            // Center it in X, and position its top 15 pixels from the top of the world.
             var style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
             text = game.add.text( game.world.centerX, 15, "Cats: "+cats.length, style );
             //text.anchor.setTo( 0.5, 0.0 );
            
            // When you click on the sprite, you go back to the MainMenu.
            // player.inputEnabled = true;
            // player.events.onInputDown.add(function () { quitGame(); }, this);
            
        },
        
        update: function () {
            text.text = "Cats: " + cats.length;
            //~~~~~~~~~~~~~~~~~~~~~collisions~~~~~~~~~~~~~~~~~~~~~//
            game.physics.arcade.collide(player, blocks);
            game.physics.arcade.collide(cats, blocks);
            game.physics.arcade.collide(player, powerUps, collect);
            game.physics.arcade.collide(player, next, nextLvl);
            //game.physics.arcade.collide(player, prev, prevLvl);
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//


            //~~~~~~~~~~~~~~~~~~~~~~~~~Player~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
            
            if (this.input.keyboard.createCursorKeys().right.isDown) {
                player.body.velocity.x += 15;
                player.scale.x = 1;
                if (wait == 10) {
                    if (playerSide) {
                        player.body.rotation = 20;
                        playerSide = false;
                    } else {
                        player.body.rotation = -20;
                        playerSide = true;
                    }
                }
            }
            if (this.input.keyboard.createCursorKeys().left.isDown) {
                player.body.velocity.x -= 15;
                player.scale.x = -1;
                if (wait == 10) {
                    if (playerSide) {
                        player.body.rotation = 20;
                        playerSide = false;
                    } else {
                        player.body.rotation = -20;
                        playerSide = true;
                    }
                }
            }
            if (!this.input.keyboard.createCursorKeys().left.isDown && !this.input.keyboard.createCursorKeys().right.isDown) {
                player.body.rotation = 0;
            }
            if (this.input.keyboard.createCursorKeys().up.isDown && (player.body.onFloor() || player.body.touching.down)) {
                player.body.velocity.y = -300;
            }
            player.body.velocity.x -= player.body.velocity.x * .1;
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//



            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Cats~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
            for (var c = 0; c < cats.length; c++) {
                if (cats[c].body.position.x < player.body.position.x-(c+1)*100*Math.sign(player.body.velocity.x)) {
                    cats[c].body.velocity.x += 15;
                    if (cats[c].body.touching.right) {
                        cats[c].body.velocity.y = -200;
                    }
                } else {
                    cats[c].body.velocity.x -= 15;
                    if (cats[c].body.touching.left) {
                        cats[c].body.velocity.y = -200;
                    }
                }
                cats[c].body.velocity.x -= cats[c].body.velocity.x * .1;
                if (Math.abs(cats[c].body.velocity.x) > 50) {
                    cats[c].scale.x = Math.sign(cats[c].body.velocity.x);

                    if (wait == 10) {
                        if (catSides[c]) {
                            cats[c].body.rotation = 10;
                            catSides[c] = false;
                        } else {
                            cats[c].body.rotation = -10;
                            catSides[c] = true;
                        }
                    }

                } else {
                    cats[c].body.rotation = 0;
                }
            }
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//


            //~~~~~~~~~~~~~~~~~~~~~~~~~~PowerUps~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
            /*for (var p = 0; p < powerUps.length; p++) {

            }*/
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

            


            //~~~~~timer~~~~~//
            if (wait == 10) {
                wait = 0;
                
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
