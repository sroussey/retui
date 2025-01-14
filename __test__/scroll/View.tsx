import React, {useState} from 'react';
import {Box, Text, List, useList} from '../../src/index.js';
import {randomUUID} from 'crypto';

export type Item = {id: string; value: number};

export type Controls = {
	list: ReturnType<typeof useList<Item[]>>;
	setHeight: (n: number) => void;

	// deletions
	delIdx: (idx: number) => void;
	delStart: () => void;
	delEnd: () => void;

	// additions
	addIdx: (idx: number) => void;
	addStart: () => void;
	addEnd: () => void;
};

export type Props = {
	ctl: {current: Controls};
	startHeight: number;
	startItems: Item[];
};

export function View({ctl, startHeight, startItems}: Props) {
	const [height, setHeight] = useState(startHeight);
	const list = useList(startItems);

	const delIdx = (idx: number) => {
		const copy = list.items.slice();
		copy.splice(idx, 1);
		list.setItems(copy);
	};

	const addIdx = (idx: number) => {
		const copy = list.items.slice();
		const left = copy.slice(0, idx + 1);
		const right = copy.slice(idx + 1);
		left.push({id: randomUUID(), value: 100});
		list.setItems([...left, ...right]);
	};

	const delEnd = () => {
		const copy = list.items.slice(0, list.items.length - 1);
		list.setItems(copy);
	};

	const addEnd = () => {
		const copy = list.items.slice();
		copy.push({id: randomUUID(), value: 100});
		list.setItems(copy);
	};

	const delStart = () => {
		delIdx(0);
	};

	const addStart = () => {
		const copy = list.items.slice();
		copy.unshift({id: randomUUID(), value: 100});
		list.setItems(copy);
	};

	ctl.current = {
		list,
		setHeight,
		delIdx,
		addIdx,
		delEnd,
		addEnd,
		delStart,
		addStart,
	};

	return (
		<Box height={height}>
			<List listView={list.listView}>
				{list.items.map(item => {
					return <Text key={item.id}>{item.value}</Text>;
				})}
			</List>
		</Box>
	);
}

export function newArr(length: number): Item[] {
	return Array.from({length}).map((_, idx) => {
		return {id: randomUUID(), value: idx};
	});
}
