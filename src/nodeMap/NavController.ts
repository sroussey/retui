import assert from 'assert';

export type NodeMap<T extends string = string> = T[][];
export type Position = [number, number];
export type NavControllerAPI = Omit<
	{[P in keyof NavController]: NavController[P]},
	'goToIteration' | 'goToNodeName'
>;

export class NavController {
	private nav: NodeMap;
	private currPosition!: Position;
	private nameMap: {[name: string]: {position: Position; iteration: number}};
	private prevMap: {[name: string]: Position};
	private nextMap: {[name: string]: Position};
	private size: number;

	constructor(nav: NodeMap, startingNode?: string | number) {
		this.nav = nav;
		this.prevMap = {};
		this.nextMap = {};
		this.nameMap = {};
		this.size = 0;
		this.init(nav, startingNode);
	}

	private init = (nav: NodeMap, startingNode?: string | number): void => {
		let currStartPosition: Position | null = null;

		let prevPosition: Position | null = null;
		let prevName: string | null = null;

		let startPosition: Position | null = null;
		let startName: string | null = null;

		let size = 0;
		for (let y = 0; y < nav.length; ++y) {
			for (let x = 0; x < nav[y]!.length; ++x) {
				const name = nav[y]![x];
				const currPosition: [number, number] = [y, x];

				if (!name) continue;

				this.nameMap[name] = {position: currPosition, iteration: size};

				if (!currStartPosition) {
					currStartPosition = currPosition;
				}
				if (typeof startingNode === 'string' && startingNode === name) {
					currStartPosition = currPosition;
				}
				if (typeof startingNode === 'number' && startingNode === size) {
					currStartPosition = currPosition;
				}

				if (prevPosition === null) {
					startName = name;
					startPosition = currPosition;
				}

				if (prevName) {
					this.nextMap[prevName] = currPosition;
				}
				prevName = name;

				if (prevPosition) {
					this.prevMap[name] = prevPosition;
				}

				prevPosition = currPosition;
				++size;
			}
		}

		// prettier-ignore
		if (!startName || !prevPosition || !startPosition || !prevName || !currStartPosition) {
            // throw new Error("Invalid navigation initializer");
            this.size = size;
            this.currPosition = [-1, -1];
            return;
        }

		this.size = size;
		this.prevMap[startName] = prevPosition;
		this.nextMap[prevName] = startPosition;
		this.currPosition = currStartPosition;
	};

	public getLocation = (): string => {
		try {
			const [y, x] = this.currPosition;
			return this.nav[y]![x]!;
		} catch {
			return '';
		}
	};

	public getIteration = (): number => {
		const name = this.getLocation();

		return this.nameMap[name]?.iteration || -1;
	};

	public getSize = (): number => {
		return this.size;
	};

	public goToNode = (nextNode: string | number): string => {
		if (typeof nextNode === 'string') {
			return this.goToNodeName(nextNode);
		}
		if (typeof nextNode === 'number') {
			return this.goToIteration(nextNode);
		}

		return this.getLocation();
	};

	public goToIteration = (n: number): string => {
		if (n >= this.getSize() || n < 0) {
			return this.getLocation();
		}

		let nextCoords: Position | undefined = undefined;
		for (const name in this.nameMap) {
			if (this.nameMap[name]!.iteration === n) {
				nextCoords = this.nameMap[name]!.position;
				break;
			}
		}

		assert(nextCoords);
		this.currPosition = nextCoords;

		return this.getLocation();
	};

	// If it exists, move to the node with nodeName.  Otherwise stay put.  Return
	// the current node name after the move or lack thereof
	public goToNodeName = (nodeName: string): string => {
		for (let y = 0; y < this.nav.length; ++y) {
			for (let x = 0; x < this.nav[y]!.length; ++x) {
				const name = this.nav[y]![x];
				const currPosition: [number, number] = [y, x];

				if (name === nodeName) {
					this.currPosition = currPosition;
					return this.getLocation();
				}
			}
		}

		return this.getLocation();
	};

	private autoMove = (dir: -1 | 1): string => {
		const name = this.getLocation();
		if (name === '') return '';

		const nextCoords = dir < 0 ? this.prevMap[name] : this.nextMap[name];

		this.currPosition = nextCoords!;
		const nextName = this.getLocation();

		return nextName;
	};

	public next = (): string => {
		return this.autoMove(1);
	};

	public prev = (): string => {
		return this.autoMove(-1);
	};

	private move = (dy: number, dx: number): string => {
		const [y, x] = this.currPosition;
		const ny = y + dy;
		let nx = x + dx;

		if (this.nav[ny]?.[nx]) {
			this.currPosition = [ny, nx];
		}

		if (this.nav[ny]?.[nx] === undefined) {
			if (this.nav[ny]?.length === 0 || nx <= 0) {
				return this.getLocation();
			}

			while (this.nav[ny] && nx > this.nav[ny].length - 1) {
				--nx;
			}

			if (this.nav[ny]?.[nx]) {
				this.currPosition = [ny, nx];
			}
		}

		const name = this.getLocation();

		return name;
	};

	public up = (): string => {
		return this.move(-1, 0);
	};

	public down = (): string => {
		return this.move(1, 0);
	};

	public right = (): string => {
		return this.move(0, 1);
	};

	public left = (): string => {
		return this.move(0, -1);
	};
}
