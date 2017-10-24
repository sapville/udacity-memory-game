# Gameplay
## Description
The goal of the game is opening all the tiles. There is a pair for each tile - one with the same icon on it. Clicking on a tile a player can reveal its icon. Clicking on another tile a player checks if the icons of this tile and a previously opened one match. If this is the case the both tiles open. Otherwise, they close.
## Features
- A player can choose the number of tiles hence the difficulty level.
- Before the game begins a player will be given a chance to throw a look at opened tiles. The time to take the picture in depends on the number of tiles.
- An attempt to match (of two clicks) makes up a move. The move counter is placed at the left upper corner.
- Under the title the star rating is situated. Depending on the time and the number of moves a player earns one, two or tree stars.
- Clicking on link 'Restart' a player can either reset the game with the same number of tiles or return to the initial form and set another number (may be more challenging).

# Program
## Used libraries and frameworks
- jQuery, v3.2.1
- Bootstrap, v3.37
- [js-url](https://github.com/websanova/js-url) (url parsing)
## Structure
The program consists of an entry point, function `main` and a set of classes: `App`, `Table`, `Cell`, `Timer`, `Moves`, `Stars`
### Function `main`
The function is called after the document is loaded. Inside the instance of class `App` is created.
### Class `App`
This class is a container for all the principal elements of the application. It serves as an integrator and is responsible for their interaction.
### Class `Table`
The class contains a set of cells. Populate a table, distribute icons and manages cells' behavior.
### Class `Cell`
The class renders a cell, keeps its status and provides methods to change its state.
### Class `Timer`
The class is responsible for time and a timer. It starts the game via raising event `timeUp`, which is handled in `App` class.
### Classes `Moves` and `Stars`
Simple classes utilizing the respective functions.
