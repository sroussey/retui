import React from 'react';
import Box from '../components/Box.js';
import {BoxProps, BoxStyles, logger, useIsFocus} from '../index.js';
import {usePageFocus} from '../FocusContext/FocusContext.js';

/*
 * Absolutely positions a box the same dimensions as the parent node and applies
 * a default zIndex of 1.  Children are centered by default.  xOffset and yOffset
 * can be used to move the modal around the screen
 * */
export type Props = {
	visible?: boolean;
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
		visible = true,
		justifySelf = 'center',
		alignSelf = 'center',
		xOffset = 0,
		yOffset = 0,
		zIndex = 1,
		children,
		...displayProps
	} = props;

	// prettier-ignore
	displayProps.backgroundColor = displayProps.backgroundColor ?? 'inherit';

	const outerHeight: BoxProps['height'] = visible ? '100' : 0;
	const outerWidth: BoxProps['width'] = visible ? '100' : 0;
	const outerOverflow: BoxProps['overflow'] = visible ? 'visible' : 'hidden';

	return (
		<Box
			position="absolute"
			zIndex={zIndex}
			height={outerHeight}
			width={outerWidth}
			overflow={outerOverflow}
			// zIndex wipes background by default, we don't want that in the overlay Box
			wipeBackground={false}
			// Position the inner Box
			justifyContent={justifySelf}
			alignItems={alignSelf}
			marginLeft={xOffset}
			marginTop={yOffset}
		>
			<Box {...displayProps} wipeBackground>
				{children}
			</Box>
		</Box>
	);
}
