// import {useScroll} from './useScroll.js';

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
}
export type {T as UseListTypes};

// export default function useList(items: unknown[], opts: T.Opts = {}) {
// 	// Set default opts
// 	opts = {
// 		windowSize: null,
// 		centerScroll: false,
// 		navigation: 'vi-vertical',
// 		circular: false,
// 		vertical: true,
// 		...opts,
// 	};
//
// 	const {scrollState, scrollAPI, LENGTH, WINDOW_SIZE} = useScroll(items, {
// 		centerScroll: opts.centerScroll,
// 		circular: opts.circular,
// 		windowSize: opts.windowSize,
// 	});
// }
