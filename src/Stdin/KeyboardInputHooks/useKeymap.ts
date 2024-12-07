import {STDIN} from '../Stdin.js';
import {randomUUID} from 'crypto';
import {useEffect, useState} from 'react';
import ProcessGate from './ProcessGate.js';
import useEvent, {useTypedEvent} from './useEvent.js';
import {useIsFocus} from '../../FocusContext/FocusContext.js';
import ModalStack from '../../Modal/ModalStack.js';
import {useModalLevel} from '../../Modal/ModalContext.js';
import {KeyMap} from '../Keyboard.js';

export namespace T {
	export type Return<U extends KeyMap = any> = {
		register: string;
		event: string;
		useEvent: typeof useEvent<U>;
	};

	export type Opts = {
		trackState?: boolean;
		priority: 'never' | 'always' | 'default' | 'override' | 'textinput';
	};
}

export default function useKeymap<U extends KeyMap = any>(
	keymap: U,
	opts?: T.Opts,
): T.Return<U> {
	opts = {trackState: false, priority: 'default', ...opts};

	const [ID] = useState(randomUUID());
	const priority = opts.priority ?? 'default';
	const focused = useIsFocus();
	const componentLevel = useModalLevel(); // If not within a Modal this is just 0

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
	}, [priority]);

	useEffect(() => {
		const handleStdin = (stdin: string) => {
			const canProcess =
				ProcessGate.canProcess(ID, priority) &&
				ModalStack.isActiveModalLevel(componentLevel);

			if (focused && canProcess) {
				STDIN.Keyboard.processConfig(keymap);
			}

			const register = STDIN.Keyboard.getChars();
			const event = STDIN.Keyboard.getEvent();

			STDIN.Keyboard.emitEvent(event, stdin);
			if (opts?.trackState) {
				if (canProcess) {
					setData({register, event: event || ''});
				} else if (data.register !== '' || data.event !== '') {
					setData({register: '', event: ''});
				}
			}
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
