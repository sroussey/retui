import {spawnSync} from 'child_process';

const State = {
	ShouldPreserveScreen: false,
};

export function saveScreenState(): void {
	spawnSync('tput', ['smcup'], {stdio: 'inherit'});
}

export function restoreScreenState(): void {
	spawnSync('tput', ['rmcup'], {stdio: 'inherit'});
}

export function preserveScreen(): void {
	State.ShouldPreserveScreen = true;

	const onExit = (exitStatus: any) => {
		if (exitStatus !== 0) return;
		restoreScreenState();
	};

	saveScreenState();
	process.on('exit', onExit);
}

export default {
	State,
	saveScreenState,
	restoreScreenState,
	preserveScreen,
};
