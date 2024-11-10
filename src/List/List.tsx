import React from 'react';
import {KeyboardTypes} from '../Stdin/Keyboard.js';
import {UseEventTypes} from '../Stdin/KeyboardInputHooks/useEvent.js';
// import {UseListTypes} from './useList.js';

export namespace T {
	export interface UnitGen<T extends KeyboardTypes.KeyMap = any> {
		(isFocus: boolean, onUnit: UseEventTypes.UseEvent<T>): React.ReactNode;
	}

	// export type Props<T extends KeyboardTypes.KeyMap = any> = {
	// 	//
	// };
}
