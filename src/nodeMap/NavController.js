import assert from 'assert';
export class NavController {
	constructor(nav, startingNode) {
		this.init = (nav, startingNode) => {
			let currStartPosition = null;
			let prevPosition = null;
			let prevName = null;
			let startPosition = null;
			let startName = null;
			let size = 0;
			for (let y = 0; y < nav.length; ++y) {
				for (let x = 0; x < nav[y].length; ++x) {
					const name = nav[y][x];
					const currPosition = [y, x];
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
		this.getLocation = () => {
			try {
				const [y, x] = this.currPosition;
				return this.nav[y][x];
			} catch (_a) {
				return '';
			}
		};
		this.getIteration = () => {
			var _a;
			const name = this.getLocation();
			return (
				((_a = this.nameMap[name]) === null || _a === void 0
					? void 0
					: _a.iteration) || -1
			);
		};
		this.getSize = () => {
			return this.size;
		};
		this.goToNode = nextNode => {
			if (typeof nextNode === 'string') {
				return this.goToNodeName(nextNode);
			}
			if (typeof nextNode === 'number') {
				return this.goToIteration(nextNode);
			}
			return this.getLocation();
		};
		this.goToIteration = n => {
			if (n >= this.getSize() || n < 0) {
				return this.getLocation();
			}
			let nextCoords = undefined;
			for (const name in this.nameMap) {
				if (this.nameMap[name].iteration === n) {
					nextCoords = this.nameMap[name].position;
					break;
				}
			}
			assert(nextCoords);
			this.currPosition = nextCoords;
			return this.getLocation();
		};
		// If it exists, move to the node with nodeName.  Otherwise stay put.  Return
		// the current node name after the move or lack thereof
		this.goToNodeName = nodeName => {
			for (let y = 0; y < this.nav.length; ++y) {
				for (let x = 0; x < this.nav[y].length; ++x) {
					const name = this.nav[y][x];
					const currPosition = [y, x];
					if (name === nodeName) {
						this.currPosition = currPosition;
						return this.getLocation();
					}
				}
			}
			return this.getLocation();
		};
		this.autoMove = dir => {
			const name = this.getLocation();
			if (name === '') return '';
			const nextCoords = dir < 0 ? this.prevMap[name] : this.nextMap[name];
			this.currPosition = nextCoords;
			const nextName = this.getLocation();
			return nextName;
		};
		this.next = () => {
			return this.autoMove(1);
		};
		this.prev = () => {
			return this.autoMove(-1);
		};
		this.move = (dy, dx) => {
			var _a, _b, _c, _d;
			const [y, x] = this.currPosition;
			const ny = y + dy;
			let nx = x + dx;
			if ((_a = this.nav[ny]) === null || _a === void 0 ? void 0 : _a[nx]) {
				this.currPosition = [ny, nx];
			}
			if (
				((_b = this.nav[ny]) === null || _b === void 0 ? void 0 : _b[nx]) ===
				undefined
			) {
				if (
					((_c = this.nav[ny]) === null || _c === void 0
						? void 0
						: _c.length) === 0 ||
					nx <= 0
				) {
					return this.getLocation();
				}
				while (this.nav[ny] && nx > this.nav[ny].length - 1) {
					--nx;
				}
				if ((_d = this.nav[ny]) === null || _d === void 0 ? void 0 : _d[nx]) {
					this.currPosition = [ny, nx];
				}
			}
			const name = this.getLocation();
			return name;
		};
		this.up = () => {
			return this.move(-1, 0);
		};
		this.down = () => {
			return this.move(1, 0);
		};
		this.right = () => {
			return this.move(0, 1);
		};
		this.left = () => {
			return this.move(0, -1);
		};
		this.nav = nav;
		this.prevMap = {};
		this.nextMap = {};
		this.nameMap = {};
		this.size = 0;
		this.init(nav, startingNode);
	}
}
