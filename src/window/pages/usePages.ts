import {useWindow} from '../useWindow.js';
import {UseWindowOpts} from '../types.js';

type UseWindowReturn = ReturnType<typeof useWindow<number>>;
export type PageView = UseWindowReturn['viewState'] & {
	_numPages: number;
};
type UsePagesReturn = {
	pageView: PageView;
	control: UseWindowReturn['control'];
};
type UsePagesOpts = Pick<UseWindowOpts, 'fallthrough'>;

export function usePages(
	numPages: number,
	opts: UsePagesOpts = {fallthrough: false},
): UsePagesReturn {
	const windowOpts: UseWindowOpts = {
		windowSize: 1,
		centerScroll: false,
		navigation: 'none',
		fallthrough: opts.fallthrough,
	};

	const pages = useWindow(numPages, windowOpts);

	const pageView: PageView = Object.freeze({
		...pages.viewState,
		_numPages: numPages,
	});

	return {
		pageView,
		control: pages.control,
	};
}
