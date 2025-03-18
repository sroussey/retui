import React, { type ReactNode } from "react";
import chalk from "chalk";
import colorize from "../colorize.js";
import { type BaseProps } from "../baseProps.js";
import {
	DropReadonly,
	MutableBaseProps,
	StylesConfig,
	type Color,
} from "../utility/types.js";

export type Props = {
	/**
	 * Change text color. Ink uses chalk under the hood, so all its functionality is supported.
	 */
	readonly color?: Color;

	/**
	 * Same as `color`, but for background.
	 */
	readonly backgroundColor?: BaseProps["backgroundColor"];

	/**
	 * Dim the color (emit a small amount of light).
	 */
	readonly dimColor?: boolean;

	/**
	 * Make the text bold.
	 */
	readonly bold?: boolean;

	/**
	 * Make the text italic.
	 */
	readonly italic?: boolean;

	/**
	 * Make the text underlined.
	 */
	readonly underline?: boolean;

	/**
	 * Make the text crossed with a line.
	 */
	readonly strikethrough?: boolean;

	/**
	 * Inverse background and foreground colors.
	 */
	readonly inverse?: boolean;

	/**
	 * This property tells Ink to wrap or truncate text if its width is larger than container.
	 * If `wrap` is passed (by default), Ink will wrap text and split it into multiple lines.
	 * If `truncate-*` is passed, Ink will truncate text instead, which will result in one line of text with the rest cut off.
	 */
	readonly wrap?: BaseProps["textWrap"];

	readonly children?: ReactNode;

	readonly styles?: StylesConfig["Text"]; // isn't omitting styles
};

export const styleText =
	(style: BaseProps & Props) =>
	(children: string): string => {
		if (style.dimColor) {
			children = chalk.dim(children);
		}

		if (style.color) {
			children = colorize(children, style.color, "foreground");
		}

		if (style.backgroundColor && style.backgroundColor !== "inherit") {
			children = colorize(children, style.backgroundColor, "background");
		}

		if (style.bold) {
			children = chalk.bold(children);
		}

		if (style.italic) {
			children = chalk.italic(children);
		}

		if (style.underline) {
			children = chalk.underline(children);
		}

		if (style.strikethrough) {
			children = chalk.strikethrough(children);
		}

		if (style.inverse) {
			children = chalk.inverse(children);
		}

		return children;
	};

/**
 * This component can display text, and change its style to make it colorful, bold, underline, italic or strikethrough.
 */
export default function Text({
	color,
	backgroundColor = "inherit",
	dimColor = false,
	bold = false,
	italic = false,
	underline = false,
	strikethrough = false,
	inverse = false,
	wrap = "wrap",
	styles,
	children,
}: Props) {
	if (children === undefined || children === null) {
		return null;
	}

	const textStyles: MutableBaseProps & DropReadonly<Props> = {
		flexGrow: 0,
		flexShrink: 1,
		flexDirection: "row",
		textWrap: wrap,
		backgroundColor,
		color,
		inverse,
		dimColor,
		bold,
		italic,
		underline,
		strikethrough,
		wrap,
	};

	if (styles) {
		for (const key in styles) {
			// @ts-ignore
			if (styles[key] && !textStyles[key]) {
				// @ts-ignore
				textStyles[key] = styles[key];
			}
		}
	}

	const transform = styleText(textStyles);

	return (
		<ink-text
			style={textStyles}
			internal_transform={transform}
			internalStyles={{ ...textStyles }}
		>
			{children}
		</ink-text>
	);
}
