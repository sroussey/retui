import {randomUUID} from 'crypto';
import {useContext, useState} from 'react';
import {KeyInput, useKeymap} from '../index.js';
import InternalEvents from '../utility/InternalEvents.js';
import {ModalContext} from './ModalContext.js';

export type ModalControlKeyMap = {
	show: KeyInput | null;
	hide: KeyInput | null;
};

export type ModalData = {
	_ID: string;
	_hideKeymap: KeyInput | null;
	_showKeymap: KeyInput | null;
	_vis: boolean;
	_showEvent: string;
	_hideEvent: string;
	_showModal: () => void;
	_hideModal: () => void;
};

export type Return = {
	modal: ModalData;
	showModal: () => void;
	hideModal: () => void;
};

export const SHOW = 'SHOW';
export const HIDE = 'HIDE';

/*
 * Gives you the modal object that is required for the Modal component.
 * Also gives you the showModal function to trigger opening the modal from pathways
 * other than a keymapping.  For example, maybe an error occurs in your app, or a
 * button click opens the modal
 * */
export function useModal(keymap: ModalControlKeyMap): Return {
	const [ID] = useState(randomUUID());
	const [vis, setVis] = useState(false);

	const showEvent = InternalEvents.getInternalEvent(SHOW, ID);
	const hideEvent = InternalEvents.getInternalEvent(HIDE, ID);
	const showModal = () => setVis(true);
	const hideModal = () => setVis(false);

	const internalKeymap = keymap.show ? {[showEvent]: keymap.show} : {};
	const {useEvent} = useKeymap(internalKeymap);
	useEvent(showEvent, showModal);

	return {
		modal: Object.freeze({
			_ID: ID,
			_hideKeymap: keymap.hide,
			_showKeymap: keymap.show,
			_vis: vis,
			_showEvent: showEvent,
			_hideEvent: hideEvent,
			_showModal: showModal,
			_hideModal: hideModal,
		}),
		showModal: showModal,
		hideModal: hideModal,
	};
}

export function useHideModal(): {hideModal: () => void} {
	const modalContext = useContext(ModalContext);

	if (!modalContext) {
		throw new Error('Cannot use useHideModal outside of a Modal component.');
	}

	return {hideModal: modalContext.hide};
}
