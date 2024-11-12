import React, {PropsWithChildren, useEffect, useRef, useState} from 'react';
import {Box} from '../BoxBgColor/Box.js';
import {WindowProps} from './Window.js';
import {ItemContext, PageContext} from './UnitContext.js';
import {STDIN} from '../Stdin/Stdin.js';
import {Listener} from './types.js';

type Props = {
	type: WindowProps['type'];
	isFocus: boolean;
	isHidden: boolean;
	maintainState: boolean;
	index: number;
	items: any[];
	listeners: Listener[];
	node: React.ReactElement;
};

export function Unit({
	type,
	listeners,
	items,
	index,
	isFocus,
	isHidden,
	maintainState,
	node,
}: Props) {
	useMultipleEventsWithoutContextChecks(listeners);

	const dimension = type === 'PAGES' ? '100' : undefined;

	const getUnit = () => {
		return (
			<>
				{isHidden && maintainState ? (
					<Box height={0} width={0} overflow="hidden">
						{node}
					</Box>
				) : !isHidden ? (
					<Box height={dimension} width={dimension}>
						{node}
					</Box>
				) : null}
			</>
		);
	};

	if (type === 'PAGES') {
		return (
			<PageContext.Provider value={{isFocus, index}}>
				{getUnit()}
			</PageContext.Provider>
		);
	}

	if (type === 'ITEMS') {
		return (
			<ItemContext.Provider
				value={{
					isFocus,
					index,
					items,
				}}
			>
				{getUnit()}
			</ItemContext.Provider>
		);
	}

	throw new Error('Unhandled Window Unit type');
}

/*
 * Like useEvent, but does not perform context checks before calling handlers.
 * The Window component returns early before adding listeners if not in focus
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
