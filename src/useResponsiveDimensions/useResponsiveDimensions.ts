import {useState, useRef, useEffect} from 'react';
import measureElement from '../measure-element.js';
import useStdout from '../hooks/use-stdout.js';
import {useListener} from '../useListener/useListener.js';

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
export function useResponsiveDimensions(): UseResponsiveDimensions.Return {
	const ref = useRef();
	const {stdout} = useStdout();

	const [dim, setDim] = useState<UseResponsiveDimensions.Dimensions>({
		height: null,
		width: null,
	});

	const update = () => {
		const nextDim = measureElement(ref.current as any);

		if (!nextDim.width || !nextDim.height) return;

		setDim(prevDim => {
			if (
				nextDim.width !== prevDim?.width ||
				nextDim.height !== prevDim?.height
			) {
				return nextDim;
			} else {
				return prevDim;
			}
		});
	};

	useEffect(update);
	useListener(stdout, 'resize', update);

	return {height: dim.height, width: dim.width, ref};
}
