import React from 'react';
import Box from '../components/Box.js';
import {BoxProps} from '../index.js';

/*
 * Absolutely positions a box the same dimensions as the parent node and applies
 * a default zIndex of 1.  Children are centered by default.  xOffset and yOffset
 * can be used to move the modal around the screen
 * */
export type Props = {
	zIndex?: number;
	justifyContent?: BoxProps['justifyContent'];
	alignItems?: BoxProps['alignItems'];
	xOffset?: number;
	yOffset?: number;
} & React.PropsWithChildren;

export function Modal({
	zIndex = 1,
	justifyContent = 'center',
	alignItems = 'center',
	xOffset = 0,
	yOffset = 0,
	children,
}: Props): React.ReactNode {
	return (
		<Box
			zIndex={zIndex}
			wipeBackground={false} // zIndex wipes background by default, we don't want that here
			position="absolute"
			height="100"
			width="100"
			justifyContent={justifyContent}
			alignItems={alignItems}
			marginLeft={xOffset}
			marginTop={yOffset}
		>
			{children}
		</Box>
	);
}
