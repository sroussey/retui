import React from 'react';
import Box from '../../../components/Box.js';
import {describe, expect, test} from 'vitest';
import {renderToString} from '../../../../test/helpers/render-to-string.js';
import {List} from '../List.js';
import Text from '../../../components/Text.js';
import {WindowControl} from '../../types.js';
import {useList} from '../useList.js';
import boxen from 'boxen';

describe('Slices list', () => {
	const createList = (listView: ListView) => {
		return (
			<Box height={5}>
				<List listView={listView} scrollbar={{hide: true}}>
					<Text>0</Text>
					<Text>1</Text>
					<Text>2</Text>
					<Text>3</Text>
					<Text>4</Text>
				</List>
			</Box>
		);
	};

	test('0-2', () => {
		const output = renderToString(
			createList(
				createListView({
					start: 0,
					idx: 0,
					end: 3,
					itemsLen: 3,
					unitSize: 1,
					winSize: 3,
				}),
			),
		);

		// Extra \n because the Box of 5 prints out 5 \n
		expect(output).toBe('0\n1\n2\n\n');
	});

	test('0-4', () => {
		const output = renderToString(
			createList(
				createListView({
					start: 0,
					idx: 0,
					end: 5,
					itemsLen: 5,
					unitSize: 1,
					winSize: 5,
				}),
			),
		);

		expect(output).toBe('0\n1\n2\n3\n4');
	});

	test('2-4', () => {
		const output = renderToString(
			createList(
				createListView({
					start: 2,
					idx: 2,
					end: 5,
					itemsLen: 5,
					unitSize: 1,
					winSize: 3,
				}),
			),
		);

		expect(output).toBe('2\n3\n4\n\n');
	});
});

describe('unit sizes and window sizes', () => {
	function UnitSizeNumber() {
		const {listView} = useList(4, {windowSize: 3, unitSize: 2});
		return (
			<Box height={6}>
				<List listView={listView} scrollbar={{hide: true}}>
					<Box height={2}>
						<Text>0</Text>
					</Box>
					<Box height={2}>
						<Text>1</Text>
					</Box>
					<Box height={2}>
						<Text>2</Text>
					</Box>
					<Box height={2}>
						<Text>3</Text>
					</Box>
					<Box height={2}>
						<Text>4</Text>
					</Box>
				</List>
			</Box>
		);
	}

	test('ws: 3, us: 2', () => {
		const output = renderToString(<UnitSizeNumber />);
		expect(output).toBe('0\n\n1\n\n2\n');
	});

	function UnitSizeStretch(): React.ReactNode {
		const {listView} = useList(3, {windowSize: 1, unitSize: 'stretch'});

		return (
			<Box height={3}>
				<List listView={listView} scrollbar={{hide: true}}>
					<Text>0</Text>
					<Text>1</Text>
					<Text>2</Text>
				</List>
			</Box>
		);
	}

	test('ws: 1, us: "stretch"', () => {
		const output = renderToString(<UnitSizeStretch />);
		expect(output).toBe('0\n\n');
	});

	function UnitSizeFitUnit(props: {fd: 'column' | 'row'}): React.ReactNode {
		const {listView} = useList(3, {windowSize: 1, unitSize: 'fit-unit'});
		return (
			<Box height={5} flexDirection={props.fd}>
				<List listView={listView}>
					<Box borderStyle="round">
						<Text>0</Text>
					</Box>
					<Box borderStyle="round">
						<Text>1</Text>
					</Box>
					<Box borderStyle="round">
						<Text>2</Text>
					</Box>
				</List>
			</Box>
		);
	}

	// The unit rendered unit does not 'stretch' to fill up
	// test('ws: 1, us: fit-unit, flexDirection: "column"', () => {
	// 	const output = renderToString(<UnitSizeFitUnit fd="column" />);
	// 	const box = boxen('0', {borderStyle: 'round', width: 3, height: 3});
	// 	expect(output).toBe(`${box}`);
	// });
});

type ListView = ReturnType<typeof useList>['listView'];

type Config = {
	start: ListView['_start'];
	idx: ListView['_idx'];
	end: ListView['_end'];
	winSize: ListView['_winSize'];
	itemsLen: ListView['_itemsLen'];
	unitSize: ListView['_unitSize'];
};

function createListView(c: Config): ListView {
	return {
		_start: c.start,
		_idx: c.idx,
		_end: c.end,
		_winSize: c.winSize,
		_itemsLen: c.itemsLen,
		_unitSize: c.unitSize,
		_items: null,
		_setItems: () => {},
		_control: {modifyWinSize: (_: number) => {}} as WindowControl,
	};
}
