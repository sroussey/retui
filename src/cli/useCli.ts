import { useState } from "react";
import { useTextInput } from "../textInput/useTextInput.js";
import { Except } from "type-fest";
import { TextProps } from "../index.js";

export type StyleType = "INPUT" | "RESOLVE" | "REJECT";
export type SetValue = (style: StyleType, value: string, insert?: boolean) => void;
export type TextStyles = Except<TextProps, "wrap" | "children">;

/*
 * Wraps the setValue function from useTextInput in a function that updates the state
 * of the styles prop so that the declared styles of different outcomes accurately
 * reflect each other.
 * */
export function useCli({
	inputStyles,
	rejectStyles,
	resolveStyles,
}: {
	inputStyles?: TextStyles;
	rejectStyles?: TextStyles;
	resolveStyles?: TextStyles;
}) {
	const { onChange, setValue, insert, enterInsert, value } = useTextInput();
	const [textStyleType, setTextStyleType] = useState<StyleType>("INPUT");
	const hasStyles = inputStyles || rejectStyles || resolveStyles;

	const internalSetValue: SetValue = (
		style: StyleType,
		value: string,
		insert?: boolean,
	) => {
		setValue(value, insert);
		if (hasStyles) {
			setTextStyleType(style);
		}
	};

	let textStyle: TextStyles = {};
	if (hasStyles) {
		if (textStyleType === "INPUT" && inputStyles) {
			textStyle = inputStyles;
		}
		if (textStyleType === "REJECT" && rejectStyles) {
			textStyle = rejectStyles;
		}
		if (textStyleType === "RESOLVE" && resolveStyles) {
			textStyle = resolveStyles;
		}
	}

	return {
		onChange,
		setValue: internalSetValue,
		value,
		insert,
		enterInsert,
		textStyle,
	};
}
