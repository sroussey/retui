// import React from 'react';
// import {KeyboardTypes} from '../Stdin/Keyboard.js';
// import {UseEventTypes} from '../Stdin/KeyboardInputHooks/useEvent.js';
// import {useResponsiveDimensions} from '../useResponsiveDimensions/useResponsiveDimensions.js';
// import {UseListTypes} from './useList.js';
// import {BoxProps} from '../index.js';
// import {isRenderable} from './isRenderable.js';
// // import {UseListTypes} from './useList.js';
//
// export namespace T {
// 	export interface UnitGen {
// 		(isFocus: boolean, onUnit: UseEventTypes.UseEvent): React.ReactNode;
// 	}
//
// 	export type Props = {
// 		viewState: UseListTypes.ViewState;
// 		items: (UnitGen | React.ReactNode)[];
// 		scrollBar?: boolean;
// 		scrollColor?: BoxProps['backgroundColor'];
// 		scrollBarAlign: 'start' | 'end';
// 		wordList?: string[];
// 		direction?: 'column' | 'row';
// 		maintainState?: boolean;
// 	};
// 	// export type Props<T extends KeyboardTypes.KeyMap = any> = {
// 	// 	//
// 	// };
// }
//
// export function List({
// 	items,
// 	viewState,
// 	wordList,
// 	scrollBar = true,
// 	scrollColor = 'white',
// 	scrollBarAlign = 'post',
// 	direction = 'vertical',
// 	maintainState = true,
// }: T.Props): React.ReactNode {
// 	const {height, width, ref} = useResponsiveDimensions();
//
// 	const generatedItems = items.map(
// 		(item: T.UnitGen | React.ReactNode, idx: number) => {
// 			const listeners = [];
//
// 			const isFocus = idx === viewState._idx;
// 			const onUnit = (evt: string, handler: any) => {
// 				// if (!isFocus || !isPageFocus) return;
// 				if (!isFocus) return;
// 				listeners.push({evt, handler});
// 			};
//
// 			const node = isRenderable(item)
// 				? item
// 				: (item as T.UnitGen)(isFocus, onUnit as any);
//
// 			const key = (node as React.ReactElement).key;
// 			const isHidden = idx < viewState._start || idx >= viewState._end;
// 		},
//
// 		//
// 	);
//
// 	return null;
// }
