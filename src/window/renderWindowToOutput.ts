import assert from 'assert';
import {DOMElement, logger, Logger} from '../index.js';
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
): boolean {
	const viewState = node.attributes[WindowAttributes.viewState] as ViewState;
	assert(viewState); // viewState is a required prop in Window components

	const height = node.yogaNode!.getComputedHeight();
	const width = node.yogaNode!.getComputedWidth();

	// might need a variable passed to viewState that says if viewState was explicitly set

	const unitsAreStretch = node.style.unitSize === 'stretch';

	// If the unitSize is 'stretch', still want to prune off excess
	const unitSize =
		typeof node.style.unitSize === 'number' ? node.style.unitSize : 1;

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

	logger.write(maxCtrUnits, {...viewState, _items: undefined});

	// There isn't enough room to render all units
	if (maxCtrUnits < maxStateUnits) {
		logger.write("isn't enough room, updating...");
		viewState._control.modifyWinSize(maxCtrUnits);
		return false;
	}
	// There is room to render more units, but not excess
	if (maxCtrUnits > viewState._winSize && maxCtrUnits <= viewState._itemsLen) {
		logger.write('have more room available, but not excess, updating...');
		viewState._control.modifyWinSize(maxCtrUnits);
		return false;
	}

	if (maxCtrUnits > viewState._winSize && maxCtrUnits >= viewState._itemsLen) {
		// Don't want to update if viewState is already at itemsLen
		if (viewState._winSize !== viewState._itemsLen) {
			logger.write('have EXCESS more room available, updating...');
			viewState._control.modifyWinSize(viewState._itemsLen);
		}
	}

	renderScrollbar(x, y, node, output);
	return true;
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

	let scrollbarOutput = getUnstyledString(node, viewState, scrollbar);

	// Write scrollbar to output
	let nx = x;
	let ny = y;
	if (node.style.flexDirection === 'column') {
		if (scrollbar.align === 'start' && scrollbar.position === 'edge') {
			--nx;
		}
		if (scrollbar.align === 'end') {
			nx += width - 1;
			if (scrollbar.position === 'edge') {
				++nx;
			}
		}
	}
	if (node.style.flexDirection === 'row') {
		if (scrollbar.align === 'start' && scrollbar.position === 'edge') {
			--ny;
		}
		if (scrollbar.align === 'end') {
			ny += height - 1;
			if (scrollbar.position === 'edge') {
				++ny;
			}
		}
	}

	output.write(nx, ny, scrollbarOutput, {transformers: []});
}

function getUnstyledString(
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
		const barStr = colorizeBar(colChar.repeat(barLength), scrollbar);
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
