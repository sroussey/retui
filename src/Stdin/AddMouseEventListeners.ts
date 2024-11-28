import {DOMElement} from '../dom.js';
import ElementPosition from './ElementPosition.js';
import {STDIN} from './Stdin.js';

export function addMouseEventListeners(node: DOMElement): void {
	const trackLeftActive =
		!!node.style.styles?.leftActive || !!node.style.leftActive;
	const trackRightActive =
		!!node.style.styles?.rightActive || !!node.style.rightActive;

	const ID = node.attributes['ID'] as string;
	const isPageFocus = node.attributes['isPageFocus'] as boolean;
	const setLeftActive = node.attributes['setLeftActive'] as (
		b: boolean,
	) => void;
	const setRightActive = node.attributes['setRightActive'] as (
		b: boolean,
	) => void;

	// const ID = node.attributes['ID'];
	// logger.prefix('ID', ID);

	if (isPageFocus) {
		const target = ElementPosition.getNode(node);
		const targetPosition = ElementPosition.getScreenPosition(target);

		STDIN.Mouse.subscribeComponent({
			props: node.style,
			ID,
			target,
			targetPosition,
			setLeftActive,
			setRightActive,
			trackLeftActive,
			trackRightActive,
		});
	}
}
