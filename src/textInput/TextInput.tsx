import React, {useEffect, useRef, useState} from 'react';
import Text from '../components/Text.js';
import {
	State as UseTextInputState,
	Return as UseTextInputReturn,
} from './useTextInput.js';
import {randomUUID} from 'crypto';
import {
	Box,
	BoxProps,
	TextProps,
	KeyInput,
	useIsFocus,
	useKeymap,
} from '../index.js';
import ControlKeymap from './ControlKeymap.js';
import chalk from 'chalk';
import colorize from '../colorize.js';
import {Except} from 'type-fest';
import {useAdjustWindowSize} from './useAdjustWindowSize.js';
import {DefaultStdin} from '../stdin/Stdin.js';

type Color = Exclude<BoxProps['borderColor'], 'inherit'>;

type Props = {
	onChange: UseTextInputReturn['onChange'];
	inputStyle?: 'line' | 'area';
	onExit?: (value: string, stdin: string) => unknown;
	onEnter?: (value: string, stdin: string) => unknown;
	onDownArrow?: () => unknown;
	onUpArrow?: () => unknown;
	onKeypress?: (char: string) => unknown;
	enterKeymap?: KeyInput;
	exitKeymap?: KeyInput;
	cursorColor?: Color;
	textStyle?: Except<TextProps, 'children' | 'wrap'>;
	autoEnter?: boolean;
};

export function TextInput({
	onChange,
	onEnter,
	onExit,
	onKeypress,
	onUpArrow,
	onDownArrow,
	enterKeymap = ControlKeymap.defaultEnter,
	exitKeymap = ControlKeymap.defaultExit,
	cursorColor = 'white',
	textStyle,
	autoEnter,
	inputStyle = 'line',
}: Props): React.ReactNode {
	const {state, update} = onChange();
	const {availableWidth, ref} = useAdjustWindowSize(state, update);

	const calculateNextWindow = (
		nextState: UseTextInputState,
		dir: 'left' | 'right',
	): UseTextInputState => {
		const copy = {...nextState};

		if (dir === 'right') {
			copy.idx = copy.idx + 1 <= copy.value.length ? copy.idx + 1 : copy.idx;

			if (copy.idx > copy.window.end) {
				copy.window.end = copy.idx;
			}

			const currWinSize = copy.window.end - copy.window.start + 1;
			if (currWinSize > availableWidth) {
				copy.window.start = copy.window.start + 1;
			}
		}

		if (dir === 'left') {
			copy.idx = copy.idx - 1 >= 0 ? copy.idx - 1 : copy.idx;

			if (copy.window.end - 1 === copy.idx) {
				copy.window.end = copy.window.end - 1;
				if (copy.window.start - 1 >= 0) {
					copy.window.start = copy.window.start - 1;
				}
			}
		}

		return copy;
	};

	const [ID] = useState(randomUUID());
	const ScopedEvents = ControlKeymap.getScopedEvents(ID);
	const [InsertKeymap, Exit] = ControlKeymap.getInsertKeymap(ID, exitKeymap, {
		allowBreaking: inputStyle === 'area',
	});
	const [NormalKeymap, Enter] = ControlKeymap.getNormalKeymap(ID, enterKeymap);

	const isFocus = useIsFocus();
	const KeyMap = state.insert ? InsertKeymap : NormalKeymap;
	const priority =
		state.insert && isFocus ? 'textinput' : isFocus ? 'default' : 'never';
	const {useEvent} = useKeymap(KeyMap, {
		priority,
	});

	const handleExit = () => {
		DefaultStdin.Keyboard.setTextInputMode(false);
		update({...state, insert: false});

		// This is a bad idea.  onExit should be explicit
		// onExit?.(state.value, stdin);
	};

	const handleEnter = (stdin: string) => {
		DefaultStdin.Keyboard.setTextInputMode(true);

		const nextIdx = state.value.length;
		const nextEnd = nextIdx;
		let nextStart = 0;

		if (nextEnd - nextStart > availableWidth - 1) {
			nextStart = Math.min(nextEnd - availableWidth + 1, nextEnd);
		}

		update({
			...state,
			value: state.value,
			insert: true,
			idx: state.value.length,
			window: {...state.window, start: nextStart, end: nextEnd},
		});
		onEnter?.(state.value, stdin);
	};

	const firstEnter = useRef(true);
	useEffect(() => {
		if (availableWidth === 0 || !firstEnter.current) {
			return;
		}
		if (autoEnter && isFocus) {
			firstEnter.current = false;
			handleEnter('');
		}
	}, [availableWidth]);

	useEffect(() => {
		// If autoenter make sure insert is toggled to true
		if (autoEnter && isFocus) {
			handleEnter('');
		}

		// Make sure unfocusing also sets insert to false and executes exit handler
		if (!isFocus) {
			handleExit();
		}
	}, [isFocus]);

	useEvent(Enter, handleEnter);
	useEvent(Exit, (stdin: string) => {
		handleExit();
		onExit?.(state.value, stdin);
	});

	useEvent(ScopedEvents.keypress, (char: string) => {
		char = pruneNonPrintables(char, {allowBreaking: inputStyle === 'area'});
		onKeypress?.(char);
		if (char === '') return;

		const leftSlice = state.value.slice(0, state.idx);
		const rightSlice = state.value.slice(state.idx);
		const nextValue = leftSlice + char + rightSlice;

		if (char.length === 1) {
			const nextState = calculateNextWindow(
				{...state, value: nextValue, stdin: char},
				'right',
			);
			update(nextState);
		} else {
			const copy = {...state, value: nextValue, stdin: char};
			copy.idx += char.length;

			if (copy.idx > copy.window.end) {
				copy.window.end = copy.idx;
			}
			let currWinSize = copy.window.end - copy.window.start + 1;
			while (currWinSize > availableWidth) {
				copy.window.start = copy.window.start + 1;
				currWinSize = copy.window.end - copy.window.start + 1;
			}

			update(copy);
		}
	});

	useEvent(ScopedEvents.left, () => {
		const nextState = calculateNextWindow(state, 'left');
		update(nextState);
	});

	useEvent(ScopedEvents.right, () => {
		const nextState = calculateNextWindow(state, 'right');
		update(nextState);
	});

	useEvent(ScopedEvents.backspace, () => {
		const nextIdx = state.idx - 1 >= 0 ? state.idx - 1 : state.idx;
		const leftSlice = state.value.slice(0, nextIdx);
		const rightSlice = state.value.slice(state.idx);
		const nextValue = leftSlice + rightSlice;

		const nextState = calculateNextWindow({...state, value: nextValue}, 'left');
		update(nextState);
	});

	useEvent(ScopedEvents.return, () => {
		// Reminder that this event (or any of these events) will be pruned if
		// they are assigned to the exit binding
		if (inputStyle !== 'area') return;

		const nextValue =
			state.value.slice(0, state.idx) + '\n' + state.value.slice(state.idx);
		const nextIdx = state.idx + 1;
		update({...state, idx: nextIdx, value: nextValue});
	});

	useEvent(ScopedEvents.tab, () => {
		// Handle differently if FormFocus
		if (inputStyle !== 'area') return;

		const nextValue =
			state.value.slice(0, state.idx) + '    ' + state.value.slice(state.idx);

		update({...state, idx: state.idx + 4, value: nextValue});
	});

	useEvent(ScopedEvents.up, () => {
		onUpArrow?.();
	});

	useEvent(ScopedEvents.down, () => {
		onDownArrow?.();
	});

	return (
		<Box
			ref={ref}
			// wipeBackground={false}
			height="100"
			width="100"
			backgroundColor="inherit"
		>
			<DisplayText
				state={state}
				availableWidth={availableWidth}
				cursorColor={cursorColor}
				textStyle={textStyle}
				inputStyle={inputStyle}
			/>
		</Box>
	);
}

type DisplayTextProps = {
	state: UseTextInputState;
	availableWidth: number;
	cursorColor: Color;
	textStyle: Props['textStyle'];
	inputStyle: 'line' | 'area';
};

function DisplayText(props: DisplayTextProps): React.ReactNode {
	const {
		value,
		idx,
		insert,
		window: {start, end},
	} = props.state;

	const styles = props.textStyle ?? {};
	const cursorColor = props.cursorColor;

	if (!insert) {
		if (props.inputStyle === 'line') {
			return (
				<Text wrap="truncate-end" {...styles}>
					{value.length ? value : ' '}
				</Text>
			);
		} else {
			return (
				<Text wrap="wrap" {...styles}>
					{value.length ? value : ' '}
				</Text>
			);
		}
	}

	let leftValue = value.slice(start, idx);
	let cursorValue = value[idx] ?? '\u00A0'; // non-breaking space
	if (cursorValue === '\n') {
		cursorValue = '\u00A0' + '\n';
	}

	let rightStop = end;
	rightStop = Math.max(end, props.availableWidth);

	let rightValue = value.slice(idx + 1, rightStop);

	cursorValue = colorize(cursorValue, cursorColor, 'foreground');
	cursorValue = chalk.inverse(cursorValue);

	if (props.inputStyle === 'line') {
		return (
			<Box backgroundColor="inherit">
				<Text wrap="overflow" {...styles}>
					{leftValue}
				</Text>
				<Text wrap="overflow">{cursorValue}</Text>
				<Text wrap="overflow" {...styles}>
					{rightValue}
				</Text>
			</Box>
		);
	} else {
		const leftValue = value.slice(0, idx);
		const rightValue = value.slice(idx + 1);
		const textContent = `${leftValue}${cursorValue}${rightValue}`;
		return (
			<Box height="100" width="100" backgroundColor="inherit">
				<Text {...styles}>{textContent}</Text>
			</Box>
		);
	}
}

function pruneNonPrintables(c: string, opts: {allowBreaking: boolean}) {
	// Trim escape codes that somehow made their way through.  left/right arrow
	// keys were slipping through.
	const prePrune = c.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');

	if (opts.allowBreaking) {
		return pruneTextAreaInput(prePrune);
	} else {
		return pruneSingleLineInput(prePrune);
	}
}

function pruneSingleLineInput(c: string): string {
	const charCode = c.charCodeAt(0);

	if (charCode <= 31) return '';
	if (charCode === 127) return '';

	if (c.length > 1) {
		let word = c.slice(1);
		for (let i = 0; i < word.length; ++i) {
			const charCode = word[i]?.charCodeAt(0);
			if (
				charCode !== undefined &&
				(charCode <= 31 || word[i] === '\n' || word[i] === '\t')
			) {
				word = word.slice(0, i) + ' ' + word.slice(i + 1, word.length);
			}
		}
		return word;
	} else {
		return c;
	}
}

function pruneTextAreaInput(c: string): string {
	let word = '';
	for (let i = 0; i < c.length; ++i) {
		const char = c[i];
		if (char) {
			if (char !== '\n' && char !== '\t') {
				const charCode = char.charCodeAt(0);
				if (charCode <= 31 || charCode === 127) {
					continue;
				}
			}
			if (char === '\t') {
				word += '    ';
			}
			word += char;
		}
	}
	return word;
}
