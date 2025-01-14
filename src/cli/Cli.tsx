import React from 'react';
import {useCli} from './useCli.js';
import {AbstractCli, CliProps} from './AbstractCli.js';

export type CliMessage = Parameters<ReturnType<typeof useCli>['setValue']>;

export function Cli(props: CliProps): React.ReactNode {
	return <AbstractCli {...props} autoEnter={false} />;
}
