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

/*
 * TODO
 * ModalContext - Everything outside of the Modal is unfocused when visible
 * 		- This is fundamentally different than the other FocusContexts though since
 * 		modals live outside the normal flow
 * 		- Every Modal component updates a global variable to true if pageFocus && visible
 *  	- Would be ideal if it was only top level modals, but there is a risk of memoized components
 *  	messing up the order (maybe, if you use ModalContext then memoized Modals will change when
 *  	the context changes.  If no context assume parent Modal is visible, otherwise visibility
 *  	is dictated by props and context)
 * 		- event responders check the global variable before running handlers
 * 		- Modals would need to give context with their IDs, if the IDs match the top level focused
 * 		Modal and the Modal context says visible, then event responders can run.
 * 		- If there is no Modal context || there is no global ID for the top level modal,
 * 		then we can assume its safe to execute the callback
 * 		- useModalFocus: checks if Modal context and if Modal context ID matches global ID. If not
 * 		Modal context, checks if there is a global ID for top level modal
 * */
export function Modal(props: Props): React.ReactNode {
	let {
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

	const isPageFocus = usePageFocus();
	if (!isPageFocus) {
		visible = false;
	}

	// prettier-ignore
	displayProps.backgroundColor = displayProps.backgroundColor ?? 'inherit';
	displayProps.borderStyle = visible ? displayProps.borderStyle : undefined;

	const outerHeight: BoxProps['height'] = visible ? '100' : 0;
	const outerWidth: BoxProps['width'] = visible ? '100' : 0;

	return (
		<Box
			position="absolute"
			zIndex={zIndex}
			height={outerHeight}
			width={outerWidth}
			// Hide the Modal
			overflow="hidden"
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
