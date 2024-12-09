import {randomUUID} from 'crypto';
import {useEvent} from '../stdin/hooks/useEvent.js';
import {ListKeymaps, LIST_CMDS} from './ListKeymaps.js';
import {
	UseWindowOpts,
	UseWindowReturn,
	UseWindowControl,
	ViewState,
} from './types.js';
import {useScroll} from './useScroll.js';
import {useState} from 'react';
import {useKeymap} from '../stdin/hooks/useKeymap.js';

export function useWindow<T extends any[] | number>(
	itemsOrLength: T,
	opts: UseWindowOpts = {},
): UseWindowReturn<T> {
	// Set default opts
	opts = {
		centerScroll: false,
		navigation: 'vi-vertical',
		fallthrough: false,
		...opts,
	};

	const [items, setItems] = useState<any[]>(
		typeof itemsOrLength === 'number'
			? new Array(itemsOrLength).fill(null)
			: itemsOrLength,
	);

	const nextLength =
		typeof itemsOrLength === 'number' ? itemsOrLength : items.length;

	if (opts.windowSize === 'fit') {
		opts.windowSize = nextLength;
	}

	const {scrollState, scrollAPI, LENGTH, WINDOW_SIZE} = useScroll(nextLength, {
		centerScroll: opts.centerScroll,
		fallthrough: opts.fallthrough,
		windowSize: opts.windowSize,
	});

	const [ID] = useState(randomUUID());

	const getKeymap = () => {
		// prettier-ignore
		switch (opts.navigation) {
			case 'vi-vertical': return ListKeymaps.vimVertical(ID);
			case 'vi-horizontal': return ListKeymaps.vimHorizontal(ID);
			case 'arrow-vertical': return ListKeymaps.arrowVertical(ID);
			case 'arrow-horizontal': return ListKeymaps.arrowHorizontal(ID);
			default: return {};
		}
	};

	const keymap = getKeymap();

	useKeymap(keymap, {
		priority: opts.navigation !== 'none' ? 'default' : 'never',
	});
	useEvent(LIST_CMDS.increment(ID), () => {
		scrollAPI.nextItem();
	});
	useEvent(LIST_CMDS.decrement(ID), () => {
		scrollAPI.prevItem();
	});
	useEvent(LIST_CMDS.goToTop(ID), () => {
		scrollAPI.goToIndex(0);
	});
	useEvent(LIST_CMDS.goToBottom(ID), () => {
		scrollAPI.goToIndex(LENGTH - 1);
	});
	useEvent(LIST_CMDS.scrollDown(ID), () => {
		scrollAPI.scrollDown();
	});
	useEvent(LIST_CMDS.scrollUp(ID), () => {
		scrollAPI.scrollUp();
	});

	const control: UseWindowControl = {
		currentIndex: scrollState.idx,
		...scrollAPI,
	};

	const viewState: ViewState = Object.freeze({
		_start: scrollState.start,
		_end: scrollState.end,
		_idx: scrollState.idx,
		_winSize: WINDOW_SIZE,
		_itemsLen: LENGTH,
		_control: control,
		_items: items,
		_setItems: setItems,
	});

	const itemsReturn =
		typeof itemsOrLength === 'number'
			? new Array(itemsOrLength).fill(null)
			: items;

	return {
		viewState,
		control,
		items: itemsReturn,
		setItems,
	} as UseWindowReturn<T>;
}
