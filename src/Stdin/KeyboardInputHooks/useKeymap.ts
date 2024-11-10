import {STDIN} from '../Stdin.js';
import {randomUUID} from 'crypto';
import {T as Keyboard} from '../Keyboard.js';
import {useEffect, useState} from 'react';
import ProcessGate from './ProcessGate.js';

export namespace T {
	export type Return = {
		register: string;
		event: string;
	};

	export type Opts = {
		trackState: boolean;
		priority: 'never' | 'always' | 'default' | 'override' | 'textinput';
	};
}

export default function useKeymap(keymap: Keyboard.KeyMap, opts?: T.Opts) {
	opts = {trackState: false, priority: 'default', ...opts};

	const [ID] = useState(randomUUID());
	const priority = opts.priority ?? 'default';
	// const focused = useIsFocus();

	if (priority !== 'never') {
		STDIN.listen();
	}

	const [data, setData] = useState<T.Return>({
		register: '',
		event: '',
	});

	useEffect(() => {
		ProcessGate.updatePriority(ID, priority);
		return () => {
			ProcessGate.removeHook(ID);
		};
	}, []);

	useEffect(() => {
		const handleStdin = (stdin: string) => {
			// if (focused && ProcessGate.canProcess(ID, priority)) {
			if (ProcessGate.canProcess(ID, priority)) {
				STDIN.Keyboard.processConfig(keymap);
			}

			const register = STDIN.Keyboard.getChars();
			const event = STDIN.Keyboard.getEvent();

			STDIN.Keyboard.emitEvent(event, stdin);
			opts?.trackState && setData({register, event: event || ''});
		};

		STDIN.Keyboard.addComponentListener(handleStdin);

		return () => {
			STDIN.Keyboard.removeComponentListener(handleStdin);
		};
	});

	return data;
}
