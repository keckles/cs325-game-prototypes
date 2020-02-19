"use strict";

function make_main_game_state(game) {
    function preload() {
        // Load an image and call it 'logo'.
        game.load.image('map', 'assets/map.png');
        game.load.image('ghost', 'assets/ghost.png');
        game.load.physics('physicsData', 'assets/map.json');
    }

    var map;
    var ghost;
    var dead = true;
    var keys;
    function create() {

        this.game.physics.startSystem(Phaser.Physics.P2JS);
        game.stage.backgroundColor = "#FFFFFF";
        keys = this.input.keyboard.createCursorKeys();
        // Create a sprite at the center of the screen using the 'logo' image.
        map = game.add.sprite(0, 0, 'map');
        ghost = game.add.sprite(game.world.centerX, game.world.centerY, 'ghost');
        game.physics.p2.enable([map, ghost], true);
        map.body.clearShapes();
        map.body.loadPolygon('physicsData', 'map');

        game.physics.p2.gravity.y = -300;
        /*this.game.physics.p2.enable(map, Phaser.Physics.ARCADE);
        this.game.physics.p2.enable(ghost, Phaser.Physics.ARCADE);*/
        
        map.body.collideWorldBounds = false;
        //this.physics.add.collider(map, ghost);
        
        // Anchor the sprite at its center, as opposed to its top-left corner.
        // so it will be truly centered.
        
        // Add some text using a CSS style.
        // Center it in X, and position its top 15 pixels from the top of the world.
        var style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
        var text = game.add.text(game.world.centerX, 15, "Build something amazing.", style);
        text.anchor.setTo(0.5, 0.0);
    }

    function update() {
        //game.physics.arcade.collide(map, ghost);
        // Accelerate the 'logo' sprite towards the cursor,
        // accelerating at 500 pixels/second and moving no faster than 500 pixels/second
        // in X or Y.
        // This function returns the rotation angle that makes it visually match its
        // new trajectory.
        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            dead = !dead;
        }
        ghost.body.data.gravityScale = 0;
        if (dead) {
            map.body.data.gravityScale = 0;
            if (keys.left.isDown) {
                
                map.body.x += 5;
            }
            if (keys.right.isDown) {
                map.body.x -= 5;
            }
            if (keys.down.isDown) {
                map.body.y -= 5;
            }
            if (keys.up.isDown) {
                map.body.y += 5;
            }
        } else {
            map.body.data.gravityScale = 1;
            if (keys.left.isDown) {
                map.body.x += 5;
            }
            if (keys.right.isDown) {
                map.body.x -= 5;
            }
            //if () {
            //map.body.setVelocityY(5);
            //}
            if (keys.up.isDown) {
                map.body.y += 5;
            }
        }
    }

    return {
        "preload": preload, "create": create, "update": update
    };
}

window.onload = function() {
    // You might want to start with a template that uses GameStates:
    //     https://github.com/photonstorm/phaser/tree/v2.6.2/resources/Project%20Templates/Basic
    
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game' );
    
    game.state.add( "main", make_main_game_state( game ) );
    
    game.state.start( "main" );
};
