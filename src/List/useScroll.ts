import {useState} from 'react';
import {UseListTypes} from './useList.js';
import {ScrollAPI, ScrollAPITypes} from './ScrollAPI.js';
import assert from 'assert';

namespace T {
	export type State = {
		idx: number;
		start: number;
		end: number;
		_winSize: number;
	};

	export type Opts = Pick<
		UseListTypes.Opts,
		'circular' | 'centerScroll' | 'windowSize'
	>;

	export type Return = {
		scrollState: State;
		setScrollState: (nextState: State) => void;
		scrollAPI: ScrollAPITypes.API;
		LENGTH: number;
		WINDOW_SIZE: number;
	};
}

export type {T as UseScrollTypes};

export function useScroll(items: unknown[] | string, opts: T.Opts): T.Return {
	const [state, setState] = useState<T.State>({
		idx: 0,
		start: 0,
		end: Math.min(opts.windowSize || items.length, items.length),
		_winSize: opts.windowSize || items.length,
	});

	const LENGTH = items.length;
	const WINDOW_SIZE = Math.min(state._winSize ?? items.length, items.length);

	const scrollAPI = new ScrollAPI({state, setState, LENGTH, WINDOW_SIZE, opts});
	scrollAPI.handle();

	const scrollState = state;
	const setScrollState = (nextState: T.State) => {
		try {
			assert.deepStrictEqual(state, nextState);
			return;
		} catch {
			setState(nextState);
		}
	};

	return {
		scrollState,
		setScrollState,
		LENGTH,
		WINDOW_SIZE,
		scrollAPI: scrollAPI.getAPI(),
	};
}
