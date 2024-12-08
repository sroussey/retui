import {useState} from 'react';
import {deepEqual} from '../utility/deepEqual.js';

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
	setValue: (nextValue: string, insert?: boolean) => void;
	enterInsert: () => void;
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

	const update = (nextState: State) => {
		setState(prev => {
			if (!deepEqual(prev, nextState)) {
				return nextState;
			} else {
				return prev;
			}
		});
	};

	const onChange = () => {
		return {update, state};
	};

	const enterInsert = () => {
		if (!state.insert) {
			setState(prev => {
				return {...prev, insert: true};
			});
		}
	};

	const setValue = (nextValue: string, insert?: boolean) => {
		setState(prev => {
			const nextInsert = insert ?? prev.insert;

			return {
				...prev,
				value: nextValue,
				idx: nextValue.length,
				insert: nextInsert,
				window: {start: 0, end: nextValue.length},
			};
		});
	};

	return {
		value: state.value,
		insert: state.insert,
		onChange: onChange,
		setValue: setValue,
		enterInsert: enterInsert,
	};
}
