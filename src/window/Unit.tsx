import React, {useEffect, useRef} from 'react';
import Box from '../components/Box.js';
import {WindowProps} from './Window.js';
import {DefaultStdin} from '../stdin/Stdin.js';
import {Listener, ViewState} from './types.js';
import {ListItemContext, PageContext} from '../focus/FocusContext.js';

type Props = {
	// What kind of context is passed to the Unit?  (PageContext or ItemContext)
	// What kind of default styles are added to the wrapper?
	type: WindowProps['type'];

	// The component that will be wrapped in the Unit component
	node: React.ReactElement;

	// Does the component have a fixed size, or should it stretch to fit the window container
	stretch: boolean;

	// Is the Window focused && is the Unit focused within the Window?
	isDeepFocus: boolean;

	// Is the Unit focused within the Window?  (Shallow focus disregards the focus of the Window)
	// Imagine 3 Lists wrapped in a single List.  You would want to have a different
	// style for the list item whose focus extends all the way to the root, vs
	// the other 2 which are only focused to their immediate List parent.
	isShallowFocus: boolean;

	// Based on the ViewState, is the Unit visible within the viewing window?
	isHidden: boolean;

	// Event listeners added if Units were rendered using the ItemGenerator method
	listeners: Listener[];

	// Context data that will added to both ItemContext and PageContext
	index: number;
	items: any[];
	control: ViewState['_control'];
	setItems: ViewState['_setItems'];
};

export function Unit({
	type,
	listeners,
	items,
	setItems,
	control,
	index,
	isShallowFocus,
	isDeepFocus,
	stretch,
	isHidden,
	node,
}: Props) {
	useMultipleEventsWithoutContextChecks(listeners);

	const display = isHidden ? 'none' : 'flex';
	const dimension = type === 'PAGES' || stretch ? '100' : undefined;
	const flexShrink = dimension ? 1 : 0;

	const unit = (
		<Box
			display={display}
			height={dimension}
			width={dimension}
			flexShrink={flexShrink}
			key={node.key}
		>
			{node}
		</Box>
	);

	if (type === 'PAGES') {
		return (
			<Page
				key={node.key}
				isFocus={isDeepFocus}
				isShallowFocus={isShallowFocus}
				index={index}
				control={control}
			>
				{unit}
			</Page>
		);
	}

	if (type === 'ITEMS') {
		return (
			<ListItem
				key={node.key}
				isFocus={isDeepFocus}
				isShallowFocus={isShallowFocus}
				index={index}
				items={items}
				setItems={setItems}
				control={control}
			>
				{unit}
			</ListItem>
		);
	}

	throw new Error('Unhandled Window Unit type');
}

type ListItemProps = {
	isFocus: Props['isDeepFocus'];
	isShallowFocus: Props['isShallowFocus'];
	index: Props['index'];
	items: Props['items'];
	setItems: Props['setItems'];
	control: Props['control'];
} & React.PropsWithChildren;

function ListItem(props: ListItemProps): React.ReactNode {
	const onFocusChangeGenerator = useFocusChangeGenerators(props.isFocus);

	return (
		<ListItemContext.Provider
			value={{
				isFocus: props.isFocus,
				isShallowFocus: props.isShallowFocus,
				index: props.index,
				items: props.items,
				setItems: props.setItems,
				control: props.control,
				onFocus: onFocusChangeGenerator('onFocus'),
				onBlur: onFocusChangeGenerator('onBlur'),
			}}
		>
			{props.children}
		</ListItemContext.Provider>
	);
}

type PageProps = Pick<
	ListItemProps,
	'isFocus' | 'isShallowFocus' | 'index' | 'control'
> &
	React.PropsWithChildren;

function Page(props: PageProps): React.ReactNode {
	const onFocusChangeGenerator = useFocusChangeGenerators(props.isFocus);

	return (
		<PageContext.Provider
			value={{
				isFocus: props.isFocus,
				isShallowFocus: props.isShallowFocus,
				index: props.index,
				control: props.control,
				onPageFocus: onFocusChangeGenerator('onFocus'),
				onPageBlur: onFocusChangeGenerator('onBlur'),
			}}
		>
			{props.children}
		</PageContext.Provider>
	);
}

function useFocusChangeGenerators(isFocus: boolean) {
	// Like a ref, but not not preserved across renders.  Calling the generated
	// functions from onFocusChangeGenerator changes these values which can
	// then be called in the effect callback.  Basically, a way of moving state
	// back up, so that the end user doesn't need to write the useEffect themselves
	const cache: {onFocus: null | (() => any); onLeaveFocus: null | (() => any)} =
		{onFocus: null, onLeaveFocus: null};

	const exits = useRef(0);

	const onFocusChangeGenerator = (type: 'onFocus' | 'onBlur') => {
		return (cb: () => any) => {
			if (type === 'onFocus') {
				cache.onFocus = cb;
			} else if (exits.current++) {
				cache.onLeaveFocus = cb;
			}
		};
	};

	useEffect(() => {
		if (isFocus) {
			cache.onFocus?.();
		} else {
			cache.onLeaveFocus?.();
		}
	}, [isFocus]);

	return onFocusChangeGenerator;
}

/*
 * Like useEvent, but does not perform context checks before calling handlers.
 * No context checks are needed here because the Window component won't add any
 * listeners if the focus state isn't appropriate
 * */
function useMultipleEventsWithoutContextChecks(nextListeners: Listener[]) {
	const oldListeners = useRef<Listener[]>([]);

	useEffect(() => {
		oldListeners.current = nextListeners;
		nextListeners.forEach(listener => {
			DefaultStdin.Keyboard.addEventListener(listener.event, listener.handler);
		});

		return () => {
			oldListeners.current.forEach(listener => {
				DefaultStdin.Keyboard.removeEventListener(
					listener.event,
					listener.handler,
				);
			});
		};
	});
}
