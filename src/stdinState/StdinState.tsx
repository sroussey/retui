import React, {useEffect, useState} from 'react';
import Text from '../components/Text.js';
import Box from '../components/Box.js';
import {DefaultStdin} from '../stdin/Stdin.js';
import Keyboard from '../stdin/Keyboard.js';
import InternalEvents from '../utility/InternalEvents.js';
import {deepEqual} from '../utility/deepEqual.js';
import {Except} from 'type-fest';
import {StylesConfig} from '../utility/types.js';

type State = {event: string; register: string};

type TextStyles = Except<StylesConfig['Text'], 'wrap'>;

type Props = {
	showEvents?: boolean;
	showRegister?: boolean;
	eventStyles?: TextStyles;
	registerStyles?: TextStyles;
	width?: number;
};

export function StdinState({
	eventStyles = {},
	registerStyles = {},
	showEvents = true,
	showRegister = true,
	width = 20,
}: Props): React.ReactNode {
	const [state, setState] = useState<State>({
		event: '',
		register: '',
	});

	useEffect(() => {
		const handler = (keyboardState: Keyboard['state']) => {
			const isTextInput = keyboardState.isTextInput;
			const nextEvent = keyboardState.event ?? '';
			const nextRegister = keyboardState.chars ?? '';

			const update = (next: State) => {
				setState(prev => {
					if (!deepEqual(next, prev)) {
						return next;
					} else {
						return prev;
					}
				});
			};

			if (isTextInput || nextEvent.startsWith(InternalEvents.Prefix)) {
				return update({event: '', register: ''});
			}

			update({event: nextEvent, register: nextRegister});
		};

		DefaultStdin.Keyboard.subscribeComponentToStateChanges(handler);

		return () => {
			DefaultStdin.Keyboard.unsubscribeComponentToStateChanges(handler);
		};
	});

	let styles: TextStyles = {};
	let text = '';
	if (state.event && showEvents) {
		styles = eventStyles;
		text = state.event;
	}
	if (!state.event && state.register && showRegister) {
		styles = registerStyles;
		text = state.register;
	}

	return (
		<Box width={width}>
			<Text wrap="truncate-end" {...styles}>
				{text ?? ' '}
			</Text>
		</Box>
	);
}
