import React, {useEffect} from 'react';
import Box from '../components/Box.js';
import {BoxProps, useKeymap} from '../index.js';
import {usePageFocus} from '../focus/FocusContext.js';
import ModalStack from './ModalStack.js';
import {ModalContext, useModalContext} from './ModalContext.js';
import {ModalData} from './useModal.js';

/*
 * Absolutely positions a box the same dimensions as the parent node and applies
 * a default zIndex of 1.  Children are centered by default.  xOffset and yOffset
 * can be used to move the modal around the screen
 * */
export type Props = {
	modal: ModalData;
	zIndex?: number;
	justifySelf?: 'flex-start' | 'center' | 'flex-end';
	alignSelf?: 'flex-start' | 'center' | 'flex-end';
	xOffset?: number;
	yOffset?: number;
	closeOnOutsideClick?: boolean;
} & Omit<BoxProps, 'wipeBackground'> &
	React.PropsWithChildren;

export function Modal(props: Props): React.ReactNode {
	const modalCtx = useModalContext();
	const isPageFocus = usePageFocus();
	const visible = props.modal._vis && isPageFocus && modalCtx.visible;
	const ID = props.modal._ID;

	return (
		<ModalContext.Provider
			value={{
				ID: ID,
				visible: visible,
				level: modalCtx.level + 1,
				hide: props.modal._hideModal,
			}}
		>
			<ModalConsumer {...props} visible={visible} />
		</ModalContext.Provider>
	);
}

function ModalConsumer(props: Props & {visible: boolean}): React.ReactNode {
	let {
		modal,
		visible,
		justifySelf = 'center',
		alignSelf = 'center',
		xOffset = 0,
		yOffset = 0,
		zIndex = 1,
		closeOnOutsideClick = true,
		children,
		...displayProps
	} = props;

	const ctx = useModalContext();

	useEffect(() => {
		ModalStack.add(ctx.ID, ctx.visible, ctx.level);
	}, [ctx.visible, ctx.level]);

	useEffect(() => {
		return () => {
			ModalStack.remove(ctx.ID);
		};
	}, []);

	const hideKeymap = modal._hideKeymap;
	const hideEvent = modal._hideEvent;
	const hideModal = modal._hideModal;

	const internalKeymap = hideKeymap ? {[hideEvent]: hideKeymap} : {};
	const {useEvent} = useKeymap(internalKeymap);
	useEvent(hideEvent, hideModal);

	if (!visible) return null;

	return (
		<Box
			position="absolute"
			zIndex={zIndex}
			height="100"
			width="100"
			// zIndex wipes background by default, we don't want that in the overlay Box
			wipeBackground={false}
			// Position the inner Box
			justifyContent={justifySelf}
			alignItems={alignSelf}
			marginLeft={xOffset}
			marginTop={yOffset}
			// Handle outside click
			onClick={closeOnOutsideClick ? () => props.modal._hideModal() : () => {}}
		>
			<Box
				{...displayProps}
				zIndex={zIndex + 1}
				wipeBackground
				onClick={displayProps.onClick ?? (() => {})}
			>
				{children}
			</Box>
		</Box>
	);
}
