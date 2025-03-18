import { useWindow } from "../useWindow.js";
import { Opts as UseWindowOpts } from "../useWindow.js";
import { Return as UseWindowReturn } from "../useWindow.js";

export type PageView = UseWindowReturn["viewState"] & {
	_numPages: number;
};

export type PagesControl = {
	currentPage: UseWindowReturn["control"]["currentIndex"];
	goToPage: UseWindowReturn["control"]["goToIndex"];
	nextPage: UseWindowReturn["control"]["nextItem"];
	prevPage: UseWindowReturn["control"]["prevItem"];
};

type Return = {
	pageView: PageView;
	control: PagesControl;
};
type Opts = Pick<UseWindowOpts, "fallthrough">;

export function usePages(numPages: number, opts: Opts = { fallthrough: false }): Return {
	const windowOpts: UseWindowOpts = {
		windowSize: 1,
		centerScroll: false,
		navigation: "none",
		fallthrough: opts.fallthrough,
	};

	const pages = useWindow(numPages, windowOpts);

	const pageView: PageView = Object.freeze({
		...pages.viewState,
		_numPages: numPages,
	});

	return {
		pageView,
		control: {
			currentPage: pages.control.currentIndex,
			goToPage: pages.control.goToIndex,
			nextPage: pages.control.nextItem,
			prevPage: pages.control.prevItem,
		},
	};
}
