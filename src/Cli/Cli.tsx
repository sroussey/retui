import React from 'react';
import {useTextInput} from '../TextInput/useTextInput.js';
import Box from '../components/Box.js';
import {TextInput} from '../TextInput/TextInput.js';
import EventEmitter from 'events';
import {
	Binding,
	Key,
	KeyMap,
	Modal,
	Text,
	useKeymap,
	useModal,
} from '../index.js';
import {Except} from 'type-fest';
import {Props as ModalProps} from '../Modal/Modal.js';
import {SetValue, TextStyles, useCli} from './useCli.js';
import {Commands, Default, Handler} from './types.js';
import InternalEvents from '../utility/InternalEvents.js';

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

export type AbstractProps = Props & {
	autoEnter: boolean;
	showModal?: () => void;
	hideModal?: () => void;
};

const DEFAULT: Default = 'DEFAULT';

export const CliEmitter = new EventEmitter();

function AbstractCli(props: AbstractProps): React.ReactNode {
	const {onChange, setValue, insert, textStyle, value} = useCli(props);
	const {autoEnter, ...cliViewProps} = props;

	return (
		<CliView
			{...cliViewProps}
			value={value}
			onChange={onChange}
			setValue={setValue}
			insert={insert}
			textStyles={textStyle}
			autoEnter={autoEnter}
		/>
	);
}

export function Cli(props: Props): React.ReactNode {
	return <AbstractCli {...props} autoEnter={false} />;
}

type CliModalProps = Props & Except<ModalProps, 'modal'>;
export function ModalCli(props: CliModalProps): React.ReactNode {
	const {
		commands,
		displayUnknownCommand,
		enterKeymap = [{input: ':'}, {key: 'return'}],
		exitKeymap = [{key: 'return'}, {key: 'esc'}],
		prefix,
		inputStyles,
		resolveStyles,
		rejectStyles,
		persistPrefix,
		...modalProps
	} = props;

	const {modal, hideModal, showModal} = useModal({
		show: enterKeymap,
		hide: null,
	});

	return (
		<Modal modal={modal} {...modalProps}>
			<AbstractCli
				commands={commands}
				autoEnter={true}
				displayUnknownCommand={displayUnknownCommand}
				enterKeymap={enterKeymap}
				exitKeymap={exitKeymap}
				hideModal={hideModal}
				showModal={showModal}
				prefix={prefix}
				persistPrefix={persistPrefix}
				inputStyles={inputStyles}
				resolveStyles={resolveStyles}
				rejectStyles={rejectStyles}
			/>
		</Modal>
	);
}

type CliViewProps = Except<
	AbstractProps,
	'rejectStyles' | 'resolveStyles' | 'inputStyles'
> & {
	onChange: ReturnType<typeof useTextInput>['onChange'];
	setValue: SetValue;
	insert: boolean;
	value: string;
} & {
	textStyles: TextStyles;
};

function CliView({
	commands,
	enterKeymap = {input: ':'},
	exitKeymap = [{key: 'return'}, {key: 'esc'}],
	prefix = ':',
	persistPrefix = false,
	onChange,
	setValue,
	insert,
	textStyles,
	hideModal,
	// value,
	autoEnter,
}: CliViewProps): React.ReactNode {
	const prefixValue = insert || persistPrefix ? prefix : '';

	// need exitkeymaps to to handle exiting the modal here because they currently
	// only exit in insert
	// also modal should allow enter to toggle between insert

	const keymap: KeyMap = hideModal ? {closeModal: {key: 'esc'}} : {};
	const {useEvent} = useKeymap(keymap);
	useEvent('closeModal', () => {
		hideModal?.();
	});

	return (
		<Box width="100" flexDirection="row" backgroundColor="inherit">
			<Text wrap="truncate-end">{prefixValue}</Text>
			<TextInput
				textStyle={textStyles}
				onChange={onChange}
				enterKeymap={enterKeymap}
				exitKeymap={exitKeymap}
				autoEnter={autoEnter}
				// Enter and exit handlers in TextInput need to pass stdin to
				// the callbacks so that we can handle events differently
				// like in this case where esc and return should be handled differently
				onExit={(rawInput, stdin) => {
					if (stdin === Key.esc) {
						if (hideModal) {
							return hideModal();
						} else {
							return setValue('INPUT', '');
						}
					}

					if (stdin === Key.return) {
						// Idk I don't really need this
					}

					handleInput(commands, rawInput)
						.then((result: unknown) => {
							const sanitized: string = sanitizeResult(result);
							setValue('RESOLVE', sanitized);
							return sanitized;
						})
						.catch((error: unknown) => {
							const sanitized: string = sanitizeResult(error);
							setValue('REJECT', sanitized);
							return sanitized;
						})
						.then((sanitized: string) => {
							if (!sanitized) {
								hideModal?.();
							}
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
	const defaultRawInput = toRawInput(cliInput, '');
	const defaultArgs = [command ?? '', ...args];

	let handler: Handler | null = null;

	CliEmitter.emit(DEFAULT, defaultArgs, defaultRawInput);

	if (command && commands[command]) {
		if (command !== DEFAULT) {
			handler = commands[command] as Handler;
			CliEmitter.emit(command, args, rawInput);
		}
	}

	if (handler) {
		return await handler(args, rawInput);
	} else if (DEFAULT in commands) {
		return await commands[DEFAULT]?.(defaultArgs, defaultRawInput);
	} else {
		return '';
	}
}

// Returns just the args from a cli command
function toRawInput(cliInput: string, command: string): string {
	return cliInput.replace(command, '').trimStart().trimEnd();
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
