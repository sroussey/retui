import {Except} from 'type-fest';
import {TextProps} from '../index.js';
import {useCli} from './useCli.js';

export type TextStyles = Except<TextProps, 'wrap' | 'children'>;

export type SetValue = ReturnType<typeof useCli>['setValue'];
export type CliMessage = Parameters<SetValue>;
export type CliActionPrompt = [string, Handler];

export interface Handler {
	(args: string[], unsanitizedUserInput: string): unknown;
}

export type Commands = {
	[command: string]: Handler;
} & Partial<{DEFAULT: Handler}>;

export type DefaultCommands = {
	DEFAULT: Handler;
};
