import { Game } from "./game";

const width = parseInt(process.argv[2]) || 10;
const height = parseInt(process.argv[3]) || 10;
const mines = parseInt(process.argv[4]) || (width * height) / 4;

const game = new Game(width, height, mines);

while (!game.completed) {
	game.update();
}
