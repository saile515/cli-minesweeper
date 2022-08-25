import GridCell, { CellState } from "./gridCell";

import { Game } from ".";

export default class Screen {
	game: Game;
	constructor(game: Game) {
		this.game = game;
		this.update();
	}

	update() {
		console.clear();
		let output: string[] = [];
		this.game.grid.forEach((cell) => {
			switch (cell.state) {
				case CellState.Visible:
					output.push(cell.value == 0 ? "   " : " " + cell.value.toString() + " ");
					break;
				case CellState.Flagged:
					output.push("I= ");
					break;
				case CellState.Hidden:
					output.push("[ ]");
					break;
			}
		});

		let outputStr = "     ";
		for (let i = 1; i <= this.game.width; i++) {
			outputStr += i >= 10 ? "" : " ";
			outputStr += i;
			outputStr += " ";
		}

		outputStr += "\n     ";

		for (let i = 1; i <= this.game.width; i++) {
			outputStr += "___";
		}

		for (let i = 0; i < this.game.height; i++) {
			outputStr += "\n";
			if (i < 9) outputStr += " ";
			outputStr += i + 1 + "  |";
			for (let l = 0; l < this.game.width; l++) {
				outputStr += output[i * this.game.width + l];
			}
		}

		console.log(outputStr);
	}
}
