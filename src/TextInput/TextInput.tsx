import React, {useEffect, useRef, useState} from 'react';
import Text from '../components/Text.js';
import {
	State as UseTextInputState,
	Return as UseTextInputReturn,
} from './useTextInput.js';
import {randomUUID} from 'crypto';
import {Binding, Box, BoxProps, useIsFocus, useKeymap} from '../index.js';
import ControlKeymap from './ControlKeymap.js';
import chalk from 'chalk';
import {useResponsiveDimensions} from '../useResponsiveDimensions/useResponsiveDimensions.js';
import colorize from '../colorize.js';

type Color = Exclude<BoxProps['borderColor'], 'inherit'>;

type Props = {
	onChange: UseTextInputReturn['onChange'];
	enterKeymap?: Binding | Binding[];
	exitKeymap?: Binding | Binding[];
	color?: Color;
	cursorColor?: Color;
	// autoEnter?: boolean;
};

export function TextInput({
	onChange,
	enterKeymap = ControlKeymap.defaultEnter,
	exitKeymap = ControlKeymap.defaultExit,
	color,
	cursorColor,
}: Props): React.ReactNode {
	const {state, update} = onChange();

	const responsiveDimensions = useResponsiveDimensions();

	const [ID] = useState(randomUUID());
	const ScopedEvents = ControlKeymap.getScopedEvents(ID);
	const [InsertKeymap, Exit] = ControlKeymap.getInsertKeymap(ID, exitKeymap);
	const [NormalKeymap, Enter] = ControlKeymap.getNormalKeymap(ID, enterKeymap);

	const isFocus = useIsFocus();
	const KeyMap = state.insert ? InsertKeymap : NormalKeymap;

	const {useEvent} = useKeymap(KeyMap, {
		priority:
			state.insert && isFocus ? 'textinput' : isFocus ? 'default' : 'never',
	});

	const availableWidth = responsiveDimensions.width ?? 0;
	const previousWidth = useRef(availableWidth);

	useEffect(() => {
		const copy = {...state, window: {...state.window}};
		console.log('start copy', JSON.stringify(copy, null, 4));

		const currWindowSize = copy.window.end - copy.window.start + 1;

		// Decrease in window size
		if (
			currWindowSize > availableWidth &&
			previousWidth.current > availableWidth
		) {
			// we are at the end
			if (copy.window.end === copy.idx) {
				let i = previousWidth.current - availableWidth;

				while (copy.window.start < copy.window.end && i-- !== 0) {
					++copy.window.start;
				}
			} else {
				copy.window.end = copy.window.start + availableWidth - 1;
				if (copy.window.end > copy.value.length) {
					copy.window.end = copy.value.length;
				}
			}
		}

		// Increase in window size
		else if (previousWidth.current < availableWidth) {
			const endWindowLimit = copy.window.start + availableWidth - 1;
			const endValueLimit = copy.value.length;

			copy.window.end = Math.min(endWindowLimit, endValueLimit);
		}

		previousWidth.current = availableWidth;

		// console.log('end copy', JSON.stringify(copy, null, 4));

		update(copy);
	}, [availableWidth]);

	function getWindowChange(
		nextState: UseTextInputState,
		dir: 'left' | 'right',
	): UseTextInputState {
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
	}

	function pruneSpecialChars(c: string): string {
		const charCode = c.charCodeAt(0);

		// Allow pasting text
		if (charCode === 22 || charCode === 98) {
		}

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

	useEvent(Enter, () => {
		const nextIdx = state.value.length;
		const nextEnd = nextIdx;
		let nextStart = 0;

		if (nextEnd - nextStart > availableWidth - 1) {
			nextStart = nextEnd - availableWidth + 1;
		}

		update({
			...state,
			insert: true,
			idx: state.value.length,
			window: {...state.window, start: nextStart, end: nextEnd},
		});
	});

	useEvent(Exit, () => {
		update({...state, insert: false});
	});

	useEvent(ScopedEvents.keypress, (char: string) => {
		char = pruneSpecialChars(char);
		if (char === '') return;

		const leftSlice = state.value.slice(0, state.idx);
		const rightSlice = state.value.slice(state.idx);
		const nextValue = leftSlice + char + rightSlice;

		if (char.length === 1) {
			const nextState = getWindowChange(
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
		const nextState = getWindowChange(state, 'left');
		update(nextState);
	});

	useEvent(ScopedEvents.right, () => {
		const nextState = getWindowChange(state, 'right');
		update(nextState);
	});

	useEvent(ScopedEvents.backspace, () => {
		const nextIdx = state.idx - 1 >= 0 ? state.idx - 1 : state.idx;
		const leftSlice = state.value.slice(0, nextIdx);
		const rightSlice = state.value.slice(state.idx);
		const nextValue = leftSlice + rightSlice;

		const nextState = getWindowChange({...state, value: nextValue}, 'left');
		update(nextState);
	});

	useEvent(ScopedEvents.return, () => {
		// Reminder that this event (or any of these events) will be pruned if
		// they are assigned to the exit binding
	});

	useEvent(ScopedEvents.tab, () => {
		// Handle differently if FormFocus
	});

	useEvent(ScopedEvents.up, () => {
		// Handle differently if FormFocus
	});

	useEvent(ScopedEvents.down, () => {
		// Handle differently if FormFocus
	});

	return (
		<Box ref={responsiveDimensions.ref} height="100" width="100">
			<DisplayText
				state={state}
				availableWidth={availableWidth}
				color={color}
				cursorColor={cursorColor}
			/>
		</Box>
	);
}

type DisplayTextProps = {
	state: UseTextInputState;
	availableWidth: number;
	cursorColor: Color;
	color: Color;
};

function DisplayText(props: DisplayTextProps): React.ReactNode {
	const {
		value,
		idx,
		insert,
		window: {start, end},
	} = props.state;

	const color = props.color;
	const cursorColor = props.cursorColor ?? color;

	if (!insert) {
		return (
			<Text wrap="truncate-end" color={color}>
				{value.length ? value : ' '}
			</Text>
		);
	}

	let leftValue = value.slice(start, idx);
	let cursorValue = value[idx] ?? ' ';

	let rightStop = end;
	rightStop = Math.max(end, props.availableWidth);

	let rightValue = value.slice(idx + 1, rightStop);

	if (leftValue) {
		leftValue = colorize(leftValue, color, 'foreground');
	}
	if (rightValue) {
		rightValue = colorize(rightValue, color, 'foreground');
	}
	cursorValue = colorize(cursorValue, cursorColor, 'foreground');
	cursorValue = chalk.inverse(cursorValue);

	const displayValue = `${leftValue}${cursorValue}${rightValue}`;

	// console.log(displayValue, props.availableWidth, props.state);

	return <Text wrap="overflow">{displayValue}</Text>;
}
