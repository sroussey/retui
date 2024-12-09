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

/**
 * There are two scenarios where unitSize needs to be explicitly set.
 *
 * 1. If the cross-sectional dimension given to each list item is not 1 and you
 * have set your windowSize to 'fit'.  Setting windowSize to 'fit' adjusts the
 * windowSize dynamically based on available space which means it needs the
 * cross-sectional dimension given to each list item to calculate this how many
 * units can be displayed.  For example, you have set your direction prop to
 * 'column' and your windowSize is set to 'fit'.  The windowSize will be adjusted
 * dynamically based on the available amount of rows within the List component.
 * If all of your list items have a height of 1, then you're all set.  However,
 * if you list items have a height of 3, unitSize needs to be set to 3 to avoid
 * overflow.
 *
 * 2. The cross-sectional dimension of your list items are dynamic.  For
 * example, a List with a windowSize of 3 and you want your list items that are
 * viewable within the window to stretch to fill available space.
 *
 * @default: 1
 * */

export type IntrinsicWindowAttributes = {
	key?: Key;
	viewState?: ViewState;
	style?: IntrinsicWindowBaseProps;
} & React.PropsWithChildren;

export const WindowAttributes = {viewState: 'viewState'} as const;

export type IntrinsicWindowBaseProps = Pick<
	MutableBaseProps,
	'flexDirection' | 'height' | 'width' | 'minHeight' | 'minWidth'
> & {
	scrollbar?: StylesConfig['Scrollbar'];
	unitSize?: number | 'stretch';
};

export interface ItemGenerator<T extends KeyMap = any> {
	(isFocus: boolean, onUnit: UseEventTypes.UseEvent<T>): React.ReactNode;
}

export type WindowProps = React.PropsWithChildren &
	IntrinsicWindowBaseProps & {
		type: 'PAGES' | 'ITEMS';
		viewState: ViewState;
		generators?: ItemGenerator[];
		wordList?: string[];
		flexDirection?: Extract<
			StylesConfig['Box']['flexDirection'],
			'column' | 'row'
		>;
	};

export function Window({...props}: WindowProps): React.ReactNode {
	if (React.Children.count(props.children) && props.generators !== undefined) {
		throw new Error('Window cannot contain both children and generators prop');
		// On the other hand, if there are no children and no generators we can't
		// throw an error because empty lists need to be accomodated
	}

	props.scrollbar = props.scrollbar ?? {hide: true};
	props.scrollbar.hide = props.scrollbar.hide ?? false;
	props.scrollbar.style = props.scrollbar.style ?? 'single';
	props.scrollbar.align = props.scrollbar.align ?? 'end';
	props.scrollbar.color = props.scrollbar.color ?? 'white';
	props.scrollbar.dimColor = props.scrollbar.dimColor ?? false;
	props.scrollbar.position = props.scrollbar.position ?? 'within';

	props.flexDirection = props.flexDirection ?? 'column';
	props.height = props.height ?? '100';
	props.width = props.width ?? '100';
	props.unitSize = props.unitSize ?? 1;

	const THIS_WINDOW_FOCUS = useIsFocus();
	const THIS_WINDOW_LEVEL = useModalLevel();

	const generatedItems = props.generators
		? props.generators.map(handleMap)
		: React.Children.map(props.children, handleMap);

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
				stretch={props.unitSize === 'stretch'}
			/>
		);
	}

	const style: IntrinsicWindowBaseProps = {
		flexDirection: props.flexDirection,
		height: props.height,
		minHeight: props.minHeight,
		width: props.width,
		minWidth: props.minWidth,
		scrollbar: props.scrollbar,
		unitSize: props.unitSize,
	};

	return (
		<WindowContext.Provider value={{isFocus: THIS_WINDOW_FOCUS}}>
			<ink-window style={style} viewState={props.viewState}>
				{generatedItems}
			</ink-window>
		</WindowContext.Provider>
	);
}
