import React, {Key} from 'react';
import {UseEventTypes} from '../stdin/hooks/useEvent.js';
import {KeyMap} from '../index.js';
import {isRenderable} from './isRenderable.js';
import {Listener, ViewState} from './types.js';
import {useIsFocus, WindowContext} from '../focus/FocusContext.js';
import {Unit} from './Unit.js';
import {useModalLevel} from '../modal/ModalContext.js';
import ModalStack from '../modal/ModalStack.js';
import {MutableBaseProps, StylesConfig} from '../utility/types.js';

export type IntrinsicWindowAttributes = {
	key?: Key;
	viewState?: ViewState;
	style?: IntrinsicWindowBaseProps;
} & React.PropsWithChildren;

export const WindowAttributes = {viewState: 'viewState'} as const;

export type IntrinsicWindowBaseProps = Pick<
	MutableBaseProps,
	| 'flexDirection'
	| 'justifyContent'
	| 'alignItems'
	| 'gap'
	| 'height'
	| 'width'
	| 'position'
	| 'flexGrow'
	| 'flexWrap'
	| 'flexShrink'
	| 'flexBasis'
> & {
	scrollbar?: StylesConfig['Scrollbar'];
	unitSize?: number | 'stretch';
};

export interface ItemGenerator<T extends KeyMap = any> {
	(isFocus: boolean, onUnit: UseEventTypes.UseEvent<T>): React.ReactNode;
}

export type WindowProps<BatchItem = any> = React.PropsWithChildren &
	IntrinsicWindowBaseProps & {
		type: 'PAGES' | 'ITEMS';
		viewState: ViewState;
		generators?: ItemGenerator[];
		wordList?: string[];
		flexDirection?: Extract<
			StylesConfig['Box']['flexDirection'],
			'column' | 'row'
		>;
		fitX?: boolean;
		fitY?: boolean;
		/** @deprecated Currently unused. */
		retainState?: boolean;
		batchMap?: {
			batchSize?: number;
			items: readonly BatchItem[];
			map: (
				item: BatchItem,
				/** The index of the item from the provided `items` array. */
				index: number,
			) => React.ReactNode;
		};
	};

export function Window<T extends any>({
	...props
}: WindowProps<T>): React.ReactNode {
	if (React.Children.count(props.children) && props.generators !== undefined) {
		throw new Error('Window cannot contain both children and generators prop');
		// If there are no children and no generators we can't
		// throw an error because empty lists need to be accomodated
	}

	props.fitX = props.fitX ?? false;
	props.fitY = props.fitY ?? false;
	props.height = props.fitY ? undefined : (props.height ?? '100');
	props.width = props.fitX ? undefined : (props.width ?? '100');
	props.scrollbar = props.scrollbar ?? {hide: false};
	props.scrollbar.hide = props.scrollbar.hide ?? false;
	props.scrollbar.style = props.scrollbar.style ?? 'single';
	props.scrollbar.align = props.scrollbar.align ?? 'end';
	props.scrollbar.color = props.scrollbar.color ?? 'white';
	props.scrollbar.dimColor = props.scrollbar.dimColor ?? false;
	props.flexDirection = props.flexDirection ?? 'column';
	props.justifyContent = props.justifyContent ?? 'flex-start';
	props.alignItems = props.alignItems ?? 'flex-start';

	// Make sure component is rendered properly in the layout
	props.position = 'relative';
	props.flexWrap = 'nowrap';
	props.flexGrow = props.flexGrow ?? 0;
	props.flexShrink = props.flexShrink ?? 1;

	const THIS_WINDOW_FOCUS = useIsFocus();
	const THIS_WINDOW_LEVEL = useModalLevel();

	function getItem(
		node: React.ReactElement,
		idx: number,
		listeners: Listener[] = [],
	): React.ReactElement {
		const key = (node as React.ReactElement).key;
		const isHidden =
			idx < props.viewState._start || idx >= props.viewState._end;

		const isDeepFocus = THIS_WINDOW_FOCUS && idx === props.viewState._idx;
		const isShallowFocus = !isDeepFocus && idx === props.viewState._idx;

		return (
			<Unit
				key={key}
				type={props.type}
				node={node as React.ReactElement}
				listeners={listeners}
				isHidden={isHidden}
				// context
				isShallowFocus={isShallowFocus}
				isDeepFocus={isDeepFocus}
				index={idx}
				items={props.viewState._items}
				setItems={props.viewState._setItems}
				control={props.viewState._control}
				stretch={props.viewState._unitSize === 'stretch'}
			/>
		);
	}

	function handleMap(
		item: ItemGenerator | React.ReactNode,
		idx: number,
	): React.ReactElement {
		const listeners: Listener[] = [];

		const isFocus = idx === props.viewState._idx;
		const onUnit = (event: string, handler: any) => {
			if (!isFocus || !THIS_WINDOW_FOCUS) return;
			if (!ModalStack.isActiveModalLevel(THIS_WINDOW_LEVEL)) return;
			listeners.push({event, handler});
		};

		const node = isRenderable(item)
			? item
			: (item as ItemGenerator)(isFocus, onUnit as any);

		return getItem(node as React.ReactElement, idx, listeners);
	}

	function getSlicedItems() {
		if (!props.batchMap) throw new Error('internal error');
		props.batchMap.batchSize = props.batchMap.batchSize ?? 250;

		const {batchSize, items, map} = props.batchMap;

		const start = 0;
		const end = batchSize;
		const sliceStart = props.viewState._start;
		const sliceEnd = Math.max(
			props.viewState._start + batchSize,
			props.viewState._end,
		);
		const slicedItems = items.slice(sliceStart, sliceEnd);

		const toRender: any[] = [];
		for (let i = start; i < end; ++i) {
			if (slicedItems[i] === undefined) continue;
			toRender.push(map(slicedItems[i]!, i + sliceStart));
		}

		const rendered: React.ReactNode[] = [];
		for (let i = 0; i < toRender.length; ++i) {
			rendered.push(getItem(toRender[i], i + sliceStart));
		}

		return rendered;
	}

	const generatedItems = props.generators
		? props.generators.map(handleMap)
		: React.Children.map(props.children, handleMap);

	return (
		<WindowContext.Provider value={{isFocus: THIS_WINDOW_FOCUS}}>
			<ink-window style={{...props}} viewState={props.viewState}>
				{props.batchMap ? getSlicedItems() : generatedItems}
			</ink-window>
		</WindowContext.Provider>
	);
}

// const foo: number[] = [1, 2, 3, 4, 5];
//
// function Foo(): React.ReactNode {
// 	return (
// 		<Window
// 			type="ITEMS"
// 			viewState={{} as ViewState}
// 			batchMap={{
// 				items: foo,
// 				map: (item, idx) => {
// 					return null;
// 				},
// 			}}
// 		></Window>
// 	);
// }
