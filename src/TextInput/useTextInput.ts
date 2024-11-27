import {useState} from 'react';
import {deepEqual} from '../util.js';

export type State = {
	value: string;
	idx: number;
	insert: boolean;
	stdin: null | string;
	window: {
		start: number;
		end: number;
	};
};

export type Return = {
	value: State['value'];
	insert: boolean;
	onChange: () => {state: State; update: (nextState: State) => void};
};

export function useTextInput(initialValue: string = ''): Return {
	const [state, setState] = useState<State>({
		value: initialValue,
		idx: initialValue.length,
		insert: false,
		stdin: null,
		window: {
			start: 0,
			end: initialValue.length,
		},
	});

	/*
	 * Window API
	 * Idx changes are handled differently depending on where you are in the windowslice
	 * and how many chars the value has.  If the window is filled, the cursor is
	 * ALWAYS at the last slot in the viewing window.  Left/Right/Delete operations
	 * shift the window right or left
	 *
	 * If at the end of the slice, idx stays the same, but window shifts right (for both delete and move cursor)
	 * Left cursor and backspace both 'look' the same when at the end
	 * */

	const onChange = () => {
		return {
			update(nextState: State): void {
				if (!deepEqual(state, nextState)) {
					setState(nextState);
				}
			},
			state,
		};
	};

	function setText(): void {
		//
	}

	return {value: state.value, insert: state.insert, onChange: onChange};
}
