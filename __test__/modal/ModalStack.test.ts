import { describe, it, expect } from "vitest";
import ModalStack from "../../src/modal/ModalStack.js";

const child1 = "child1";
const child2 = "child2";
const child3 = "child3";

describe("ModalStack.add", () => {
	it("None visible", () => {
		ModalStack.add(child3, false, 3);
		ModalStack.add(child2, false, 2);
		ModalStack.add(child1, false, 1);
		expect(ModalStack.top()).toBe(0);
	});

	it("first visible", () => {
		ModalStack.add(child3, false, 3);
		ModalStack.add(child2, false, 2);
		ModalStack.add(child1, true, 1);
		expect(ModalStack.top()).toBe(1);
	});

	it("first and second visible", () => {
		ModalStack.add(child3, false, 3);
		ModalStack.add(child2, true, 2);
		ModalStack.add(child1, true, 1);
		expect(ModalStack.top()).toBe(2);
	});

	it("all visible", () => {
		ModalStack.add(child3, true, 3);
		ModalStack.add(child2, true, 2);
		ModalStack.add(child1, true, 1);
		expect(ModalStack.top()).toBe(3);
	});

	it("does not cause errors when adding twice", () => {
		ModalStack.add(child3, true, 3);
		ModalStack.add(child2, true, 2);
		ModalStack.add(child1, true, 1);
		expect(ModalStack.top()).toBe(3);

		ModalStack.add(child3, false, 3);
		ModalStack.add(child2, true, 2);
		ModalStack.add(child1, true, 1);
		expect(ModalStack.top()).toBe(2);
	});
});

describe("ModalStack.remove", () => {
	it("remove 3", () => {
		ModalStack.add(child3, true, 3);
		ModalStack.add(child2, true, 2);
		ModalStack.add(child1, true, 1);
		expect(ModalStack.top()).toBe(3);

		ModalStack.remove(child3);
		expect(ModalStack.top()).toBe(2);

		ModalStack.add(child3, true, 3);
		expect(ModalStack.top()).toBe(3);
	});

	// Impossible to do in the react ecosystem in a way that isn't transient,
	// but it shouldn't throw errors.  Since parents are unmounted first, there will
	// be transient cases where child components are still registered in the ModalStack
	it("remove parents before children is predictable and does not throw", () => {
		expect(() => {
			ModalStack.remove(child1);
			expect(ModalStack.top()).toBe(3);

			ModalStack.remove(child2);
			expect(ModalStack.top()).toBe(3);

			ModalStack.remove(child3);
			expect(ModalStack.top()).toBe(0);
		}).not.toThrow();
	});
});
