import React, { useEffect, useState } from "react";
import EventEmitter from "events";
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
} from "../index.js";
import { Except } from "type-fest";
import { SetValue, TextStyles, useCli } from "./useCli.js";
import { Commands, CliMessage, Handler, CliActionPrompt } from "./types.js";
import { CliHistory } from "./CliHistory.js";
import InternalEvents from "../utility/InternalEvents.js";

export type CliProps = {
	commands: Commands;
	message?: CliMessage;
	actionPrompt?: CliActionPrompt;
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

export const DEFAULT = "DEFAULT";
export const CliEmitter = new EventEmitter();

export function AbstractCli(props: AbstractProps): React.ReactNode {
	const { autoEnter, ...cliViewProps } = props;
	const { onChange, setValue, insert, enterInsert, textStyle, value } = useCli(props);

	const onUpArrow = () => {
		const nextCommand = CliHistory.next();
		setValue("INPUT", nextCommand, true);
	};

	const onDownArrow = () => {
		const previousCommand = CliHistory.prev();
		setValue("INPUT", previousCommand, true);
	};

	useEffect(() => {
		if (!insert) {
			CliHistory.resetIdx();
		}
	}, [insert]);

	useEffect(() => {
		setImmediate(() => {
			if (props.message) {
				setValue(...props.message);
			}
		});
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
			actionPrompt={props.actionPrompt}
		/>
	);
}

type CliViewProps = Except<
	AbstractProps,
	"rejectStyles" | "resolveStyles" | "inputStyles"
> & {
	onChange: ReturnType<typeof useTextInput>["onChange"];
	setValue: SetValue;
	insert: boolean;
	enterInsert: () => void;
	value: string;
} & {
	textStyles: TextStyles;
};

function CliView({
	commands,
	enterKeymap = { input: ":" },
	exitKeymap = [{ key: "return" }, { key: "esc" }],
	prompt = ":",
	persistPrompt = false,
	promptStyles,
	onChange,
	setValue,
	value,
	insert,
	textStyles,
	hideModal,
	onDownArrow,
	onUpArrow,
	autoEnter,
	enterInsert,
	actionPrompt = ["", () => {}],
}: CliViewProps): React.ReactNode {
	const prefixValue = () => {
		return insert || persistPrompt ? prompt : "";
	};

	const NEXT_CLI_HISTORY = InternalEvents.Prefix + "NEXT_CLI_HISTORY";
	const PREV_CLI_HISTORY = InternalEvents.Prefix + "PREV_CLI_HISTORY";
	const HIDE_CLI_MODAL = InternalEvents.Prefix + "HIDE_CLI_MODAL";

	const keymap: KeyMap = {};

	if (insert) {
		keymap[NEXT_CLI_HISTORY] = { key: "up" };
		keymap[PREV_CLI_HISTORY] = { key: "down" };
	}

	if (hideModal) {
		keymap[HIDE_CLI_MODAL] = { key: "esc" };
	}

	const { useEvent } = useKeymap(keymap);
	useEvent(HIDE_CLI_MODAL, () => {
		hideModal?.();
	});
	useEvent(NEXT_CLI_HISTORY, () => {
		const nextHistory = CliHistory.next();
		setValue("INPUT", nextHistory, true);
	});
	useEvent(PREV_CLI_HISTORY, () => {
		const prevHistory = CliHistory.prev();
		setValue("INPUT", prevHistory, true);
	});

	useInput(
		() => {
			if (!insert && value) {
				setValue("INPUT", "");
			}
		},
		{ isActive: !!(!insert && value) },
	);

	const [showAP, setShowAP] = useState(false);

	useEffect(() => {
		if (actionPrompt[0] !== "") {
			setShowAP(true);
			enterInsert();
		} else {
			setShowAP(false);
		}
	}, [actionPrompt]);

	const [actionPromptText, actionPromptHandler] = actionPrompt;

	return (
		<Box width="100" flexDirection="row" backgroundColor="inherit">
			<Box height={1} width={prefixValue().length} flexShrink={0}>
				<Text wrap="truncate-end">{prefixValue()}</Text>
			</Box>
			{showAP && (
				<Box height={1} width={actionPromptText.length ?? 0} flexShrink={0}>
					<Text wrap="truncate-end" styles={promptStyles}>
						{actionPromptText}
					</Text>
				</Box>
			)}
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
						setShowAP(false);

						if (stdin === Key.esc) {
							if (hideModal) {
								return hideModal();
							} else {
								return setValue("INPUT", "");
							}
						}

						const promise = showAP
							? handlePromptInput(actionPromptHandler, value)
							: handleInput(commands, value);

						promise
							.then((result: unknown) => {
								const sanitized: string = sanitizeResult(result);
								setImmediate(() => {
									setValue("RESOLVE", sanitized);
								});
								return sanitized;
							})
							.catch((error: unknown) => {
								const sanitized: string = sanitizeResult(error);
								setImmediate(() => {
									setValue("REJECT", sanitized);
								});
								return sanitized;
							})
							.then((sanitized: string) => {
								if (!sanitized) {
									hideModal?.();
								}
							});
					}}
					onEnter={() => {
						setValue("INPUT", "");
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
async function handleInput(commands: Commands, cliInput: string): Promise<unknown> {
	const { command, parsedArgs, parsedInput, fullInput, fullArgs } = getData(cliInput);

	CliHistory.push(fullInput);
	CliEmitter.emit(DEFAULT, fullArgs, fullInput);

	let handler: Handler | null = null;

	if (command && commands?.[command]) {
		if (command !== DEFAULT) {
			handler = commands[command] as Handler;
			CliEmitter.emit(command, parsedArgs, parsedInput);
		}
	}

	if (handler) {
		return await handler(parsedArgs, parsedInput);
	} else if (DEFAULT in (commands ?? {})) {
		return await commands?.[DEFAULT]?.(fullArgs, fullInput);
	} else {
		return "";
	}
}

async function handlePromptInput(handler: Handler, cliInput: string): Promise<unknown> {
	const { fullArgs, fullInput } = getData(cliInput);
	return await handler(fullArgs, fullInput);
}

function getData(cliInput: string) {
	const [command, ...parsedArgs] = toSanitizedArray(cliInput);
	const parsedInput = toRawInput(cliInput, command || "");
	const fullInput = toRawInput(cliInput, "");
	const fullArgs = [command ?? "", ...parsedArgs];

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
	return cliInput.replace(command, "").trimStart().trimEnd();
}

function toSanitizedArray(parsedInput: string): string[] {
	return parsedInput
		.trimStart()
		.trimEnd()
		.split(" ")
		.filter((c) => c !== "");
}

function sanitizeResult(result: unknown): string {
	const replace = (result: string) => result.replace(/\t|\n/g, " ");

	if (typeof result === "string" || typeof result === "number") {
		return replace(`${result}`);
	}

	if (result instanceof Error) {
		return replace(result.message);
	}

	return "";
}
