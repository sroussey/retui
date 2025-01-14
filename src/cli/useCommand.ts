import {useEffect} from 'react';
import {KeyOf} from '../utility/types.js';
import {CliEmitter} from './AbstractCli.js';
import {CliConfig, DefaultCliConfig} from './types.js';
import {useIsFocus} from '../focus/FocusContext.js';

type Commands = Exclude<CliConfig['commands'], undefined>;

export function useCommand<T extends Commands = DefaultCliConfig['commands']>(
	command: KeyOf<T> | KeyOf<DefaultCliConfig['commands']>,
	handler: (args: string[]) => unknown,
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
