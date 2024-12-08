import {DOMElement} from '../dom.js';
import ElementPosition from './ElementPosition.js';
import {DefaultStdin} from './Stdin.js';

export function addMouseEventListeners(
	node: DOMElement,
	// The current 'level' in the zIndex stack this node is on, not its zIndex property
	zIndexRoot: number,
): void {
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

	const shouldSubscribe =
		trackLeftActive ||
		trackRightActive ||
		node.style.onClick ||
		node.style.onRightClick ||
		node.style.onDoubleClick ||
		node.style.onRightDoubleClick ||
		node.style.onMouseDown ||
		node.style.onMouseUp ||
		node.style.onRightMouseUp ||
		node.style.onRightMouseDown ||
		node.style.onScrollClick ||
		node.style.onScrollDown ||
		node.style.onScrollUp;

	if (isPageFocus && shouldSubscribe) {
		const target = ElementPosition.getNode(node);
		const targetPosition = ElementPosition.getScreenPosition(target);

		DefaultStdin.Mouse.subscribeComponent({
			props: node.style,
			ID,
			target,
			targetPosition,
			setLeftActive,
			setRightActive,
			trackLeftActive,
			trackRightActive,
			zIndex: zIndexRoot,
		});
	}
}
