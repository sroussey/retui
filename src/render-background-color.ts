import colorize from './colorize.js';
import {DOMNode} from './dom.js';
import Output from './output.js';

const renderBackgroundColor = (
	x: number,
	y: number,
	node: DOMNode,
	output: Output,
	parentHasBg: boolean,
): void => {
	const {backgroundColor, zIndex, wipeBackground, borderStyle} = node.style;

	const hasBorder =
		typeof borderStyle === 'string' || typeof borderStyle === 'object';
	const hasBackgroundColor =
		backgroundColor && typeof backgroundColor === 'string';

	// If no backgroundColor property set, respect the explicit setting of false to wipeBackground
	if (wipeBackground === false && !hasBackgroundColor) return;

	let wipe = wipeBackground ?? false;
	if (!wipe) {
		// Prevent bleed through
		if (parentHasBg) {
			wipe = true;
		}
		// Make sure zIndex'd elements actually appear 'above' other elements
		if (typeof zIndex === 'number' && zIndex > 0) {
			wipe = true;
		}
		// If there is a background color set, then the background is wiped as part of the process
		if (hasBackgroundColor) {
			wipe = true;
		}

		if (!wipe) return;
	}

	let width = node.yogaNode!.getComputedWidth();
	let height = node.yogaNode!.getComputedHeight();

	let offsetX = 0;
	let offsetY = 0;

	if (hasBorder) {
		width -= 2;
		height -= 2;

		offsetX += 1;
		offsetY += 1;

		// Modify dimensions
		node.style.borderLeft === false && ++width;
		node.style.borderRight === false && ++width;
		node.style.borderTop === false && ++height;
		node.style.borderBottom === false && ++height;

		// Modify offset
		node.style.borderLeft === false && --offsetX;
		node.style.borderTop === false && --offsetY;
	}

	let content = '';
	for (let i = 0; i < height; ++i) {
		const line = ' '.repeat(width);
		const colorizedLine = colorize(line, backgroundColor, 'background');
		if (hasBackgroundColor) {
			content += `${colorizedLine}\n`;
		} else {
			content += `${line}\n`;
		}
	}

	output.write(x + offsetX, y + offsetY, content, {transformers: []});
};

export default renderBackgroundColor;

// It is costly to render background when not necessary, so only render a bg color
// when directed or when it makes sense (parent element has bg, so wipe the bg to prevent
// bleed through)
