import React, {useEffect, useRef} from 'react';
import {Box} from '../BoxBgColor/Box.js';
import {WindowProps} from './Window.js';
import {STDIN} from '../Stdin/Stdin.js';
import {Listener} from './types.js';
import {ListItemContext, PageContext} from '../FocusContext/FocusContext.js';

type Props = {
	// What kind of context is passed to the Unit?  (PageContext or ItemContext)
	// What kind of default styles are added to the wrapper?
	type: WindowProps['type'];

	// The React node that will be wrapped in the Unit component
	node: React.ReactElement;

	// Is the Window focused && is the Unit focused within the Window?
	isDeepFocus: boolean;

	// Is the Unit focused within the Window?  (Shallow focus disregards the focus of the Window)
	// Imagine 3 Lists wrapped in a single List.  You would want to have a different
	// style for the list item whose focus extends all the way to the root, vs
	// the other 2 which are only focused to their immediate List parent.
	isShallowFocus: boolean;

	// Based on the ViewState, is the Unit visible within the viewing window?
	isHidden: boolean;

	// If the Unit is not visible, should the component be unmounted (lose its state)?
	// Most of the time you would want this on
	maintainState: boolean;

	// Event listeners added if Units were rendered using the ItemGenerator method
	listeners: Listener[];

	// Context data that will added to both ItemContext and PageContext
	index: number;
	items: any[];
	setItems: (items: unknown[]) => void;
};

export function Unit({
	type,
	listeners,
	items,
	setItems,
	index,
	isShallowFocus,
	isDeepFocus,
	isHidden,
	maintainState,
	node,
}: Props) {
	useMultipleEventsWithoutContextChecks(listeners);

	// Make sure that pages aren't accidently shrunk.  Could proably get rid of the
	// wrapper around not hidden nodes and disregard this, but it works right now
	const dimension = type === 'PAGES' ? '100' : undefined;

	const getUnit = () => {
		return (
			<>
				{isHidden && maintainState ? (
					<Box height={0} width={0} overflow="hidden" key={node.key}>
						{node}
					</Box>
				) : !isHidden ? (
					<Box height={dimension} width={dimension} key={node.key}>
						{node}
					</Box>
				) : null}
			</>
		);
	};

	if (type === 'PAGES') {
		return (
			<PageContext.Provider
				value={{isFocus: isDeepFocus, isShallowFocus, index}}
				key={node.key}
			>
				{getUnit()}
			</PageContext.Provider>
		);
	}

	if (type === 'ITEMS') {
		return (
			<ListItemContext.Provider
				value={{
					isFocus: isDeepFocus,
					isShallowFocus,
					index,
					items,
					setItems,
				}}
				key={node.key}
			>
				{getUnit()}
			</ListItemContext.Provider>
		);
	}

	throw new Error('Unhandled Window Unit type');
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
			STDIN.Keyboard.addEventListener(listener.event, listener.handler);
		});

		return () => {
			oldListeners.current.forEach(listener => {
				STDIN.Keyboard.removeEventListener(listener.event, listener.handler);
			});
		};
	});
}
