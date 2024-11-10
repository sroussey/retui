import {useEffect} from 'react';
import {T as KeyboardTypes} from '../Keyboard.js';
import {STDIN} from '../Stdin.js';

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

	// Remove symbol keyof an object and converts numbers to strings
	export type KeyOf<T extends object> = T extends object
		? ToString<keyof T>
		: never;

	export type ToString<T> = T extends number
		? `${T}`
		: T extends string
			? T
			: never;
}

export type {T as UseEventTypes};

export default function useEvent<T extends KeyboardTypes.KeyMap = any>(
	event: T.KeyOf<T>,
	handler: (stdin: string) => unknown,
	extraFocusCheck?: boolean,
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

export function useTypedEvent<T extends KeyboardTypes.KeyMap>(): {
	useEvent: T.UseEvent<T>;
} {
	return {useEvent: useEvent as T.UseEvent<T>};
}
