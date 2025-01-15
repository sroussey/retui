import {useState} from 'react';
import {CliConfig, Prompt} from './types.js';
import InternalEvents from '../utility/InternalEvents.js';
import {randomUUID} from 'crypto';
import {KeyInput, useEvent, useKeymap} from '../index.js';
import {deepEqual} from '../utility/deepEqual.js';
import {CliEmitter} from './AbstractCli.js';
import {SetValue} from './useCli.js';
import {toArray} from '../utility/toArray.js';

export function useActionPrompt(
	config: CliConfig,
	setValue: SetValue,
	enterInsert: () => void,
) {
	const [ID] = useState(randomUUID());
	const [actionPrompt, setActionPrompt] = useState<string | null>(null);

	const scopedPromptEvent = InternalEvents.getInternalEvent(
		'FINISHED_READING_PROMPT_INPUT',
	);
	const internalKeymapEvent = InternalEvents.getInternalEvent(
		'PROMPT_ACTION',
		ID,
	);
	const keyinput: KeyInput = [];

	const prompts = config.prompts?.(setValue) ?? [];

	prompts.forEach(prompt => {
		if (Array.isArray(prompt.keyinput)) {
			prompt.keyinput.forEach(kp => keyinput.push(kp));
		} else {
			keyinput.push(prompt.keyinput);
		}
	});

	const handler =
		(prompts: Prompt[]) =>
		(_: string, keyinput: KeyInput | KeyInput[]): void => {
			if (!prompts.length) return;

			const [prompt, ...rest] = prompts;

			if (
				prompt &&
				toArray(prompt.keyinput).some(ki => deepEqual(ki, keyinput))
			) {
				const cb = (args: string[], unsanitizedUserInput: string) => {
					prompt.handler(args, unsanitizedUserInput);
					setActionPrompt(null);
				};

				// We don't need to worry about unsubscribing to avoid stale state
				// here because this handler is gauranteed to be called after input
				// has been submitted
				CliEmitter.once(scopedPromptEvent, cb);

				setImmediate(() => {
					enterInsert();
					setActionPrompt(prompt.prompt);
				});
				return;
			}

			return handler(rest)(_, keyinput);
		};

	useKeymap({[internalKeymapEvent]: keyinput});
	useEvent(internalKeymapEvent, handler(prompts));

	return {actionPrompt, setActionPrompt, scopedPromptEvent};
}
