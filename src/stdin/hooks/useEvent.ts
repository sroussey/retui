import { useEffect } from "react";
import { DefaultStdin } from "../Stdin.js";
import { useIsFocus } from "../../focus/FocusContext.js";
import { KeyOf } from "../../utility/types.js";
import { useModalLevel } from "../../modal/ModalContext.js";
import ModalStack from "../../modal/ModalStack.js";
import { KeyMap } from "../Keyboard.js";
import { KeyInput } from "../../index.js";

export namespace T {
	export interface UseEvent<T extends KeyMap = any> {
		(
			cmd: keyof T,
			handler: (stdin: string, keyinput: KeyInput | KeyInput[]) => unknown,
		): void;
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

export type { T as UseEventTypes };

export function useEvent<T extends KeyMap = any>(
	event: KeyOf<T>,
	handler: (stdin: string, keyinput: KeyInput | KeyInput[]) => unknown,
	extraFocusCheck?: boolean,
) {
	const isFocus = useIsFocus();
	extraFocusCheck = extraFocusCheck ?? true;

	const componentLevel = useModalLevel();

	useEffect(() => {
		if (!isFocus || !extraFocusCheck) return;

		const innerHandler = (stdin: string, keyinput: KeyInput | KeyInput[]) => {
			if (ModalStack.isActiveModalLevel(componentLevel)) {
				handler(stdin, keyinput);
			}
		};

		DefaultStdin.Keyboard.addEventListener(event, innerHandler);

		return () => {
			DefaultStdin.Keyboard.removeEventListener(event, innerHandler);
		};
	}, [{}]);
}

export function useTypedEvent<T extends KeyMap>(): {
	useEvent: T.UseEvent<T>;
} {
	return { useEvent: useEvent as T.UseEvent<T> };
}
