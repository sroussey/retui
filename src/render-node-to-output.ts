import widestLine from 'widest-line';
import indentString from 'indent-string';
import Yoga from 'yoga-wasm-web/auto';
import wrapText from './wrap-text.js';
import getMaxWidth from './get-max-width.js';
import squashTextNodes from './squash-text-nodes.js';
import renderBorder from './render-border.js';
import {type DOMElement} from './dom.js';
import type Output from './output.js';
import renderBackgroundColor from './render-background-color.js';
import {BaseProps} from './baseProps.js';
import {addMouseEventListeners} from './stdin/AddMouseEventListeners.js';
import {DefaultStdin} from './stdin/Stdin.js';
import {TextProps} from './index.js';
import {MutableBaseProps} from './utility/types.js';
import {renderWindowToOutput} from './window/renderWindowToOutput.js';

// If parent container is `<Box>`, text nodes will be treated as separate nodes in
// the tree and will have their own coordinates in the layout.
// To ensure text nodes are aligned correctly, take X and Y of the first text node
// and use it as offset for the rest of the nodes
// Only first node is taken into account, because other text nodes can't have margin or padding,
// so their coordinates will be relative to the first node anyway
const applyPaddingToText = (node: DOMElement, text: string): string => {
	const yogaNode = node.childNodes[0]?.yogaNode;

	if (yogaNode) {
		const offsetX = yogaNode.getComputedLeft();
		const offsetY = yogaNode.getComputedTop();
		text = '\n'.repeat(offsetY) + indentString(text, offsetX);
	}

	return text;
};

export type OutputTransformer = (s: string, index: number) => string;

// After nodes are laid out, render each to output object, which later gets rendered to terminal
const renderNodeToOutput = (
	node: DOMElement,
	output: Output,
	options: {
		offsetX?: number;
		offsetY?: number;
		transformers?: OutputTransformer[];
		skipStaticElements: boolean;
		isZIndexRoot?: boolean;
		rootZIndex?: number;
		parentStyles?: MutableBaseProps;
		skipRenderChildren?: boolean;
	},
	zIndexes: {index: number; cb: () => void}[] = [],
) => {
	const {
		offsetX = 0,
		offsetY = 0,
		transformers = [],
		skipStaticElements,
	} = options;

	const {yogaNode} = node;

	if (skipStaticElements && node.internal_static) return;
	if (!yogaNode || yogaNode.getDisplay() === Yoga.DISPLAY_NONE) return;

	// Left and top positions in Yoga are relative to their parent node
	// If this is a call from a zIndex node, then the offset has already been applied
	const nextOffsetX = options.isZIndexRoot ? 0 : yogaNode.getComputedLeft();
	const nextOffsetY = options.isZIndexRoot ? 0 : yogaNode.getComputedTop();
	const x = offsetX + nextOffsetX;
	const y = offsetY + nextOffsetY;

	const InternalStyles = node.attributes['internalStyles'] as
		| (BaseProps & TextProps)
		| undefined;

	// Transformers are functions that transform final text output of each component
	// See Output class for logic that applies transformers
	let newTransformers = transformers;

	// Every node that has a zIndex set becomes a 'zIndex root', which means rendering
	// is cached until the current zIndex root is finished rendering.  Every zIndex
	// root accumulates from the previous zIndex root's value.  The 'ink-root' zIndex
	// starts at 0
	options.rootZIndex = options.rootZIndex ?? 0;

	if (typeof node.internal_transform === 'function') {
		newTransformers = [node.internal_transform, ...transformers];
	}

	if (node.nodeName === 'ink-text') {
		const parentBg = node.parentNode?.style.backgroundColor;
		const hasParentBg = parentBg !== undefined && parentBg !== 'inherit';

		const internalBackgroundColor = InternalStyles?.backgroundColor;
		const internalInverse = InternalStyles?.inverse;
		const internalColor = InternalStyles?.color;

		if (internalBackgroundColor === 'inherit' && hasParentBg) {
			if (!internalInverse && !internalColor) {
				node.style.color = parentBg;
				node.style.inverse = true;
			} else if (!internalInverse) {
				node.style.backgroundColor = parentBg;
			}
		} else {
			node.style.color = internalColor;
			node.style.backgroundColor = internalBackgroundColor;
			node.style.inverse = internalInverse;
		}

		// BaseProps are applied in squashTextNodes
		let text = squashTextNodes(node);

		if (text.length > 0) {
			const currentWidth = widestLine(text);
			const maxWidth = getMaxWidth(yogaNode);

			if (currentWidth > maxWidth) {
				const textWrap = node.style.textWrap ?? 'wrap';
				text = wrapText(text, maxWidth, textWrap);
			}

			text = applyPaddingToText(node, text);

			output.write(x, y, text, {transformers: newTransformers});
		}

		return;
	}

	let clipped = false;

	if (node.style.zIndex === 'auto') {
		node.style.zIndex = 0;
	}

	// zIndexes less than 0 won't have any effect...make this explicitly clear
	if (typeof node.style.zIndex === 'number' && node.style.zIndex < 0) {
		throw new Error('zIndex property must be a positive number.');
	}

	// If zIndex root, that means this stack frame has already been queued and is
	// now being executed, we don't need to stash it for later
	const hasZIndex =
		typeof node.style.zIndex === 'number' &&
		node.style.zIndex > 0 &&
		!options.isZIndexRoot;

	// Save for rendering after the rest of the tree has finished
	// This is a zIndex root node, save for later
	if (node.nodeName === 'ink-box' && hasZIndex) {
		// prettier-ignore
		const nodeZIndex = (node.style.zIndex as number) + (options.rootZIndex ?? 0);

		// prettier-ignore
		const cb = () => {
			renderNodeToOutput(node, output, {
				offsetX: x,
				offsetY: y,
				transformers: newTransformers,
				skipStaticElements,
				parentStyles: options?.parentStyles,
				rootZIndex:nodeZIndex,
				isZIndexRoot: true,
			}, []);
			// Don't pass in the cached zIndexes, each node with a zIndex accumulates
			// recursive callbacks to other zIndexed nodes just like the root node
		};

		zIndexes.push({index: nodeZIndex, cb});
		zIndexes.sort((a, b) => (a.index > b.index ? 1 : -1));
	} else if (node.nodeName === 'ink-box') {
		const internalBackgroundColor = InternalStyles?.backgroundColor;
		const internalBorderColor = InternalStyles?.borderColor;
		const internalBorderStyle = InternalStyles?.borderStyle;

		if (internalBackgroundColor === 'inherit') {
			if (options.parentStyles?.backgroundColor) {
				node.style.backgroundColor = options.parentStyles.backgroundColor;
			} else {
				node.style.backgroundColor = undefined;
			}
		}

		if (internalBorderStyle === 'inherit') {
			if (options.parentStyles?.borderStyle) {
				node.style.borderStyle = options.parentStyles.borderStyle;
			} else {
				node.style.borderStyle = undefined;
			}
		}

		if (internalBorderColor === 'inherit') {
			if (options?.parentStyles?.borderColor) {
				node.style.borderColor = options.parentStyles.borderColor;
			} else {
				node.style.borderColor = undefined;
			}
		}

		addMouseEventListeners(node, options.rootZIndex);

		const parentHasBg = options?.parentStyles?.backgroundColor ? true : false;
		renderBackgroundColor(x, y, node, output, parentHasBg);
		renderBorder(x, y, node, output, options.rootZIndex ?? 0);

		const clipHorizontally =
			node.style.overflowX === 'hidden' || node.style.overflow === 'hidden';
		const clipVertically =
			node.style.overflowY === 'hidden' || node.style.overflow === 'hidden';

		if (clipHorizontally || clipVertically) {
			const x1 = clipHorizontally
				? x + yogaNode.getComputedBorder(Yoga.EDGE_LEFT)
				: undefined;

			const x2 = clipHorizontally
				? x +
					yogaNode.getComputedWidth() -
					yogaNode.getComputedBorder(Yoga.EDGE_RIGHT)
				: undefined;

			const y1 = clipVertically
				? y + yogaNode.getComputedBorder(Yoga.EDGE_TOP)
				: undefined;

			const y2 = clipVertically
				? y +
					yogaNode.getComputedHeight() -
					yogaNode.getComputedBorder(Yoga.EDGE_BOTTOM)
				: undefined;

			output.clip({x1, x2, y1, y2});
			clipped = true;
		}
	} else if (node.nodeName === 'ink-window') {
		const shouldRenderChildren = renderWindowToOutput(x, y, node, output);
		if (!shouldRenderChildren) {
			options.skipRenderChildren = true;
		}
	}

	if (
		node.nodeName === 'ink-root' ||
		node.nodeName === 'ink-window' ||
		(node.nodeName === 'ink-box' && !hasZIndex)
	) {
		if (node.nodeName === 'ink-root') {
			DefaultStdin.Mouse.resetHandlers();
		}

		const shouldRender = !options.skipRenderChildren;

		for (const childNode of node.childNodes) {
			shouldRender &&
				renderNodeToOutput(
					childNode as DOMElement,
					output,
					{
						offsetX: x,
						offsetY: y,
						transformers: newTransformers,
						skipStaticElements,
						parentStyles: {
							backgroundColor: node.style.backgroundColor,
							borderStyle: node.style.borderStyle,
							borderColor: node.style.borderColor,
						},
						rootZIndex: options.rootZIndex,
					},
					zIndexes,
				);
		}

		if (clipped) {
			output.unclip();
		}
	}

	if (node.nodeName === 'ink-root' || options.isZIndexRoot) {
		for (const level of zIndexes) {
			level.cb();
		}
	}
};

export default renderNodeToOutput;
