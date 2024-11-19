import React from 'react';
import Box from '../components/Box.js';
import {BoxProps, BoxStyles, useIsFocus} from '../index.js';
import {usePageFocus} from '../FocusContext/FocusContext.js';

/*
 * Absolutely positions a box the same dimensions as the parent node and applies
 * a default zIndex of 1.  Children are centered by default.  xOffset and yOffset
 * can be used to move the modal around the screen
 * */
export type Props = {
	zIndex?: number;
	justifySelf?: 'flex-start' | 'center' | 'flex-end';
	alignSelf?: 'flex-start' | 'center' | 'flex-end';
	xOffset?: number;
	yOffset?: number;
} & Omit<BoxProps, 'wipeBackground'> &
	React.PropsWithChildren;

export function Modal(props: Props): React.ReactNode {
	const isPageFocus = usePageFocus();
	if (!isPageFocus) return null;

	const {
		justifySelf = 'center',
		alignSelf = 'center',
		xOffset = 0,
		yOffset = 0,
		zIndex = 1,
		children,
		...rest
	} = props;

	return (
		<Box
			position="absolute"
			height="100"
			width="100"
			zIndex={zIndex}
			wipeBackground={false} // zIndex wipes background by default, we don't want that in the overlay Box
			justifyContent={justifySelf}
			alignItems={alignSelf}
			marginLeft={xOffset}
			marginTop={yOffset}
		>
			<Box {...rest} wipeBackground>
				{children}
			</Box>
		</Box>
	);
}
