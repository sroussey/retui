import React from 'react';
import Box from '../components/Box.js';
import {BoxProps, MouseEventHandler} from '../index.js';
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
	onOutsideClick?: MouseEventHandler;
	onOutsideRightClick?: MouseEventHandler;
	onOutsideDoubleClick?: MouseEventHandler;
	onOutsideDoubleRightClick?: MouseEventHandler;
	onOutsideMouseDown?: MouseEventHandler;
	onOutsideMouseUp?: MouseEventHandler;
	onOutsideRightMouseDown?: MouseEventHandler;
	onOutsideRightMouseUp?: MouseEventHandler;
	onOutsideScrollClick?: MouseEventHandler;
	onOutsideScrollDown?: MouseEventHandler;
	onOutsideScrollUp?: MouseEventHandler;
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
		onOutsideClick,
		onOutsideRightClick,
		onOutsideDoubleClick,
		onOutsideDoubleRightClick,
		onOutsideMouseUp,
		onOutsideMouseDown,
		onOutsideRightMouseUp,
		onOutsideRightMouseDown,
		onOutsideScrollUp,
		onOutsideScrollDown,
		onOutsideScrollClick,
		children,
		...displayProps
	} = props;

	// prettier-ignore
	displayProps.backgroundColor = displayProps.backgroundColor ?? 'inherit';

	const outerHeight: BoxProps['height'] = '100';
	const outerWidth: BoxProps['width'] = '100';
	const display = visible ? 'flex' : 'none';

	return (
		<Box
			position="absolute"
			display={display}
			zIndex={zIndex}
			height={outerHeight}
			width={outerWidth}
			// zIndex wipes background by default, we don't want that in the overlay Box
			wipeBackground={false}
			// Position the inner Box
			justifyContent={justifySelf}
			alignItems={alignSelf}
			marginLeft={xOffset}
			marginTop={yOffset}
			// Click handlers
			onClick={onOutsideClick}
			onRightClick={onOutsideRightClick}
			onDoubleClick={onOutsideDoubleClick}
			onMouseDown={onOutsideMouseDown}
			onMouseUp={onOutsideMouseUp}
			onRightMouseDown={onOutsideRightMouseDown}
			onRightMouseUp={onOutsideRightMouseUp}
			onScrollUp={onOutsideScrollUp}
			onScrollDown={onOutsideMouseDown}
			onScrollClick={onOutsideScrollClick}
		>
			<Box {...displayProps} zIndex={zIndex + 1} wipeBackground>
				{children}
			</Box>
		</Box>
	);
}
