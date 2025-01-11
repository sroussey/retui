import React from 'react';
import {render, act} from '@testing-library/react';
import {describe, expect, test} from 'vitest';
import assert from 'assert';
import {Controls, View, newArr} from './View.js';

describe('Does not go out of bounds', () => {
	const ctl: {current: Controls} = {} as {current: Controls};

	render(<View ctl={ctl} startHeight={3} startItems={newArr(5)} />);

	test('Assigns to ctl', () => {
		expect(() => {
			assert(ctl.current);
		}).not.toThrow();
	});

	test('nextItem', () => {
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

	test('nextItem at end', () => {
		act(ctl.current.list.control.nextItem);
		act(ctl.current.list.control.nextItem);
		expect(ctl.current.list.control.currentIndex).toBe(4);
	});

	test('prevItem', () => {
		act(ctl.current.list.control.prevItem);
		expect(ctl.current.list.control.currentIndex).toBe(3);
		act(ctl.current.list.control.prevItem);
		expect(ctl.current.list.control.currentIndex).toBe(2);
		act(ctl.current.list.control.prevItem);
		expect(ctl.current.list.control.currentIndex).toBe(1);
		act(ctl.current.list.control.prevItem);
		expect(ctl.current.list.control.currentIndex).toBe(0);
	});

	test('prevItem at start', () => {
		act(ctl.current.list.control.prevItem);
		act(ctl.current.list.control.prevItem);
		expect(ctl.current.list.control.currentIndex).toBe(0);
	});

	test('goToIndex', () => {
		act(() => ctl.current.list.control.goToIndex(4));
		expect(ctl.current.list.control.currentIndex).toBe(4);
		act(() => ctl.current.list.control.goToIndex(1));
		expect(ctl.current.list.control.currentIndex).toBe(1);
	});

	test('goToIndex out of range', () => {
		act(() => ctl.current.list.control.goToIndex(-5));
		expect(ctl.current.list.control.currentIndex).toBe(1);
		act(() => ctl.current.list.control.goToIndex(10));
		expect(ctl.current.list.control.currentIndex).toBe(1);
	});

	// Will break
	test.todo('Does not throw on certain resizes', () => {
		act(() => ctl.current.list.setItems(newArr(20)));
		act(() => ctl.current.list.control.goToIndex(19));
		expect(ctl.current.list.control.currentIndex).toBe(19);

		expect(() => {
			// narrow window, then widen with less length than prev index
			act(() => ctl.current.list.setItems(newArr(0)));
			act(() => ctl.current.list.setItems(newArr(5)));
		}).not.toThrow();
	});

	// Will break
	test.todo('Does not throw on certain resizes', () => {
		act(() => ctl.current.list.setItems(newArr(20)));
		act(() => ctl.current.list.control.goToIndex(19));
		expect(ctl.current.list.control.currentIndex).toBe(19);

		expect(() => {
			// narrow window, then widen with less length than prev index
			act(() => ctl.current.list.setItems(newArr(2)));
		}).not.toThrow();
	});
});
