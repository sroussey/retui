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
	const BACKGROUND_COLOR = node.style.backgroundColor;
	const HAS_BG = typeof BACKGROUND_COLOR === 'string';
	const HAS_BORDER =
		typeof node.style.borderStyle === 'string' ||
		typeof node.style.borderStyle === 'object';

	// It is costly to render background when not necessary, so only render a bg color
	// when directed or when it makes sense (parent element has bg, so wipe the bg to prevent
	// bleed through)
	//
	// If there is no backgroundColor property set, proceed
	// If the parent element has a background set, proceed (so there isn't bleed through)
	// wipeBackground set to true (false by default) wipes the bg no matter what
	if (!HAS_BG && !parentHasBg && !node.style.wipeBackground) {
		return;
	}

	let width = node.yogaNode!.getComputedWidth();
	let height = node.yogaNode!.getComputedHeight();

	let offsetX = 0;
	let offsetY = 0;

	if (HAS_BORDER) {
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
		const colorizedLine = colorize(line, BACKGROUND_COLOR, 'background');
		if (HAS_BG) {
			content += `${colorizedLine}\n`;
		} else {
			content += `${line}\n`;
		}
	}

	output.write(x + offsetX, y + offsetY, content, {transformers: []});
};

export default renderBackgroundColor;
