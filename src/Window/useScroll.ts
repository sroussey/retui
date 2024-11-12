import {useState} from 'react';
import assert from 'assert';
import {ScrollAPIInit, UseScrollOpts, UseScrollReturn} from './types.js';
import {ScrollAPI} from './ScrollAPI.js';

type State = ScrollAPIInit['state'];
type Return = UseScrollReturn;
type Opts = UseScrollOpts;

export function useScroll(items: unknown[] | string, opts: Opts): Return {
	assert(opts.windowSize !== 'fit');

	const [state, setState] = useState<State>({
		idx: 0,
		start: 0,
		end: Math.min(opts.windowSize ?? items.length, items.length),
		_winSize: opts.windowSize ?? items.length,
	});

	const LENGTH = items.length;
	const WINDOW_SIZE = Math.min(state._winSize ?? items.length, items.length);

	const scrollAPI = new ScrollAPI({state, setState, LENGTH, WINDOW_SIZE, opts});
	scrollAPI.handle();

	const scrollState = state;
	const setScrollState = (nextState: State) => {
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
