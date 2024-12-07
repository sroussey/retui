import {useEffect} from 'react';
import {STDIN} from '../Stdin.js';
import {useIsFocus} from '../../FocusContext/FocusContext.js';
import {KeyOf} from '../../utility/types.js';
import {useModalLevel} from '../../Modal/ModalContext.js';
import ModalStack from '../../Modal/ModalStack.js';
import {KeyMap} from '../Keyboard.js';

export namespace T {
	export interface UseEvent<T extends KeyMap = any> {
		(cmd: keyof T, handler: (stdin: string) => unknown): void;
	}
	export type Listener = {
		event: string;
		handler: (...args: any[]) => unknown;
	};

	export type MultipleListeners<T extends KeyMap = any> = {
		cmd: KeyOf<T>;
		handler: (...args: any[]) => unknown;
	}[];
}

export type {T as UseEventTypes};

export default function useEvent<T extends KeyMap = any>(
	event: KeyOf<T>,
	handler: (stdin: string) => unknown,
	extraFocusCheck?: boolean,
) {
	const isFocus = useIsFocus();
	extraFocusCheck = extraFocusCheck ?? true;

	const componentLevel = useModalLevel();

	useEffect(() => {
		if (!isFocus || !extraFocusCheck) return;

		const innerHandler = (stdin: string) => {
			if (ModalStack.isActiveModalLevel(componentLevel)) {
				handler(stdin);
			}
		};

		STDIN.Keyboard.addEventListener(event, innerHandler);

		return () => {
			STDIN.Keyboard.removeEventListener(event, innerHandler);
		};
	});
}

export function useTypedEvent<T extends KeyMap>(): {
	useEvent: T.UseEvent<T>;
} {
	return {useEvent: useEvent as T.UseEvent<T>};
}
