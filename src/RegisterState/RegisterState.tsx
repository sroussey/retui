import React, {useEffect, useState} from 'react';
import Text from '../components/Text.js';
import Box from '../components/Box.js';
import {STDIN} from '../Stdin/Stdin.js';
import Keyboard from '../Stdin/Keyboard.js';
import InternalEvents from '../utility/InternalEvents.js';
import {deepEqual} from '../util.js';
import {Styles, TextProps} from '../index.js';
import {Except} from 'type-fest';

type State = {event: string; register: string};

type TextStyles = Except<TextProps, 'wrap' | 'children'>;

type Props = {
	eventStyles?: TextStyles;
	registerStyles?: TextStyles;
};

export function RegisterState(props: Props): React.ReactNode {
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

		STDIN.Keyboard.subscribeComponentToStateChanges(handler);

		return () => {
			STDIN.Keyboard.unsubscribeComponentToStateChanges(handler);
		};
	});

	let styles: Styles = {};
	let text = '';
	if (state.event) {
		styles = props.eventStyles ?? {};
		text = state.event;
	}
	if (!state.event && state.register) {
		styles = props.registerStyles ?? {};
		text = state.register;
	}

	return (
		<Box width="100">
			<Text wrap="truncate-end" {...styles}>
				{text ?? ' '}
			</Text>
		</Box>
	);
}
