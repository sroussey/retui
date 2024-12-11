import assert from 'assert';
import {DOMElement} from '../index.js';
import Output from '../output.js';
import {IntrinsicWindowBaseProps, WindowAttributes} from './Window.js';
import {ViewState} from './types.js';
import colorize from '../colorize.js';
import chalk from 'chalk';

export function renderWindowToOutput(
	x: number,
	y: number,
	node: DOMElement,
	output: Output,
): void {
	const viewState = node.attributes[WindowAttributes.viewState] as ViewState;
	assert(viewState); // viewState is a required prop in Window components

	const height = node.yogaNode!.getComputedHeight();
	const width = node.yogaNode!.getComputedWidth();

	const explicitWindowSize = viewState._explicitWindowSize;

	if (explicitWindowSize === undefined) {
		// If the unitSize is 'stretch', still want to prune off excess
		let unitSize =
			typeof viewState._unitSize === 'number' ? viewState._unitSize : 1;

		if (node.style.gap) {
			unitSize += node.style.gap;
		}

		// The maximum amount of units we can render based on the viewState.
		const maxStateUnits = Math.min(viewState._winSize, viewState._itemsLen);

		// The maximum amount of units we can render based on the container.
		let maxCtrUnits = viewState._winSize;
		if (node.style.flexDirection === 'column') {
			maxCtrUnits = Math.floor((height ?? 0) / unitSize);
		}
		if (node.style.flexDirection === 'row') {
			maxCtrUnits = Math.floor((width ?? 0) / unitSize);
		}

		// There isn't enough room to render all units
		if (maxCtrUnits < maxStateUnits) {
			viewState._control.modifyWinSize(maxCtrUnits);
		}
		// There is room to render more units, but not excess
		else if (
			maxCtrUnits > viewState._winSize &&
			maxCtrUnits <= viewState._itemsLen
		) {
			viewState._control.modifyWinSize(maxCtrUnits);
		}

		// There is excess room to render more units
		else if (
			maxCtrUnits > viewState._winSize &&
			maxCtrUnits >= viewState._itemsLen
		) {
			// Don't want to update if viewState is already at itemsLen
			if (viewState._winSize !== viewState._itemsLen) {
				viewState._control.modifyWinSize(viewState._itemsLen);
			}
		}
	}

	renderScrollbar(x, y, node, output);
}

export function renderScrollbar(
	x: number,
	y: number,
	node: DOMElement,
	output: Output,
): void {
	const scrollbar = node.style.scrollbar;
	assert(scrollbar);

	const viewState = node.attributes[WindowAttributes.viewState] as ViewState;
	assert(viewState);

	// There are no items or the winSize is not constrained by the viewing window,
	// so we don't need a scrollbar.
	if (!viewState._itemsLen || viewState._winSize >= viewState._itemsLen) {
		return;
	}

	const height = node.yogaNode!.getComputedHeight();
	const width = node.yogaNode!.getComputedWidth();

	let scrollbarOutput = getScrollbarString(node, viewState, scrollbar);

	// Write scrollbar to output
	let nx = x;
	let ny = y;
	if (node.style.flexDirection === 'column') {
		if (scrollbar.align === 'end') {
			nx += width - 1;
		}
	}
	if (node.style.flexDirection === 'row') {
		if (scrollbar.align === 'end') {
			ny += height - 1;
		}
	}

	output.write(nx, ny, scrollbarOutput, {transformers: []});
}

function getScrollbarString(
	node: DOMElement,
	viewState: ViewState,
	scrollbar: Exclude<IntrinsicWindowBaseProps['scrollbar'], undefined>,
): string {
	const height = node.yogaNode!.getComputedHeight();
	const width = node.yogaNode!.getComputedWidth();

	let colChar = '';
	let rowChar = '';
	if (typeof scrollbar.style === 'object') {
		colChar = scrollbar.style.char;
		rowChar = scrollbar.style.char;
	} else {
		colChar = scrollbar.style === 'bold' ? ' ' : '┃';
		rowChar = scrollbar.style === 'bold' ? ' ' : '▬';
	}

	const {_itemsLen, _winSize, _start, _end} = viewState;

	if (node.style.flexDirection === 'column') {
		const barLength = Math.max(
			0,
			Math.ceil(height * (Math.min(_itemsLen, _winSize) / _itemsLen)),
		);
		const preStart = height * (_start / _itemsLen);
		const preEnd = height * ((_itemsLen - _end) / _itemsLen);
		const startLength = Math.max(0, Math.floor(preStart));
		const endLength = Math.max(0, Math.floor(preEnd));

		const startStr = ' \n'.repeat(startLength);
		const barStr = colorizeBar(`${colChar}\n`.repeat(barLength), scrollbar);
		const endStr = ' \n'.repeat(endLength);

		return startStr + barStr + endStr;
	} else {
		const barLength = Math.max(
			0,
			Math.ceil(width * (Math.min(_itemsLen, _winSize) / _itemsLen)),
		);
		const preStart = width * (_start / _itemsLen);
		const preEnd = width * ((_itemsLen - _end) / _itemsLen);
		const startLength = Math.max(0, Math.floor(preStart));
		const endLength = Math.max(0, Math.floor(preEnd));

		const startStr = ' '.repeat(startLength);
		const barStr = colorizeBar(rowChar.repeat(barLength), scrollbar);
		const endStr = ' '.repeat(endLength);

		return startStr + barStr + endStr;
	}
}

function colorizeBar(
	bar: string,
	scrollbar: Exclude<IntrinsicWindowBaseProps['scrollbar'], undefined>,
): string {
	bar = colorize(bar, scrollbar.color, 'foreground');

	if (scrollbar.dimColor) {
		bar = chalk.dim(bar);
	}

	if (scrollbar.style === 'bold') {
		bar = chalk.inverse(bar);
	}

	return bar;
}
