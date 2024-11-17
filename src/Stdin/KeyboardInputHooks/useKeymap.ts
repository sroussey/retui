import {STDIN} from '../Stdin.js';
import {randomUUID} from 'crypto';
import {T as Keyboard} from '../Keyboard.js';
import {useEffect, useState} from 'react';
import ProcessGate from './ProcessGate.js';
import useEvent, {useTypedEvent} from './useEvent.js';
import {useIsFocus} from '../../FocusContext/FocusContext.js';

export namespace T {
	export type Return<U extends Keyboard.KeyMap = any> = {
		register: string;
		event: string;
		useEvent: typeof useEvent<U>;
	};

	export type Opts = {
		trackState?: boolean;
		priority: 'never' | 'always' | 'default' | 'override' | 'textinput';
	};
}

export default function useKeymap<U extends Keyboard.KeyMap = any>(
	keymap: U,
	opts?: T.Opts,
): T.Return<U> {
	opts = {trackState: false, priority: 'default', ...opts};

	const [ID] = useState(randomUUID());
	const priority = opts.priority ?? 'default';
	const focused = useIsFocus();

	if (priority !== 'never') {
		STDIN.listen();
	}

	const [data, setData] = useState<Omit<T.Return, 'useEvent'>>({
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
			if (focused && ProcessGate.canProcess(ID, priority)) {
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

	const {useEvent} = useTypedEvent<U>();

	return {
		...data,
		useEvent,
	};
}
