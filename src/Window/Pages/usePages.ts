import {KeyMap, useWindow} from '../../index.js';
import {UseWindowOpts, UseWindowUtil, ViewState} from '../types.js';

export namespace UsePages {
	export type Return = {
		pagesState: ViewState;
		pagesUtil: Util;
	};

	export type Util = {
		goToPage: UseWindowUtil['goToIndex'];
		nextPage: UseWindowUtil['nextItem'];
		prevPage: UseWindowUtil['prevItem'];
		currentPageIndex: UseWindowUtil['currentIndex'];
	};

	export type Opts = {
		windowSize?: number | null;
		fallthrough?: boolean;
	};
}

export function usePages(
	pages: any[],
	opts: UsePages.Opts = {},
): UsePages.Return {
	opts.windowSize = opts.windowSize ?? 1;

	const {viewState, util} = useWindow(pages, {...opts, navigation: 'none'});

	const pagesUtil: UsePages.Util = {
		goToPage: util.goToIndex,
		nextPage: util.nextItem,
		prevPage: util.prevItem,
		currentPageIndex: util.currentIndex,
	};

	return {
		pagesState: viewState,
		pagesUtil,
	};
}
