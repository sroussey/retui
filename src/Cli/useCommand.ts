import {useEffect} from 'react';
import {KeyOf} from '../utility/types.js';
import {CliEmitter} from './Cli.js';
import {Commands, DefaultCommands} from './types.js';
import {useIsFocus} from '../FocusContext/FocusContext.js';

export function useCommand<T extends Commands = DefaultCommands>(
	command: KeyOf<T> | KeyOf<DefaultCommands>,
	handler: (...args: string[]) => unknown,
	extraFocusCheck?: boolean,
) {
	const isFocus = useIsFocus();
	extraFocusCheck = extraFocusCheck ?? true;

	useEffect(() => {
		if (!isFocus || !extraFocusCheck) return;

		CliEmitter.on(command, handler);

		return () => {
			CliEmitter.off(command, handler);
		};
	});
}
