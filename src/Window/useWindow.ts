import useEvent from '../Stdin/KeyboardInputHooks/useEvent.js';
import useKeymap from '../Stdin/KeyboardInputHooks/useKeymap.js';
import {ListKeymaps, LIST_CMDS} from './ListKeymaps.js';
import {
	UseWindowOpts,
	UseWindowReturn,
	UseWindowUtil,
	ViewState,
} from './types.js';
import {useScroll} from './useScroll.js';

export function useWindow(
	items: unknown[],
	opts: UseWindowOpts,
): UseWindowReturn {
	// Set default opts
	opts = {
		windowSize: null,
		centerScroll: false,
		navigation: 'vi-vertical',
		fallthrough: false,
		vertical: true,
		...opts,
	};

	let fitWindow = false;
	if (opts.windowSize === 'fit') {
		fitWindow = true;
		opts.windowSize = 0;
	}

	const {scrollState, scrollAPI, LENGTH, WINDOW_SIZE} = useScroll(items, {
		centerScroll: opts.centerScroll,
		fallthrough: opts.fallthrough,
		windowSize: opts.windowSize,
	});

	const getKeymap = () => {
		// prettier-ignore
		switch (opts.navigation) {
			case 'vi-vertical': return ListKeymaps.vimVertical;
			case 'vi-horizontal': return ListKeymaps.vimHorizontal;
			case 'arrow-vertical': return ListKeymaps.arrowVertical;
			case 'arrow-horizontal': return ListKeymaps.arrowHorizontal;
			default: return {};
		}
	};

	const keymap = getKeymap();

	useKeymap(keymap);
	useEvent(LIST_CMDS.increment, () => {
		scrollAPI.nextItem();
	});
	useEvent(LIST_CMDS.decrement, () => {
		scrollAPI.prevItem();
	});
	useEvent(LIST_CMDS.goToTop, () => {
		scrollAPI.goToIndex(0);
	});
	useEvent(LIST_CMDS.goToBottom, () => {
		scrollAPI.goToIndex(LENGTH - 1);
	});
	useEvent(LIST_CMDS.scrollDown, () => {
		scrollAPI.scrollDown();
	});
	useEvent(LIST_CMDS.scrollUp, () => {
		scrollAPI.scrollUp();
	});

	const util: UseWindowUtil = {
		currentIndex: scrollState.idx,
		...scrollAPI,
	};

	const viewState: ViewState = Object.freeze({
		_start: scrollState.start,
		_end: scrollState.end,
		_idx: scrollState.idx,
		_winSize: WINDOW_SIZE,
		_itemsLen: LENGTH,
		_util: util,
		_items: items,
		_fitWindow: fitWindow,
	});

	return {
		viewState,
		util,
	};
}
