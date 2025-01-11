import React, {useState} from 'react';
import {Box, Text, List, useList} from '../../src/index.js';
import {randomUUID} from 'crypto';

export type Item = {id: string; value: number};

export type Controls = {
	list: ReturnType<typeof useList<Item[]>>;
	setHeight: (n: number) => void;
};

export type Props = {
	ctl: {current: Controls};
	startHeight: number;
	startItems: Item[];
};

export function View({ctl, startHeight, startItems}: Props) {
	const [height, setHeight] = useState(startHeight);
	const list = useList(startItems);

	ctl.current = {list, setHeight};

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
