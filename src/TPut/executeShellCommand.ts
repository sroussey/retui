import PreserveScreen from './PreserveScreen.js';
import {STDIN, ALT_STDIN} from '../Stdin/Stdin.js';
import {spawn} from 'child_process';
import fs from 'fs';
import {logger} from '../index.js';

export type ExitStatus = number | null;

export const executeShellCommand =
	(cmd: string, reattachMessage?: string) =>
	async (render: () => void): Promise<ExitStatus> => {
		reattachMessage = reattachMessage
			? `${reattachMessage}\n`
			: 'Press any key to continue\n';

		STDIN.pauseDataStream();
		PreserveScreen.restoreScreenState();

		function write(msg: string): void {
			const term = fs.createWriteStream('/dev/tty');
			term.write(msg);
			term.close();
		}

		function toSanitizedArray(cmd: string) {
			return cmd
				.trimStart()
				.trimEnd()
				.split(' ')
				.filter(s => s !== '');
		}

		return new Promise<ExitStatus>((res, rej) => {
			const split = toSanitizedArray(cmd);
			const name = split[0];
			const args = split.slice(1);

			const spawnedCmd = spawn(name!, args, {
				stdio: ['inherit', 'inherit', 'inherit'],
			});

			spawnedCmd.on('error', err => {
				logger.prefix('SPAWN', 'Error during: ', cmd, err.name, err.message);
				rej(err);
			});

			spawnedCmd.on('close', code => {
				logger.prefix('SPAWN', 'Successfully executed: ', cmd, code);
				res(code);
			});
		})
			.catch((err: Error) => {
				write(`Error: ${err.message}\n`);
				return err;
			})
			.then(exitStatus => {
				write(reattachMessage!);
				return exitStatus;
			})
			.then(exitStatus => {
				return new Promise(res => {
					ALT_STDIN.listen();
					ALT_STDIN.Keyboard.respondToKeypress(() => {
						logger.prefix('ALT_STDIN', 'respond to keypress');
						res(exitStatus);
					});
				});
			})
			.then(exitStatus => {
				return new Promise((res, rej) => {
					PreserveScreen.saveScreenState();
					ALT_STDIN.pause();
					STDIN.resumeDataStream();
					render();

					if (exitStatus instanceof Error) {
						rej(exitStatus);
					} else {
						res(exitStatus as number | null);
					}
				});
			});
	};
