import {useState, useRef, useEffect} from 'react';
import measureElement from '../measure-element.js';
import useStdout from '../hooks/use-stdout.js';
import {useListener} from '../useListener/useListener.js';
import {Node} from 'yoga-wasm-web';

namespace UseResponsiveDimensions {
	export type Dimensions = {height: number | null; width: number | null};
	export type SetDim = React.Dispatch<React.SetStateAction<Dimensions>>;
	export type Ref = React.MutableRefObject<any>;
	export type Return = Dimensions & {ref: Ref};
}

/*
 * Updates height and width dimensions of ref object and ensures that screen
 * resizes update state.
 * */

process.stdout.setMaxListeners(Infinity);

type Props = {
	shouldUpdate?: boolean;
	dependencies?: any[];
};
export function useResponsiveDimensions(
	props?: Props,
): UseResponsiveDimensions.Return {
	const shouldUpdate = props?.shouldUpdate ?? true;
	const dependencies = props?.dependencies ?? [{}];

	const ref = useRef();
	const {stdout} = useStdout();

	const [dim, setDim] = useState<UseResponsiveDimensions.Dimensions>({
		height: null,
		width: null,
	});

	const update = () => {
		const nextDim = measureElement(ref.current as any);

		if (!nextDim.width || !nextDim.height) return;
		if (!shouldUpdate) return;

		// Calling every render creates max update depth warning
		// setDim(prevDim => {
		// 	if (
		// 		nextDim.width !== prevDim?.width ||
		// 		nextDim.height !== prevDim?.height
		// 	) {
		// 		return nextDim;
		// 	} else {
		// 		return prevDim;
		// 	}
		// });

		if (dim.width !== nextDim.width || dim.height !== nextDim.height) {
			setDim(nextDim);
		}
	};

	useEffect(update, dependencies);
	// useListener(stdout, 'resize', update, [stdout]);
	useListener(stdout, 'resize', update);

	return {height: dim.height, width: dim.width, ref};
}
