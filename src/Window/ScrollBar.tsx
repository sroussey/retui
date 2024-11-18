import React from 'react';
import Text from '../components/Text.js';
import {ViewState} from './types.js';
import {WindowProps} from './Window.js';
import Box from '../components/Box.js';

type Props = {
	viewState: ViewState;
	height: number;
	width: number;
	color: string;
	direction: WindowProps['direction'];
	style: WindowProps['scrollBarStyle'];
};

function _ScrollBar({
	viewState,
	direction,
	height,
	width,
	color,
	style,
}: Props): React.ReactNode {
	const {_start, _end, _winSize, _itemsLen} = viewState;

	if (!_itemsLen || _winSize >= _itemsLen) return null;

	if (direction === 'column') {
		const barHeight = Math.max(
			0,
			Math.ceil(height * (Math.min(_itemsLen, _winSize) / _itemsLen)),
		);

		const preStart = height * (_start / _itemsLen);
		const preEnd = height * ((_itemsLen - _end) / _itemsLen);

		let startHeight = Math.max(0, Math.floor(preStart));
		let endHeight = Math.max(0, Math.floor(preEnd));

		const barUnicode = style === 'bold' ? ' ' : '┃';

		const barComponent: React.ReactElement[] = new Array(barHeight)
			.fill(0)
			.map((_, idx) => {
				return (
					<Text key={idx} color={color} inverse={style === 'bold'}>
						{barUnicode}
					</Text>
				);
			});

		return (
			<Box flexDirection="column" height={height}>
				{new Array(startHeight).fill(0).map((_, idx) => {
					return <Text key={idx}> </Text>;
				})}
				{barComponent}
				{new Array(endHeight).fill(0).map((_, idx) => {
					return <Text key={idx}> </Text>;
				})}
			</Box>
		);
	}

	if (direction === 'row') {
		const barWidth = Math.max(
			0,
			Math.ceil(width * (Math.min(_itemsLen, _winSize) / _itemsLen)),
		);

		const preStart = width * (_start / _itemsLen);
		const preEnd = width * ((_itemsLen - _end) / _itemsLen);

		let startWidth = Math.max(0, Math.floor(preStart));
		let endWidth = Math.max(0, Math.floor(preEnd));

		const barUnicode = style === 'bold' ? ' ' : '▬';

		const barComponent = (
			<Text color={color} inverse={style === 'bold'} bold>
				{barUnicode.repeat(barWidth)}
			</Text>
		);

		return (
			<Box flexDirection="row" height={1} width={width}>
				<Text>{' '.repeat(startWidth)}</Text>
				{barComponent}
				<Text>{' '.repeat(endWidth)}</Text>
			</Box>
		);
	}

	throw new Error('Missing ScrollBar direction property');
}

const ScrollBar = React.memo(_ScrollBar);
export default ScrollBar;
