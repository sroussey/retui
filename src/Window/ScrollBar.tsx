import React from 'react';
import {Box} from '../BoxBgColor/Box.js';
import Text from '../components/Text.js';
import {ViewState} from './types.js';

type Props = {
	viewState: ViewState;
	height: number;
	width: number;
	color: string;
};

function _ScrollBar({viewState, height, color}: Props): React.ReactNode {
	const {_start, _end, _winSize, _itemsLen} = viewState;

	if (!_itemsLen || _winSize >= _itemsLen) return null;

	const barHeight = Math.max(
		0,
		Math.ceil(height * (Math.min(_itemsLen, _winSize) / _itemsLen)),
	);

	const preStart = height * (_start / _itemsLen);
	const preEnd = height * ((_itemsLen - _end) / _itemsLen);

	let startHeight = Math.max(0, Math.floor(preStart));
	let endHeight = Math.max(0, Math.floor(preEnd));

	return (
		<>
			<Box flexDirection="column" height="100%">
				{new Array(startHeight).fill(0).map((_, _idx) => {
					return <Text key={_idx}> </Text>;
				})}
				{new Array(barHeight).fill(0).map((_, _idx) => {
					// prettier-ignore
					return <Text key={_idx} backgroundColor={color}> </Text>;
				})}
				{new Array(endHeight).fill(0).map((_, _idx) => {
					return <Text key={_idx}> </Text>;
				})}
			</Box>
		</>
	);
}

const ScrollBar = React.memo(_ScrollBar);
export default ScrollBar;
