import {KeyOf} from '../utility/types.js';
import {Except} from 'type-fest';
import {TextProps} from '../index.js';

export interface Handler {
	(args: string[], unsanitizedUserInput: string): unknown;
}

export type DefaultCommands = {
	DEFAULT: Handler;
};

export type Default = KeyOf<DefaultCommands>;

export type Commands = {
	[command: string]: Handler;
} & Partial<DefaultCommands>;

export type TextStyles = Except<TextProps, 'wrap' | 'children'>;
