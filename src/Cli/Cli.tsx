import React, {useState} from 'react';
import {useTextInput} from '../TextInput/useTextInput.js';
import Box from '../components/Box.js';
import {TextInput} from '../TextInput/TextInput.js';
import EventEmitter from 'events';
import {Binding, Modal, Text, useKeymap} from '../index.js';
import {Except} from 'type-fest';
import {Props as ModalProps} from '../Modal/Modal.js';
import InternalEvents from '../utility/InternalEvents.js';
import {randomUUID} from 'crypto';
import {SetValue, TextStyles, useCli} from './useCli.js';
import {Commands, Default, Handler} from './types.js';

export type Props = {
	commands: Commands;
	prefix?: string;
	persistPrefix?: boolean;
	enterKeymap?: Binding | Binding[];
	exitKeymap?: Binding | Binding[];
	displayUnknownCommand?: boolean;
	inputStyles?: TextStyles;
	resolveStyles?: TextStyles;
	rejectStyles?: TextStyles;
};

const DEFAULT: Default = 'DEFAULT';

export const CliEmitter = new EventEmitter();

export function Cli(props: Props): React.ReactNode {
	const {onChange, setValue, insert, textStyle} = useCli(props);

	return (
		<CliText
			{...props}
			onChange={onChange}
			setValue={setValue}
			insert={insert}
			textStyles={textStyle}
		/>
	);
}

type CliModalProps = Props & Except<ModalProps, 'visible'>;
Cli.Modal = function (props: CliModalProps): React.ReactNode {
	const {
		commands,
		displayUnknownCommand,
		exitKeymap,
		enterKeymap,
		prefix,
		inputStyles,
		resolveStyles,
		rejectStyles,
		persistPrefix,
		...modalProps
	} = props;

	const {onChange, setValue, insert, value, textStyle} = useCli(props);

	const [ID] = useState(randomUUID());
	const exitModal = InternalEvents.getInternalEvent('exitModal', ID);
	const {useEvent} = useKeymap({[exitModal]: {key: 'esc'}});
	useEvent(exitModal, () => {
		if (!insert && value) {
			setValue('INPUT', '');
		}
	});

	const visible = !!(insert || value);

	return (
		<Modal {...modalProps} visible={visible}>
			<CliText
				commands={commands}
				displayUnknownCommand={displayUnknownCommand}
				onChange={onChange}
				setValue={setValue}
				insert={insert}
				textStyles={textStyle}
				enterKeymap={enterKeymap}
				exitKeymap={exitKeymap}
				prefix={prefix}
				persistPrefix={persistPrefix}
			/>
		</Modal>
	);
};

type CliTextProps = Except<
	Props,
	'rejectStyles' | 'resolveStyles' | 'inputStyles'
> & {
	onChange: ReturnType<typeof useTextInput>['onChange'];
	setValue: SetValue;
	insert: boolean;
} & {
	textStyles: TextStyles;
};

function CliText({
	commands,
	enterKeymap = {input: ':'},
	exitKeymap = [{key: 'return'}, {key: 'esc'}],
	prefix = ':',
	persistPrefix = false,
	onChange,
	setValue,
	insert,
	textStyles,
}: CliTextProps): React.ReactNode {
	const prefixValue = insert || persistPrefix ? prefix : '';

	return (
		<Box width="100" flexDirection="row" backgroundColor="inherit">
			<Text wrap="truncate-end">{prefixValue}</Text>
			<TextInput
				textStyle={textStyles}
				onChange={onChange}
				enterKeymap={enterKeymap}
				exitKeymap={exitKeymap}
				onExit={rawInput => {
					handleInput(commands, rawInput)
						.then((result: unknown) => {
							const sanitized: string = sanitizeResult(result);
							setValue('RESOLVE', sanitized);
						})
						.catch((error: unknown) => {
							const sanitized: string = sanitizeResult(error);
							setValue('REJECT', sanitized);
						});
				}}
				onEnter={() => {
					setValue('INPUT', '');
				}}
			/>
		</Box>
	);
}

async function handleInput(
	commands: Commands,
	cliInput: string,
): Promise<unknown> {
	const [command, ...args] = toSanitizedArray(cliInput);
	const rawInput = toRawInput(cliInput, command || '');
	const rawDefaultInput = toRawInput(cliInput, '');

	let handler: Handler | null = null;

	CliEmitter.emit(DEFAULT, [command, ...args], rawDefaultInput);

	if (command && commands[command]) {
		if (command !== DEFAULT) {
			handler = commands[command] as Handler;
			CliEmitter.emit(command, args, rawInput);
		}
	}

	if (handler) {
		return await handler(args, rawInput);
	} else if (DEFAULT in commands) {
		return await commands[DEFAULT]?.([command ?? '', ...args], rawDefaultInput);
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
