import {useWindow} from '../../index.js';
import {UseWindowOpts} from '../types.js';

type UseWindowReturn = ReturnType<typeof useWindow<number>>;
type UsePagesReturn = {
	pageView: UseWindowReturn['viewState'];
	util: UseWindowReturn['util'];
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

	return {
		pageView: pages.viewState,
		util: pages.util,
	};
}
