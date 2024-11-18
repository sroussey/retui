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
	const isPageFocus = usePageFocus();

	const styles: BoxStyles = {
		height: '100',
		width: '100',
		overflow: 'visible',
	};

	if (!isPageFocus) {
		styles.height = '0';
		styles.width = '0';
		styles.overflow = 'hidden';
	}

	return (
		<Box
			styles={styles}
			zIndex={zIndex}
			wipeBackground={false} // zIndex wipes background by default, we don't want that here
			position="absolute"
			justifyContent={justifyContent}
			alignItems={alignItems}
			marginLeft={xOffset}
			marginTop={yOffset}
		>
			{children}
		</Box>
	);
}
