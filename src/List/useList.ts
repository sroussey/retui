import useEvent from '../Stdin/KeyboardInputHooks/useEvent.js';
import useKeymap from '../Stdin/KeyboardInputHooks/useKeymap.js';
import {ListKeymaps, LIST_CMDS} from './ListKeymaps.js';
import {useScroll} from './useScroll.js';
import {ScrollAPITypes} from './ScrollAPI.js';

namespace T {
	export type Opts = {
		windowSize?: number | null;
		navigation?:
			| 'none'
			| 'vi-vertical'
			| 'vi-horizontal'
			| 'arrow-vertical'
			| 'arrow-horizontal';
		centerScroll?: boolean;
		circular?: boolean;
		vertical?: boolean;
	};

	export type Util = {
		currentIndex: number;
	} & ScrollAPITypes.API;

	export type ViewState = Readonly<{
		/* Used within the List component */
		_start: number;
		_end: number;
		_idx: number;
		_winSize: number;
		_itemsLen: number;
		_util: Util;
		_items: any[];
	}>;

	export type Return = {
		viewState: ViewState;
		util: Util;
	};
}
export type {T as UseListTypes};

export default function useList(items: unknown[], opts: T.Opts = {}): T.Return {
	// Set default opts
	opts = {
		windowSize: null,
		centerScroll: false,
		navigation: 'vi-vertical',
		circular: false,
		vertical: true,
		...opts,
	};

	const {scrollState, scrollAPI, LENGTH, WINDOW_SIZE} = useScroll(items, {
		centerScroll: opts.centerScroll,
		circular: opts.circular,
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

	const util: T.Util = {
		currentIndex: scrollState.idx,
		...scrollAPI,
	};

	const viewState: T.ViewState = Object.freeze({
		_start: scrollState.start,
		_end: scrollState.end,
		_idx: scrollState.idx,
		_winSize: WINDOW_SIZE,
		_itemsLen: LENGTH,
		_util: util,
		_items: items,
	});

	return {
		viewState,
		util,
	};
}
