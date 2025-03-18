import { describe, expect, test } from "vitest";
import { NodeMap } from "../../src/index.js";
import { NavController } from "../../src/nodeMap/NavController.js";
import assert from "assert";

const deepEqual = (a: any, b: any) => {
	try {
		assert.deepStrictEqual(a, b);
		return true;
	} catch {
		return false;
	}
};

// prettier-ignore
const map: NodeMap = [
    ["a", "b"],
    ["c"],
    ["d"],
    ["e"],
    ["f", "g"],
    ["h"],
];

describe("Starting node in constructor", () => {
	test("a", () => {
		const nav = new NavController(map, "a");
		expect(nav.getLocation()).toBe("a");
	});
	test("b", () => {
		const nav = new NavController(map, "b");
		expect(nav.getLocation()).toBe("b");
	});
	test("c", () => {
		const nav = new NavController(map, "c");
		expect(nav.getLocation()).toBe("c");
	});

	test("iteration 0", () => {
		const nav = new NavController(map, 0);
		expect(nav.getLocation()).toBe("a");
	});
	test("iteration 1", () => {
		const nav = new NavController(map, 1);
		expect(nav.getLocation()).toBe("b");
	});
	test("iteration 2", () => {
		const nav = new NavController(map, 2);
		expect(nav.getLocation()).toBe("c");
	});

	test("invalid starting node defaults safely", () => {
		const nav = new NavController(map, "z");
		expect(nav.getLocation()).toBe("a");
	});
});

describe("Handles different initializers", () => {
	test("Empty initializer '[[]]' does not throw error", () => {
		const map = [[]];
		expect(() => {
			new NavController(map);
		}).not.toThrow();
	});

	test("Empty initializer '[]' does not throw error", () => {
		const map = [[]];
		expect(() => {
			new NavController(map);
		}).not.toThrow();
	});

	test("Empty initializer '[[]]' always returns ''", () => {
		const map = [[]];
		const nav = new NavController(map);

		expect(nav.getLocation()).toBe("");
		expect(nav.next()).toBe("");
		expect(nav.prev()).toBe("");
		expect(nav.goToNode(0)).toBe("");
		expect(nav.left()).toBe("");
		expect(nav.right()).toBe("");
		expect(nav.down()).toBe("");
		expect(nav.up()).toBe("");
	});

	test("Empty initializer '[]' always returns ''", () => {
		const map: string[][] = [];
		const nav = new NavController(map);

		expect(nav.getLocation()).toBe("");
		expect(nav.next()).toBe("");
		expect(nav.prev()).toBe("");
		expect(nav.goToNode(0)).toBe("");
		expect(nav.left()).toBe("");
		expect(nav.right()).toBe("");
		expect(nav.down()).toBe("");
		expect(nav.up()).toBe("");
	});

	test("Single node does not throw error", () => {
		const map = [["a"]];
		expect(() => {
			new NavController(map);
		}).not.toThrow();

		const nav = new NavController(map);
		expect(nav.getLocation()).toBe("a");
		expect(nav.up()).toBe("a");
		expect(nav.down()).toBe("a");
		expect(nav.left()).toBe("a");
		expect(nav.right()).toBe("a");
		expect(nav.next()).toBe("a");
		expect(nav.prev()).toBe("a");
	});
});

describe("goToNode()", () => {
	const map = [
		["0", "1"],
		["2", "3"],
	];
	const nav = new NavController(map);

	test("Out of range", () => {
		expect(nav.goToNode(4)).toBe("0");
		expect(nav.goToNode(5)).toBe("0");
		expect(nav.goToNode(6)).toBe("0");
		expect(nav.goToNode(7)).toBe("0");
	});

	test("In range", () => {
		expect(nav.goToNode(0)).toBe("0");
		expect(nav.goToNode(1)).toBe("1");
		expect(nav.goToNode(2)).toBe("2");
		expect(nav.goToNode(3)).toBe("3");
		expect(nav.goToNode(0)).toBe("0");
	});
});

test("up, down, left, right", () => {
	const nav = new NavController(map);
	expect(nav.up()).toBe("a");
	expect(nav.up()).toBe("a");
	expect(nav.right()).toBe("b");
	expect(nav.right()).toBe("b");
	expect(nav.left()).toBe("a");
	expect(nav.left()).toBe("a");
	expect(nav.right()).toBe("b");
	expect(nav.down()).toBe("c");
	expect(nav.up()).toBe("a");
	expect(nav.up()).toBe("a");
	expect(nav.down()).toBe("c");
	expect(nav.down()).toBe("d");
	expect(nav.down()).toBe("e");
	expect(nav.down()).toBe("f");
	expect(nav.right()).toBe("g");
	expect(nav.right()).toBe("g");
	expect(nav.down()).toBe("h");
});

test("Will either travel to a valid node, or not travel at all", () => {
	const nav = new NavController(map);
	expect(nav.right()).not.toBe(null);
	expect(nav.right()).not.toBe(null);
	expect(nav.right()).not.toBe(null);
	expect(nav.right()).not.toBe(null);
	expect(nav.left()).not.toBe(null);
	expect(nav.left()).not.toBe(null);
	expect(nav.left()).not.toBe(null);
	expect(nav.left()).not.toBe(null);
	expect(nav.down()).not.toBe(null);
	expect(nav.down()).not.toBe(null);
	expect(nav.down()).not.toBe(null);
	expect(nav.down()).not.toBe(null);
	expect(nav.down()).not.toBe(null);
	expect(nav.down()).not.toBe(null);
	expect(nav.down()).not.toBe(null);
	expect(nav.down()).not.toBe(null);
	expect(nav.down()).not.toBe(null);
	expect(nav.left()).not.toBe(null);
	expect(nav.left()).not.toBe(null);
	expect(nav.left()).not.toBe(null);
	expect(nav.left()).not.toBe(null);
	expect(nav.left()).not.toBe(null);
	expect(nav.right()).not.toBe(null);
	expect(nav.right()).not.toBe(null);
	expect(nav.right()).not.toBe(null);
	expect(nav.right()).not.toBe(null);
	expect(nav.right()).not.toBe(null);
	expect(nav.right()).not.toBe(null);
	expect(nav.right()).not.toBe(null);
	expect(nav.up()).not.toBe(null);
	expect(nav.up()).not.toBe(null);
	expect(nav.up()).not.toBe(null);
	expect(nav.up()).not.toBe(null);
	expect(nav.up()).not.toBe(null);
	expect(nav.up()).not.toBe(null);
});

describe("getNodeIndex(name)", () => {
	test("one cell per node", () => {
		const map = [
			["a", "b"],
			["c", "d"],
			["e", "f"],
		];
		const nav = new NavController(map);
		expect(nav.getNodeIndex("a")).toBe(0);
		expect(nav.getNodeIndex("b")).toBe(1);
		expect(nav.getNodeIndex("c")).toBe(2);
		expect(nav.getNodeIndex("d")).toBe(3);
		expect(nav.getNodeIndex("e")).toBe(4);
		expect(nav.getNodeIndex("f")).toBe(5);
	});

	test("nodes may stretch cells", () => {
		const map = [
			["a", "a"],
			["b", "b"],
			["c", "c"],
		];
		const nav = new NavController(map);
		expect(nav.getNodeIndex("a")).toBe(0);
		expect(nav.getNodeIndex("b")).toBe(1);
		expect(nav.getNodeIndex("c")).toBe(2);
	});
});

describe("next, prev functions", () => {
	const map: string[][] = [
		["1", "2"],
		["3", "4"],
	];
	const nav = new NavController(map);

	test("NEXT: 1 => 2", () => {
		expect(nav.next()).toBe("2");
	});
	test("NEXT: 2 => 3", () => {
		expect(nav.next()).toBe("3");
	});
	test("NEXT: 3 => 4", () => {
		expect(nav.next()).toBe("4");
	});
	test("NEXT: 4 => 1", () => {
		expect(nav.next()).toBe("1");
	});
	test("PREV: 1 => 4", () => {
		expect(nav.prev()).toBe("4");
	});
	test("PREV: 4 => 3", () => {
		expect(nav.prev()).toBe("3");
	});
	test("PREV: 3 => 2", () => {
		expect(nav.prev()).toBe("2");
	});
});

describe("stretched node cells and irregular maps", () => {
	// Some maps are not predictable.  b->down can be either d or c
	// 	["b", "b"],
	// 	["b", "c"],
	// 	["d", "e"],

	// However, maps should be able to be irregular and stretch cells while still
	// being predictable.

	// prettier-ignore
	const mapA = [
		["a"],
		["b", "b", "b", "b", "c"],
		["d", "d", "d", "d", "d"]
	]

	describe("mapA", () => {
		const nav = new NavController(mapA);
		test("next", () => {
			expect(nav.getLocation()).toBe("a");
			expect(nav.next()).toBe("b");
			expect(nav.next()).toBe("c");
			expect(nav.next()).toBe("d");
		});
		test("prev", () => {
			expect(nav.prev()).toBe("c");
			expect(nav.prev()).toBe("b");
			expect(nav.prev()).toBe("a");
		});
		test("directions", () => {
			expect(nav.right()).toBe("a");
			expect(nav.down()).toBe("b");
			expect(nav.right()).toBe("c");
			expect(nav.right()).toBe("c");
			expect(nav.down()).toBe("d");
			expect(nav.up()).toBe("c");
			expect(nav.left()).toBe("b");
			expect(nav.up()).toBe("a");
		});
	});
});

describe("getSize", () => {
	const mapA = [["1"], ["2"], ["3"], ["4"], ["5"], ["6"]];
	const mapB = [
		["1", "1", "1"],
		["2", "3", "4"],
	];
	test("normal cells", () => {
		const nav = new NavController(mapA);
		expect(nav.getSize()).toBe(6);
	});
	test("stretched cells", () => {
		const nav = new NavController(mapB);
		expect(nav.getSize()).toBe(4);
	});
});

describe("util: deepEqual", () => {
	describe("equal", () => {
		test("1", () => {
			const map1 = [["1", "2"], ["3"]];
			const map2 = [["1", "2"], ["3"]];
			expect(deepEqual(map1, map2)).toBe(true);
		});
		test("2", () => {
			const map1 = [["1", "2"], ["3", "4", "5"], [], ["6"]];
			const map2 = [["1", "2"], ["3", "4", "5"], [], ["6"]];
			expect(deepEqual(map1, map2)).toBe(true);
		});
	});

	describe("not equal", () => {
		test("height desc", () => {
			const map1 = [["1", "2"], ["3"], ["4"]];
			const map2 = [["1", "2"], ["3"]];
			expect(deepEqual(map1, map2)).toBe(false);
		});
		test("height asc", () => {
			const map1 = [["1", "2"], ["3"]];
			const map2 = [["1", "2"], ["3", "4", "5"], [], ["6"]];
			expect(deepEqual(map1, map2)).toBe(false);
		});
		test("width asc", () => {
			const map1 = [["1"], ["3"]];
			const map2 = [["1", "2"], ["3"]];
			expect(deepEqual(map1, map2)).toBe(false);
		});
		test("width desc", () => {
			const map1 = [["1", "2"], ["3"]];
			const map2 = [["1"], ["3"]];
			expect(deepEqual(map1, map2)).toBe(false);
		});
	});
});
