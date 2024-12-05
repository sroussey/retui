import React, {useState} from 'react';
import {useTextInput} from '../TextInput/useTextInput.js';
import {Except} from 'type-fest';
import {TextProps} from '../index.js';

export type StyleType = 'INPUT' | 'RESOLVE' | 'REJECT';
export type SetValue = (style: StyleType, value: string) => void;
export type TextStyles = Except<TextProps, 'wrap' | 'children'>;

export function useCli({
	inputStyles,
	rejectStyles,
	resolveStyles,
}: {
	inputStyles?: TextStyles;
	rejectStyles?: TextStyles;
	resolveStyles?: TextStyles;
}) {
	const {onChange, setValue, insert, value} = useTextInput();
	const [textStyleType, setTextStyleType] = useState<StyleType>('INPUT');
	const hasStyles = inputStyles || rejectStyles || resolveStyles;

	const internalSetValue: SetValue = (
		style: typeof textStyleType,
		value: string,
	) => {
		setValue(value);
		if (hasStyles) {
			setTextStyleType(style);
		}
	};

	let textStyle: TextStyles = {};
	if (hasStyles) {
		if (textStyleType === 'INPUT' && inputStyles) {
			textStyle = inputStyles;
		}
		if (textStyleType === 'REJECT' && rejectStyles) {
			textStyle = rejectStyles;
		}
		if (textStyleType === 'RESOLVE' && resolveStyles) {
			textStyle = resolveStyles;
		}
	}

	return {onChange, setValue: internalSetValue, value, insert, textStyle};
}
