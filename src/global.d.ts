import { type ReactNode, type Key, type LegacyRef } from "react";
import { type Except } from "type-fest";
import { type DOMElement } from "./dom.js";
import { type BaseProps } from "./baseProps.js";
import { TextProps } from "./index.ts";
import { ViewState } from "./window/types.ts";
import { IntrinsicWindowAttributes, IntrinsicWindowBaseProps } from "./window/Window.tsx";
import { IntrinsicLineProps } from "./lines/Line.tsx";

declare global {
	namespace JSX {
		// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
		interface IntrinsicElements {
			"ink-box": Ink.Box;
			"ink-text": Ink.Text;
			"ink-window": Ink.Window;
			"ink-line": Ink.Line;
		}
	}
}

declare namespace Ink {
	type Box = {
		internal_static?: boolean;
		children?: ReactNode;
		key?: Key;
		ref?: LegacyRef<DOMElement>;
		style?: Except<BaseProps, "textWrap">;
		ID?: string;
		isPageFocus?: boolean;
		setLeftActive?: (b: boolean) => void;
		setRightActive?: (b: boolean) => void;
		internalStyles?: BaseProps;
	};

	type Text = {
		children?: ReactNode;
		key?: Key;
		// was just BaseProps
		style?: BaseProps & TextProps;

		// eslint-disable-next-line @typescript-eslint/naming-convention
		internal_transform?: (children: string, index: number) => string;
		internalStyles?: TextProps;
	};

	type Window = IntrinsicWindowAttributes;

	type Line = {
		key?: Key;
		style?: IntrinsicLineProps;
	};
}
