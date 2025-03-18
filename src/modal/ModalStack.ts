type Levels = { [level: number]: Set<string> };

const levels: Levels = {};

function add(id: string, visible: boolean, level: number): void {
	if (!levels[level]) {
		levels[level] = new Set();
	}

	const set = levels[level];

	if (visible) {
		set.add(id);
	} else {
		remove(id);
	}
}

function remove(id: string): void {
	for (const level in levels) {
		const set = levels[level]!;
		set?.delete(id);
		if (!set.size) {
			delete levels[level];
		}
	}
}

function top(): number {
	let max = 0;
	for (const level in levels) {
		max = Math.max(max, Number(level));
	}
	return max;
}

function isActiveModalLevel(componentLevel: number): boolean {
	const topLevel = top();
	return componentLevel === topLevel;
}

export default {
	add,
	remove,
	top,
	isActiveModalLevel,
};
