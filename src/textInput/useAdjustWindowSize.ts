import {useEffect, useRef} from 'react';
import {useResponsiveDimensions} from '../useResponsiveDimensions/useResponsiveDimensions.js';
import {Return as UseTextInputReturn} from './useTextInput.js';

type State = ReturnType<UseTextInputReturn['onChange']>['state'];
type Update = ReturnType<UseTextInputReturn['onChange']>['update'];
type Return = {ref: any; availableWidth: number};

export function useAdjustWindowSize(state: State, update: Update): Return {
	const responsiveDimensions = useResponsiveDimensions();
	const availableWidth = responsiveDimensions.width ?? 0;
	const previousWidth = useRef(availableWidth);

	useEffect(() => {
		const copy = {...state, window: {...state.window}};

		const currWindowSize = copy.window.end - copy.window.start + 1;

		// Decrease in window size
		if (
			currWindowSize > availableWidth &&
			previousWidth.current > availableWidth
		) {
			// we are at the end
			if (copy.window.end === copy.idx) {
				let i = previousWidth.current - availableWidth;

				while (copy.window.start < copy.window.end && i-- !== 0) {
					++copy.window.start;
				}
			} else {
				copy.window.end = copy.window.start + availableWidth - 1;
				if (copy.window.end > copy.value.length) {
					copy.window.end = copy.value.length;
				}
			}
		}

		// Increase in window size
		else if (previousWidth.current < availableWidth) {
			const endWindowLimit = copy.window.start + availableWidth - 1;
			const endValueLimit = copy.value.length;

			copy.window.end = Math.min(endWindowLimit, endValueLimit);
		}

		previousWidth.current = availableWidth;

		update(copy);
	}, [availableWidth]);

	return {
		ref: responsiveDimensions.ref,
		availableWidth: availableWidth,
	};
}
