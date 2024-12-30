import {randomUUID} from 'crypto';
import {useEvent} from '../stdin/hooks/useEvent.js';
import {ListKeymaps, LIST_CMDS} from './ListKeymaps.js';
import {ViewState, WindowControl, PublicWindowControl} from './types.js';
import {useScroll} from './useScroll.js';
import {useState} from 'react';
import {useKeymap} from '../stdin/hooks/useKeymap.js';
import {Except} from 'type-fest';
import {SetState} from '../utility/types.js';

export type Opts = {
	windowSize?: number | 'fit';
	unitSize?: number | 'stretch';
	centerScroll?: boolean;
	fallthrough?: boolean;
	startIndex?: number;
	navigation?:
		| 'none'
		| 'vi-vertical'
		| 'vi-horizontal'
		| 'arrow-vertical'
		| 'arrow-horizontal';
};

type ReturnObject<T> = {
	viewState: ViewState;
	control: Except<WindowControl, 'modifyWinSize'>;
	items: T;
	setItems: SetState<T>;
};

export type Return<T extends readonly any[] | any[] | number = any[]> =
	T extends readonly any[]
		? ReturnObject<T[number][]>
		: T extends any[]
			? ReturnObject<T>
			: ReturnObject<null[]>;

export function useWindow<T extends readonly any[] | any[] | number>(
	itemsOrLength: T,
	opts: Opts = {},
): Return<T> {
	opts.centerScroll = opts.centerScroll ?? false;
	opts.navigation = opts.navigation ?? 'vi-vertical';
	opts.fallthrough = opts.fallthrough ?? false;
	opts.windowSize = opts.windowSize ?? 'fit';
	opts.unitSize = opts.unitSize ?? (opts.windowSize === 'fit' ? 1 : 'stretch');

	const [items, setItems] = useState<readonly any[] | null[]>(
		typeof itemsOrLength === 'number'
			? new Array(itemsOrLength).fill(null)
			: itemsOrLength,
	);

	let nextLength =
		typeof itemsOrLength === 'number' ? itemsOrLength : items.length;
	let explicitWindowSize: number | undefined = undefined;

	if (typeof opts.windowSize === 'number') {
		explicitWindowSize = opts.windowSize;
	} else {
		opts.windowSize = nextLength;
	}

	const {scrollState, scrollAPI, LENGTH, WINDOW_SIZE} = useScroll(nextLength, {
		centerScroll: opts.centerScroll,
		fallthrough: opts.fallthrough,
		windowSize: opts.windowSize,
		fixedWindowSize: explicitWindowSize,
		startIndex: opts.startIndex,
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

	const control: PublicWindowControl = {
		currentIndex: scrollState.idx,
		scrollUp: scrollAPI.scrollUp,
		scrollDown: scrollAPI.scrollDown,
		nextItem: scrollAPI.nextItem,
		prevItem: scrollAPI.prevItem,
		goToIndex: scrollAPI.goToIndex,
	};

	const viewStateControl: WindowControl = {
		...scrollAPI,
		currentIndex: scrollState.idx,
	};

	const viewState = Object.freeze<ViewState>({
		_start: scrollState.start,
		_end: scrollState.end,
		_idx: scrollState.idx,
		_winSize: WINDOW_SIZE,
		_itemsLen: LENGTH,
		_control: viewStateControl,
		_items: items,
		_setItems: setItems,
		_explicitWindowSize: explicitWindowSize,
		_unitSize: opts.unitSize,
	});

	return {
		viewState,
		control,
		items: items as unknown,
		setItems: setItems as unknown,
	} as Return<T>;
}
