import {useEffect, useRef, useState} from 'react';
import assert from 'assert';
import {ScrollAPIInit, UseScrollOpts, UseScrollReturn} from './types.js';
import {ScrollAPI} from './ScrollAPI.js';
import {logger} from '../index.js';

type State = ScrollAPIInit['state'];
type Return = UseScrollReturn;
type Opts = UseScrollOpts;

export function useScroll(itemsLength: number, opts: Opts): Return {
	assert(opts.windowSize !== 'fit');

	const [state, setState] = useState<State>({
		idx: 0,
		start: 0,
		end: Math.min(Math.floor(opts.windowSize ?? itemsLength), itemsLength),
		_winSize: Math.floor(opts.windowSize ?? itemsLength),
	});

	const LENGTH = itemsLength;
	const WINDOW_SIZE = Math.min(state._winSize ?? itemsLength, itemsLength);

	// If a list is using 'fit' sizing and its containing page goes out of view,
	// the window size becomes 0.  When it comes back in view, the start and end
	// indexes might be different.  This is used to attempt to keep the same
	// start and end indexes if that is possible
	const prevBounds = useRef<ScrollAPIInit['prevBounds']>({
		start: state.start,
		end: state.end,
	});

	const scrollAPI = new ScrollAPI({
		state,
		setState,
		LENGTH,
		WINDOW_SIZE,
		opts,
		prevBounds: prevBounds.current,
	});
	scrollAPI.handle();

	if (state._winSize > 0) {
		// logger.write('setting prevBounds');
		prevBounds.current = {start: state.start, end: state.end};
	}

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
