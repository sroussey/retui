import React, {useEffect} from 'react';
import {useTextInput} from '../TextInput/useTextInput.js';
import Box from '../components/Box.js';
import {TextInput} from '../TextInput/TextInput.js';
import EventEmitter from 'events';
import {useIsFocus} from '../FocusContext/FocusContext.js';
import {Text, TextProps} from '../index.js';
import {T as UseEventTypes} from '../Stdin/KeyboardInputHooks/useEvent.js';
import chalk from 'chalk';
import {Except} from 'type-fest';

interface Handler {
	(args: string[], unsanitizedUserInput: string): unknown;
}

export type Commands = {
	[command: string]: Handler;
};

export type Props = {
	commands: Commands;
	displayUnknownCommand?: boolean;
	// text?: Except<TextProps, 'wrap' | 'children'>;
};

type KeyOf<T extends object> = UseEventTypes.KeyOf<T>;

const CliEmitter = new EventEmitter();

/*
 * TODO
 * props for styling cli input line...possibly Cli.Box to add box styles..
 * props for styling cli text
 * props for handling and styling post command messages and error
 * */
export function Cli(props: Props): React.ReactNode {
	const {onChange, setValue, insert} = useTextInput();

	return (
		<Box width="100" flexDirection="row">
			<Text>{insert ? ':' : ''}</Text>
			<TextInput
				onChange={onChange}
				enterKeymap={{input: ':'}}
				exitKeymap={[{key: 'return'}, {key: 'esc'}]}
				onExit={rawInput => {
					handleInput(props.commands, rawInput, {
						displayUnknownCommand: props.displayUnknownCommand ?? true,
					})
						.then((result: unknown) => {
							const sanitized: string = sanitizeResult(result);
							setValue(sanitized);
						})
						.catch((error: unknown) => {
							const sanitizedError: string = sanitizeResult(error);
							setValue(sanitizedError);
						});
				}}
				onEnter={() => {
					setValue('');
				}}
			/>
		</Box>
	);
}

type DefaultCommands = Readonly<{
	DEFAULT: Handler;
}>;
const DEFAULT: KeyOf<DefaultCommands> = 'DEFAULT';

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

async function handleInput(
	commands: Commands,
	cliInput: string,
	config: Except<Props, 'commands'>,
): Promise<unknown> {
	const [command, ...args] = toSanitizedArray(cliInput);
	const rawInput = toRawInput(cliInput, command || '');

	let handler: Handler | null = null;

	CliEmitter.emit(DEFAULT, [command, ...args], rawInput);

	if (command && commands[command]) {
		handler = commands[command] as Handler;
		CliEmitter.emit(command, args, rawInput);
	}

	if (handler) {
		return await handler(args, rawInput);
	} else if (command && config.displayUnknownCommand) {
		return chalk.red.inverse(`Unknown command: ${command}`);
	} else {
		return '';
	}
}

// Returns just the args from a cli command
function toRawInput(cliInput: string, command: string): string {
	return cliInput.replace(command, '').trimStart();
}

function toSanitizedArray(rawInput: string): string[] {
	return rawInput
		.trimStart()
		.trimEnd()
		.split(' ')
		.filter(c => c !== '');
}

function sanitizeResult(result: unknown): string {
	const replace = (result: string) => result.replace(/\t|\n/g, ' ');

	if (typeof result === 'string' || typeof result === 'number') {
		return replace(`${result}`);
	}

	if (result instanceof Error) {
		return replace(result.message);
	}

	return '';
}
