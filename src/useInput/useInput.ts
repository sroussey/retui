import {DefaultStdin} from '../stdin/Stdin.js';
import {useListener} from '../useListener/useListener.js';
import Keyboard, {KeyboardState} from '../stdin/Keyboard.js';
import {SpecialKeys as Key} from '../stdin/AsciiMap.js';

const Emitter = DefaultStdin.Keyboard.getEmitter();

interface UseInputCb {
	(input: string, key: Key): unknown;
}

type Opts = {
	/*
	 * @default true
	 * */
	isActive?: boolean;

	/*
	 * @default 'char'
	 * */
	inputType?: 'char' | 'register';
};

export function useInput(cb: UseInputCb, opts: Opts = {isActive: true}): void {
	opts = {isActive: true, inputType: 'char', ...opts};

	const wrapper = (char: string, state: KeyboardState) => {
		const input =
			state.ctrlKeys || (opts.inputType === 'char' ? char : state.chars) || '';

		if (opts.isActive) {
			cb(input, state.specialKeys);
		}
	};

	useListener(Emitter, Keyboard.InputRecieved, wrapper);
}
