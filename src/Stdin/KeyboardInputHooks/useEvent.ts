import {useEffect} from 'react';
import {Types as Keyboard} from '../Keyboard.js';
import {STDIN} from '../Stdin.js';

export default function useEvent<T extends Keyboard.KeyMap = any>(
	event: KeyOf<T>,
	handler: (stdin: string) => unknown,
	extraFocusCheck: boolean,
) {
	// const isFocus = useIsFocus();
	const isFocus = true;
	extraFocusCheck = extraFocusCheck ?? true;

	useEffect(() => {
		if (!isFocus || !extraFocusCheck) return;

		STDIN.Keyboard.addEventListener(event, handler);

		return () => {
			STDIN.Keyboard.removeEventListener(event, handler);
		};
	});
}

export function useTypedEvent<T extends Keyboard.KeyMap>(): {
	useEvent: UseEvent<T>;
} {
	return {useEvent: useEvent as UseEvent<T>};
}

export interface UseEvent<T = any> {
	(cmd: keyof T, handler: (stdin: string) => unknown): void;
}

export type Listener = {
	event: string;
	handler: (...args: any[]) => unknown;
};

export type MultipleListeners<T extends Keyboard.KeyMap = any> = {
	cmd: KeyOf<T>;
	handler: (...args: any[]) => unknown;
}[];

// Remove symbol keyof an object and converts numbers to strings
export type KeyOf<T extends object> = T extends object
	? ToString<keyof T>
	: never;

type ToString<T> = T extends number ? `${T}` : T extends string ? T : never;
