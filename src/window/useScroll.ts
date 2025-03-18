import { useRef, useState } from "react";
import assert from "assert";
import { ScrollAPI, ScrollAPIPublicFns } from "./ScrollAPI.js";
import { Opts as UseWindowOpts } from "./useWindow.js";

export type Opts = Pick<
	UseWindowOpts,
	"fallthrough" | "centerScroll" | "windowSize" | "startIndex"
> & { fixedWindowSize?: number };

export type State = {
	idx: number;
	start: number;
	end: number;
	_winSize: number;
};

export type Return = {
	scrollState: State;
	setScrollState: (nextState: State) => void;
	scrollAPI: ScrollAPIPublicFns;
	LENGTH: number;
	WINDOW_SIZE: number;
};

export type PrevBounds = { start: number; end: number };

export function useScroll(itemsLength: number, opts: Opts): Return {
	assert(opts.windowSize !== "fit" && opts.windowSize !== undefined);

	const [state, setState] = useState<State>({
		idx: 0,
		start: 0,
		end: Math.min(Math.floor(opts.windowSize ?? itemsLength), itemsLength),
		_winSize: Math.min(Math.floor(opts.windowSize ?? itemsLength), itemsLength),
	});

	const LENGTH = itemsLength;
	const WINDOW_SIZE = Math.min(
		state._winSize ?? itemsLength,
		itemsLength,
		// opts.windowSize ?? Infinity,
	);

	// If a list is using 'fit' sizing and its containing page goes out of view,
	// the window size becomes 0.  When it comes back in view, the start and end
	// indexes might be different.  This is used to attempt to keep the same
	// start and end indexes if that is possible
	const prevBounds = useRef<PrevBounds>({
		start: state.start,
		end: state.end,
	});

	const firstScroll = useRef(true);
	const scrollAPI = new ScrollAPI({
		state,
		setState,
		LENGTH,
		WINDOW_SIZE,
		opts,
		prevBounds: prevBounds.current,
	});

	const desiredWinSize =
		opts.fixedWindowSize !== undefined
			? Math.min(opts.fixedWindowSize, itemsLength)
			: WINDOW_SIZE;

	if (desiredWinSize !== state._winSize) {
		scrollAPI.modifyWinSize(desiredWinSize);
	} else {
		scrollAPI.handle(
			firstScroll.current && opts.startIndex ? opts.startIndex : undefined,
		);
		firstScroll.current = false;
	}

	if (state._winSize > 0) {
		prevBounds.current = { start: state.start, end: state.end };
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
