import {Except} from 'type-fest';
import {KeyInput, TextProps} from '../index.js';
import {useCli} from './useCli.js';

export type TextStyles = Except<TextProps, 'wrap' | 'children'>;

export type SetValue = ReturnType<typeof useCli>['setValue'];
export type CliMessage = Parameters<SetValue>;

export interface Handler {
	(args: string[], unsanitizedUserInput: string): unknown;
}

export type Commands = {
	[command: string]: Handler;
} & Partial<{DEFAULT: Handler}>;

export type Prompt = {
	keyinput: KeyInput;
	prompt: string;
	handler: Handler;
};

export type CliConfig = {
	commands?: Commands;
	prompts?: (setValue: SetValue) => Prompt[];
};

export type DefaultCliConfig = {
	commands: {DEFAULT: Handler};
};

const config: CliConfig = {
	commands: {
		foobar(args) {
			return Promise.resolve(args.join(' ') + 'good job');
		},
	},
	prompts: setValue => [
		{
			keyinput: {input: 'a'},
			prompt: 'Add something bro: ',
			handler(args) {
				setValue('INPUT', 'foooooobar');
				return Promise.resolve(`Added ${args.join(' ')}`);
			},
		},
	],
};
