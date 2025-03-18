import React from "react";
import { render, act } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import assert from "assert";
import { Controls, View, newArr } from "./View.js";

describe("Does not go out of bounds", () => {
	const ctl: { current: Controls } = {} as { current: Controls };

	render(<View ctl={ctl} startHeight={3} startItems={newArr(5)} />);

	test("Assigns to ctl", () => {
		expect(() => {
			assert(ctl.current);
		}).not.toThrow();
	});

	test("nextItem", () => {
		expect(ctl.current.list.control.currentIndex).toBe(0);
		act(ctl.current.list.control.nextItem);
		expect(ctl.current.list.control.currentIndex).toBe(1);
		act(ctl.current.list.control.nextItem);
		expect(ctl.current.list.control.currentIndex).toBe(2);
		act(ctl.current.list.control.nextItem);
		expect(ctl.current.list.control.currentIndex).toBe(3);
		act(ctl.current.list.control.nextItem);
		expect(ctl.current.list.control.currentIndex).toBe(4);
	});

	test("nextItem at end", () => {
		act(ctl.current.list.control.nextItem);
		act(ctl.current.list.control.nextItem);
		expect(ctl.current.list.control.currentIndex).toBe(4);
	});

	test("prevItem", () => {
		act(ctl.current.list.control.prevItem);
		expect(ctl.current.list.control.currentIndex).toBe(3);
		act(ctl.current.list.control.prevItem);
		expect(ctl.current.list.control.currentIndex).toBe(2);
		act(ctl.current.list.control.prevItem);
		expect(ctl.current.list.control.currentIndex).toBe(1);
		act(ctl.current.list.control.prevItem);
		expect(ctl.current.list.control.currentIndex).toBe(0);
	});

	test("prevItem at start", () => {
		act(ctl.current.list.control.prevItem);
		act(ctl.current.list.control.prevItem);
		expect(ctl.current.list.control.currentIndex).toBe(0);
	});

	test("goToIndex", () => {
		act(() => ctl.current.list.control.goToIndex(4));
		expect(ctl.current.list.control.currentIndex).toBe(4);
		act(() => ctl.current.list.control.goToIndex(1));
		expect(ctl.current.list.control.currentIndex).toBe(1);
	});

	test("goToIndex out of range", () => {
		act(() => ctl.current.list.control.goToIndex(-5));
		expect(ctl.current.list.control.currentIndex).toBe(1);
		act(() => ctl.current.list.control.goToIndex(10));
		expect(ctl.current.list.control.currentIndex).toBe(1);
	});

	const setItems = () => {
		act(() => ctl.current.list.setItems(newArr(20)));
		expect(ctl.current.list.items.length).toBe(20);
		act(() => ctl.current.list.control.goToIndex(19));
		expect(ctl.current.list.control.currentIndex).toBe(19);
	};

	test("delete at current idx", () => {
		setItems();

		expect(() => {
			for (let i = 0; i < 100; ++i) {
				act(() => ctl.current.delIdx(ctl.current.list.control.currentIndex));
			}
		}).not.toThrow();
	});

	test("delete at end", () => {
		setItems();

		expect(() => {
			for (let i = 0; i < 100; ++i) {
				act(() => ctl.current.delEnd());
			}
		}).not.toThrow();
	});

	test("delete at start", () => {
		expect(ctl.current.list.items.length).toBe(0);
		setItems();

		expect(() => {
			for (let i = 0; i < 100; ++i) {
				act(() => ctl.current.delStart());
			}
		}).not.toThrow();
	});

	test("add at current idx", () => {
		setItems();

		expect(() => {
			for (let i = 0; i < 100; ++i) {
				act(() => ctl.current.addIdx(ctl.current.list.control.currentIndex));
			}
		}).not.toThrow();
	});

	test("add at start", () => {
		setItems();

		expect(() => {
			for (let i = 0; i < 100; ++i) {
				act(() => ctl.current.addStart());
			}
		}).not.toThrow();
	});

	test("add at end", () => {
		setItems();

		expect(() => {
			for (let i = 0; i < 100; ++i) {
				act(() => ctl.current.addEnd());
			}
		}).not.toThrow();
	});

	test("Does not throw on certain deletions/resizes", () => {
		setItems();

		expect(() => {
			// narrow window, then widen with less length than prev index
			act(() => ctl.current.list.setItems(newArr(0)));
			act(() => ctl.current.list.setItems(newArr(5)));
		}).not.toThrow();
	});

	test("Does not throw on certain deletions/resizes", () => {
		setItems();

		expect(() => {
			// narrow window, then widen with less length than prev index
			act(() => ctl.current.list.setItems(newArr(2)));
		}).not.toThrow();
	});

	test("Resets index back to zero on 0 to > 0 window size changes", () => {
		setItems();
		act(() => ctl.current.list.setItems(newArr(0)));
		expect(ctl.current.list.control.currentIndex).toBe(0);
		act(() => ctl.current.list.setItems(newArr(20)));
		expect(ctl.current.list.control.currentIndex).toBe(0);
	});

	// This *should* work.  windowSize is modified based on computed dim during
	// rendering, and it doesn't look like the test environment is consistently
	// running the rendering function
	test.todo("Resets index back to zero when minimizing", () => {
		setItems(); // we are at a list of 20, at the last index
		act(() => ctl.current.setHeight(0));
		expect(ctl.current.list.control.currentIndex).toBe(0);
		act(() => ctl.current.setHeight(3));
		expect(ctl.current.list.control.currentIndex).toBe(0);
		act(() => ctl.current.list.control.goToIndex(19));
		expect(ctl.current.list.control.currentIndex).toBe(19);
	});
});
