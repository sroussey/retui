import colorize from './colorize.js';
import {DOMNode} from './dom.js';
import Output from './output.js';

const renderBackgroundColor = (
	x: number,
	y: number,
	node: DOMNode,
	output: Output,
): void => {
	if (typeof node.style.backgroundColor !== 'string') return;

	const BACKGROUND_COLOR = node.style.backgroundColor;
	const HAS_BORDER =
		typeof node.style.borderStyle === 'string' ||
		typeof node.style.borderStyle === 'object';

	let width = node.yogaNode!.getComputedWidth();
	let height = node.yogaNode!.getComputedHeight();

	let offsetX = 0;
	let offsetY = 0;

	if (HAS_BORDER) {
		width -= 2;
		height -= 2;

		offsetX += 1;
		offsetY += 1;

		// Mod dimensions
		node.style.borderLeft === false && ++width;
		node.style.borderRight === false && ++width;
		node.style.borderTop === false && ++height;
		node.style.borderBottom === false && ++height;

		// Mod offset
		node.style.borderLeft === false && --offsetX;
		node.style.borderTop === false && --offsetY;
	}

	let content = '';
	for (let i = 0; i < height; ++i) {
		const line = ' '.repeat(width);
		const colorizedLine = colorize(line, BACKGROUND_COLOR, 'background');
		content += `${colorizedLine}\n`;
	}

	output.write(x + offsetX, y + offsetY, content, {transformers: []});
};

export default renderBackgroundColor;
