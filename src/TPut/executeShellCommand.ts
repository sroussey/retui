import PreserveScreen from './PreserveScreen.js';
import {STDIN, ALT_STDIN} from '../Stdin/Stdin.js';
import {spawn} from 'child_process';
import fs from 'fs';
import {logger} from '../index.js';

export const executeShellCommand =
	(cmd: string, reattachMessage?: string) => async (render: () => void) => {
		reattachMessage = reattachMessage
			? `${reattachMessage}\n`
			: 'Press any key to continue\n';

		PreserveScreen.restoreScreenState();

		STDIN.pauseDataStream();

		return new Promise((res, rej) => {
			const split = cmd.split(' ');
			const name = split[0];
			const args = split.slice(1);

			const command = spawn(name!, args, {
				stdio: ['inherit', 'inherit', 'inherit'],
			});

			command.on('error', err => {
				logger.prefix('SPAWN', 'Error during: ', cmd, err.name, err.message);
				rej(err);
			});

			command.on('close', code => {
				logger.prefix('SPAWN', 'Successfully executed: ', cmd, code);
				res(code);
			});
		})
			.catch(err => {
				const term = fs.createWriteStream('/dev/tty');
				term.write(`Error: ${err.message}\n`);
				term.close();
			})
			.finally(() => {
				return new Promise(res => {
					const term = fs.createWriteStream('/dev/tty');
					term.write(reattachMessage);
					term.close();

					ALT_STDIN.listen();
					ALT_STDIN.Keyboard.respondToKeypress((char: string) => {
						logger.prefix('ALT_STDIN', 'respond to keypress');

						res(char);
					});
				});
			})
			.then(() => {
				PreserveScreen.saveScreenState();
				ALT_STDIN.pause();
				STDIN.resumeDataStream();
				render();
			});
	};
