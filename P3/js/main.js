"use strict";

window.onload = function() {

	//	Create your Phaser game and inject it into the 'game' div.
	//	We did it in a window.onload event, but you can do it anywhere (requireJS load, anonymous function, jQuery dom ready, - whatever floats your boat)
	var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game' );

	//	Add the States your game has.
	//	You don't have to do this in the html, it could be done in your Boot state too, but for simplicity I'll keep it here.
	
	// An object for shared variables, so that them main menu can show
	// the high score if you want.
	var shared = { currentCats:0};
	
	game.state.add( 'Boot', GameStates.makeBoot( game ) );
	game.state.add( 'Preloader', GameStates.makePreloader( game ) );
	game.state.add('MainMenu', GameStates.makeMainMenu(game, shared));
	game.state.add('Lvl1', GameStates.makeLvlOne(game, shared));
	game.state.add('Lvl2', GameStates.makeLvlTwo(game, shared));
	game.state.add('Lvl3', GameStates.makeLvlThree(game, shared));
	game.state.add('Win', GameStates.makeWin(game, shared));
	//	Now start the Boot state.
	game.state.start('Boot');

};
