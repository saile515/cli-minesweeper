import GridCell, { CellState } from "./gridCell";

import Screen from "./screen";
import prompt from "prompt-sync";

export class Game {
	width: number;
	height: number;
	mines: number;
	minesPlaced: boolean;
	completed: boolean;

	grid: GridCell[];
	screen: Screen;

	constructor(width: number, height: number, mines: number) {
		this.width = width;
		this.height = height;
		this.grid = [];
		this.mines = mines;
		this.minesPlaced = false;
		this.completed = false;

		// Instantiate cells
		for (let y = 1; y <= this.height; y++) {
			for (let x = 1; x <= this.width; x++) {
				this.grid.push(new GridCell(x, y));
			}
		}

		this.screen = new Screen(this);

		let emptyCells = this.calculateEmptyCells();

		// Main input loop
		while (emptyCells != 0 && !this.completed) {
			const input: string[] = prompt()("Input (x, y, cmd): ").toString().split(" ");

			const x = parseInt(input[0]);
			const y = parseInt(input[1]);
			const cmd = input[2] == "flag" ? "flagCell" : input[2] == "pop" ? "clickCell" : null;

			// Invalid command
			if (!cmd) {
				console.log("Faulty input! Try again.");
				continue;
			}

			this[cmd!](x, y);

			emptyCells = this.calculateEmptyCells();

			if (emptyCells == 0) {
				console.log("You win!");
				this.completed = true;
			}

			if (!this.completed) this.screen.update();
		}
	}

	clickCell(x: number, y: number) {
		const cell = this.getCell(x, y);

		// Place mines
		if (!this.minesPlaced) {
			const neighbors = this.getNeighbors(cell, true);
			this.placeMines(neighbors);
			this.minesPlaced = true;
		}

		if (!cell) {
			console.log("No cell with those coordinates exist! Try again.");
			return;
		}

		if (cell.state != CellState.Hidden) {
			console.log("Cell can't be popped! Try again.");
			return;
		}

		if (cell.mine) {
			console.log("You lose!");
			this.completed = true;
			return;
		} else {
			cell.state = CellState.Visible;
		}

		if (cell.value == 0) {
			this.popNeighbors(cell);
		}
	}

	flagCell(x: number, y: number) {
		const cell = this.getCell(x, y);
		if (!cell) {
			console.log("No cell with those coordinates exist! Try again.");
			return;
		}

		if (cell.state == CellState.Flagged) {
			cell.state = CellState.Hidden;
		} else if (cell.state == CellState.Hidden) {
			cell.state = CellState.Flagged;
		} else {
			console.log("Cell can't be flagged, as it is already visible!");
		}
	}

	getCell(x: number, y: number) {
		return this.grid.find((cell) => cell.x == x && cell.y == y)!;
	}

	getNeighbors(cell: GridCell, includeSelf?: boolean) {
		const x = cell.x;
		const y = cell.y;

		const cells: GridCell[] = [];

		// Get cells in a 3x3 area (or smaller if near borders)
		for (let xCoord = x > 1 ? -1 : 0; xCoord <= (x < this.width ? 1 : 0); xCoord++) {
			for (let yCoord = y > 1 ? -1 : 0; yCoord <= (y < this.height ? 1 : 0); yCoord++) {
				if (x == xCoord && y == yCoord && !includeSelf) continue;
				const neighborCell = this.grid.find((item) => item.x == x + xCoord && item.y == y + yCoord)!;

				cells.push(neighborCell);
			}
		}

		return cells;
	}

	popNeighbors(cell: GridCell) {
		const neighbors = this.getNeighbors(cell);

		neighbors.forEach((item) => {
			if (item.state != CellState.Hidden) return;

			item.state = CellState.Visible;

			if (item.value == 0 && item.state) this.popNeighbors(item);
		});
	}

	placeMines(avoid?: GridCell[]) {
		const nonMineCells = this.grid.filter((cell) => !cell.mine);

		// Filter away avoided sells from cell pool
		if (avoid) {
			for (let i = 0; i < avoid.length; i++) {
				const index = nonMineCells.indexOf(avoid[i]);
				nonMineCells.splice(index, 1);
			}
		}

		// Place mines
		for (let i = 0; i < this.mines; i++) {
			const random = Math.floor(Math.random() * nonMineCells.length);
			nonMineCells[random].mine = true;
			nonMineCells.splice(random, 1);
		}

		// Calculate cell values
		this.grid.forEach((cell) => {
			const neighbors = this.getNeighbors(cell);
			let count = 0;
			neighbors.forEach((item) => (item.mine ? count++ : null));
			cell.value = count;
		});
	}

	calculateEmptyCells() {
		const emptyCells = this.grid.filter((cell) => cell.state != CellState.Visible && !cell.mine);
		return emptyCells ? emptyCells.length : 0;
	}
}

const width = parseInt(process.argv[2]) || 10;
const height = parseInt(process.argv[3]) || 10;
const mines = parseInt(process.argv[4]) || (width * height) / 4;

if (mines >= width * height) {
	console.log("Mines must be lower than grid size!");
	process.abort();
}

const game = new Game(width, height, mines);
