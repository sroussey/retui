import {useEffect} from 'react';
import {T as KeyboardTypes} from '../Keyboard.js';
import {STDIN} from '../Stdin.js';
import {useIsFocus} from '../../FocusContext/FocusContext.js';
import {KeyOf} from '../../utility/types.js';

export namespace T {
	export interface UseEvent<T extends KeyboardTypes.KeyMap = any> {
		(cmd: keyof T, handler: (stdin: string) => unknown): void;
	}
	export type Listener = {
		event: string;
		handler: (...args: any[]) => unknown;
	};

	export type MultipleListeners<T extends KeyboardTypes.KeyMap = any> = {
		cmd: KeyOf<T>;
		handler: (...args: any[]) => unknown;
	}[];
}

export type {T as UseEventTypes};

export default function useEvent<T extends KeyboardTypes.KeyMap = any>(
	event: KeyOf<T>,
	handler: (stdin: string) => unknown,
	extraFocusCheck?: boolean,
) {
	const isFocus = useIsFocus();
	extraFocusCheck = extraFocusCheck ?? true;

	useEffect(() => {
		if (!isFocus || !extraFocusCheck) return;

		STDIN.Keyboard.addEventListener(event, handler);

		return () => {
			STDIN.Keyboard.removeEventListener(event, handler);
		};
	});
}

export function useTypedEvent<T extends KeyboardTypes.KeyMap>(): {
	useEvent: T.UseEvent<T>;
} {
	return {useEvent: useEvent as T.UseEvent<T>};
}
