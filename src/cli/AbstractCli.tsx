import React, {useEffect} from 'react';
import EventEmitter from 'events';
import {
	KeyInput,
	Key,
	KeyMap,
	Text,
	TextInput,
	useTextInput,
	useKeymap,
	Box,
	useInput,
} from '../index.js';
import {Except} from 'type-fest';
import {SetValue, TextStyles, useCli} from './useCli.js';
import {CliConfig, CliMessage, Commands, Handler} from './types.js';
import {CliHistory} from './CliHistory.js';
import InternalEvents from '../utility/InternalEvents.js';
import {useActionPrompt} from './useActionPrompt.js';

export type CliProps = {
	config: CliConfig;
	message?: CliMessage;
	prompt?: string;
	persistPrompt?: boolean;
	enterKeymap?: KeyInput;
	exitKeymap?: KeyInput;
	inputStyles?: TextStyles;
	resolveStyles?: TextStyles;
	rejectStyles?: TextStyles;
	promptStyles?: TextStyles;
};

export type AbstractProps = CliProps & {
	autoEnter: boolean;
	showModal?: () => void;
	hideModal?: () => void;
	onUpArrow?: () => unknown;
	onDownArrow?: () => unknown;
};

export const DEFAULT = 'DEFAULT';
export const CliEmitter = new EventEmitter();

export function AbstractCli(props: AbstractProps): React.ReactNode {
	const {autoEnter, ...cliViewProps} = props;
	const {onChange, setValue, insert, enterInsert, textStyle, value} =
		useCli(props);

	const onUpArrow = () => {
		const nextCommand = CliHistory.next();
		setValue('INPUT', nextCommand, true);
	};

	const onDownArrow = () => {
		const previousCommand = CliHistory.prev();
		setValue('INPUT', previousCommand, true);
	};

	useEffect(() => {
		if (!insert) {
			CliHistory.resetIdx();
		}
	}, [insert]);

	useEffect(() => {
		if (props.message) {
			setValue(...props.message);
		}
	}, [props.message]);

	return (
		<CliView
			{...cliViewProps}
			value={value}
			onChange={onChange}
			setValue={setValue}
			insert={insert}
			enterInsert={enterInsert}
			textStyles={textStyle}
			autoEnter={autoEnter}
			onUpArrow={onUpArrow}
			onDownArrow={onDownArrow}
			promptStyles={props.promptStyles}
		/>
	);
}

type CliViewProps = Except<
	AbstractProps,
	'rejectStyles' | 'resolveStyles' | 'inputStyles'
> & {
	onChange: ReturnType<typeof useTextInput>['onChange'];
	setValue: SetValue;
	insert: boolean;
	enterInsert: () => void;
	value: string;
} & {
	textStyles: TextStyles;
};

function CliView({
	config,
	enterKeymap = {input: ':'},
	exitKeymap = [{key: 'return'}, {key: 'esc'}],
	prompt = ':',
	persistPrompt = false,
	promptStyles,
	onChange,
	setValue,
	value,
	insert,
	enterInsert,
	textStyles,
	hideModal,
	onDownArrow,
	onUpArrow,
	autoEnter,
}: CliViewProps): React.ReactNode {
	const {actionPrompt, setActionPrompt, scopedPromptEvent} = useActionPrompt(
		config,
		setValue,
		enterInsert,
	);

	const prefixValue = () => {
		return insert || persistPrompt ? prompt : '';
	};

	const NEXT_CLI_HISTORY = InternalEvents.Prefix + 'NEXT_CLI_HISTORY';
	const PREV_CLI_HISTORY = InternalEvents.Prefix + 'PREV_CLI_HISTORY';
	const HIDE_CLI_MODAL = InternalEvents.Prefix + 'HIDE_CLI_MODAL';

	const keymap: KeyMap = {};

	if (insert) {
		keymap[NEXT_CLI_HISTORY] = {key: 'up'};
		keymap[PREV_CLI_HISTORY] = {key: 'down'};
	}

	if (hideModal) {
		keymap[HIDE_CLI_MODAL] = {key: 'esc'};
	}

	const {useEvent} = useKeymap(keymap);
	useEvent(HIDE_CLI_MODAL, () => {
		hideModal?.();
	});
	useEvent(NEXT_CLI_HISTORY, () => {
		const nextHistory = CliHistory.next();
		setValue('INPUT', nextHistory, true);
	});
	useEvent(PREV_CLI_HISTORY, () => {
		const prevHistory = CliHistory.prev();
		setValue('INPUT', prevHistory, true);
	});

	useInput(
		() => {
			if (!insert && value) {
				setValue('INPUT', '');
			}

			if (!insert) {
				setActionPrompt(null);
			}
		},
		{isActive: !!(!insert && value)},
	);

	return (
		<Box width="100" flexDirection="row" backgroundColor="inherit">
			<Box height={1} width={prefixValue().length} flexShrink={0}>
				<Text wrap="truncate-end">{prefixValue()}</Text>
			</Box>
			<Box height={1} width={actionPrompt?.length ?? 0} flexShrink={0}>
				<Text wrap="truncate-end" styles={promptStyles}>
					{actionPrompt}
				</Text>
			</Box>
			<Box height={1} width="100" flexShrink={2}>
				<TextInput
					textStyle={textStyles}
					onChange={onChange}
					enterKeymap={enterKeymap}
					exitKeymap={exitKeymap}
					autoEnter={autoEnter}
					onDownArrow={onDownArrow}
					onUpArrow={onUpArrow}
					// Enter and exit handlers in TextInput need to pass stdin to
					// the callbacks so that we can handle events differently
					// like in this case where esc and return should be handled differently
					onExit={(value, stdin) => {
						if (stdin === Key.esc) {
							if (hideModal) {
								return hideModal();
							} else {
								return setValue('INPUT', '');
							}
						}

						if (actionPrompt === null) {
							handleInput(config, value)
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
						} else {
							handlePromptInput(scopedPromptEvent, value);
						}
					}}
					onEnter={() => {
						setValue('INPUT', '');
					}}
				/>
			</Box>
		</Box>
	);
}

/*
 * CliEmitter emits the command as an event and passes in the extracted arguments array,
 * along with the unfiltered raw input.  The unfiltered raw input is everything except
 * for the command, with whitespace on either end trimmed.  This exists to supply whoever
 * is writing the callback with more information if desired.
 *
 * defaultRawArgs/fullInput is the same as parsedArgs/parsedInput, but without the first
 * word extracted. The DEFAULT event is emitted every single time input is handled.
 * Because of that, we don't extract the first word, we pass in everything.
 * */
async function handleInput(
	config: CliConfig,
	cliInput: string,
): Promise<unknown> {
	const {command, parsedArgs, parsedInput, fullInput, fullArgs} =
		getData(cliInput);

	CliHistory.push(fullInput);
	CliEmitter.emit(DEFAULT, fullArgs, fullInput);

	let handler: Handler | null = null;

	if (command && config.commands?.[command]) {
		if (command !== DEFAULT) {
			handler = config.commands[command] as Handler;
			CliEmitter.emit(command, parsedArgs, parsedInput);
		}
	}

	if (handler) {
		return await handler(parsedArgs, parsedInput);
	} else if (DEFAULT in (config.commands ?? {})) {
		return await config.commands?.[DEFAULT]?.(fullArgs, fullInput);
	} else {
		return '';
	}
}

function handlePromptInput(scopedPromptEvent: string, cliInput: string): void {
	const {fullArgs, fullInput} = getData(cliInput);
	CliEmitter.emit(scopedPromptEvent, fullArgs, fullInput);
}

function getData(cliInput: string) {
	const [command, ...parsedArgs] = toSanitizedArray(cliInput);
	const parsedInput = toRawInput(cliInput, command || '');
	const fullInput = toRawInput(cliInput, '');
	const fullArgs = [command ?? '', ...parsedArgs];

	return {
		command,
		parsedArgs,
		parsedInput,
		fullInput,
		fullArgs,
	};
}

// Returns just the parsedArgs from a cli command
function toRawInput(cliInput: string, command: string): string {
	return cliInput.replace(command, '').trimStart().trimEnd();
}

function toSanitizedArray(parsedInput: string): string[] {
	return parsedInput
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
