import GridCell, { CellState } from "./gridCell";

import Screen from "./screen";
import prompt from "prompt-sync";

export class Game {
	width: number;
	height: number;
	mines: number;
	lost: boolean;

	grid: GridCell[];
	screen: Screen;

	constructor(width: number, height: number, mines: number) {
		const gridSize = width * height;
		this.width = width;
		this.height = height;
		this.grid = [];
		this.mines = mines;
		this.lost = false;

		// Instantiate cells
		for (let y = 1; y <= this.height; y++) {
			for (let x = 1; x <= this.width; x++) {
				this.grid.push(new GridCell(x, y));
			}
		}

		// Place mines
		for (let i = 0; i < this.mines; i++) {
			const nonMineCells = this.grid.filter((cell) => !cell.mine);
			const random = Math.floor(Math.random() * nonMineCells.length);
			nonMineCells[random].mine = true;
		}

		// Calculate cell values
		this.grid.forEach((cell) => {
			let count = 0;
			for (let x = cell.x > 1 ? -1 : 0; x <= (cell.x < this.width ? 1 : 0); x++) {
				for (let y = cell.y > 1 ? -1 : 0; y <= (cell.y < this.height ? 1 : 0); y++) {
					if (x == 0 && y == 0) continue;

					const neighborCell = this.grid.find((item) => item.x == x + cell.x && item.y == y + cell.y);

					if (neighborCell?.mine) count++;
				}
			}
			cell.value = count;
		});

		console.log(width * height, this.grid.length);

		this.screen = new Screen(this);

		let emptyCells = this.calculateEmptyCells();

		while (emptyCells != 0 && !this.lost) {
			const input: string[] = prompt()("Input: ").toString().split(" ");

			const x = parseInt(input[0]);
			const y = parseInt(input[1]);
			const func = input[2] == "flag" ? "flagCell" : input[2] == "pop" ? "clickCell" : null;

			if (!func) {
				console.log("Faulty input! Try again.");
				continue;
			}

			this[func!](x, y);
			emptyCells = this.calculateEmptyCells();
			if (!this.lost) this.screen.update();
		}
	}

	clickCell(x: number, y: number) {
		const cell = this.grid.find((cell) => cell.x == x && cell.y == y)!;
		if (!cell) {
			console.log("No cell with those coordinates exist! Try again.");
			return;
		}

		if (cell.state != CellState.Hidden) {
			console.log("Cell already popped! Try again.");
			return;
		}

		if (cell.mine) {
			console.log("You lose!");
			this.lost = true;
			return;
		} else {
			cell.state = CellState.Visible;
		}
	}

	flagCell(x: number, y: number) {
		const cell = this.grid.find((cell) => cell.x == x && cell.y == y)!;
		if (!cell) {
			console.log("No cell with those coordinates exist! Try again.");
			return;
		}

		if (cell.state == CellState.Flagged) {
			cell.state = CellState.Hidden;
		} else {
			cell.state = CellState.Flagged;
		}
	}

	calculateEmptyCells() {
		const emptyCells = this.grid.filter((cell) => cell.state != CellState.Visible && !cell.mine);
		return emptyCells ? emptyCells.length : 0;
	}
}

const game = new Game(10, 10, 30);
