export enum CellState {
	Hidden,
	Visible,
	Flagged,
}

export default class GridCell {
	x: number;
	y: number;
	state: CellState;
	mine: boolean;
	value: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;

		this.state = CellState.Hidden;
		this.mine = false;
		this.value = 0;
	}
}
