import React, {useEffect} from 'react';
import {UseEventTypes} from '../Stdin/KeyboardInputHooks/useEvent.js';
import {useResponsiveDimensions} from '../useResponsiveDimensions/useResponsiveDimensions.js';
import {BoxProps, KeyMap, logger} from '../index.js';
import {isRenderable} from './isRenderable.js';
import {Listener, ViewState} from './types.js';
import {useIsFocus, WindowContext} from '../FocusContext/FocusContext.js';
import {Unit} from './Unit.js';
import ScrollBar from './ScrollBar.js';
import Box from '../components/Box.js';

export interface ItemGenerator<T extends KeyMap = any> {
	(isFocus: boolean, onUnit: UseEventTypes.UseEvent<T>): React.ReactNode;
}

export type WindowProps = {
	type: 'PAGES' | 'ITEMS';
	viewState: ViewState;
	generators?: ItemGenerator[];
	scrollBar?: boolean;
	scrollColor?: BoxProps['backgroundColor'];
	scrollBarAlign?: 'start' | 'end';
	scrollBarStyle?: 'single' | 'bold';
	wordList?: string[];
	direction?: 'column' | 'row';
	maintainState?: boolean;

	/**
	 * There are two scenarios where this needs to be explicitly set.
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
	unitSize?: number | 'stretch';
} & React.PropsWithChildren;

export function Window({
	children,
	type,
	generators,
	viewState,
	wordList,
	scrollBar = true,
	scrollColor = 'white',
	scrollBarAlign = 'end',
	scrollBarStyle = 'single',
	direction = 'column',
	maintainState = true,
	unitSize = 1,
}: WindowProps): React.ReactNode {
	if (React.Children.count(children) && generators !== undefined) {
		throw new Error('Window cannot contain both children and generators prop');
		// On the other hand, if there are no children and no generators we can't
		// throw an error because empty lists need to be accomodated
	}

	const THIS_WINDOW_FOCUS = useIsFocus();

	const generatedItems = generators
		? generators.map(handleMap)
		: React.Children.map(children, handleMap);

	function handleMap(
		item: ItemGenerator | React.ReactNode,
		idx: number,
	): React.ReactElement {
		const listeners: Listener[] = [];

		const isFocus = idx === viewState._idx;
		const onUnit = (event: string, handler: any) => {
			if (!isFocus || !THIS_WINDOW_FOCUS) return;
			listeners.push({event, handler});
		};

		const node = isRenderable(item)
			? item
			: (item as ItemGenerator)(isFocus, onUnit as any);

		const key = (node as React.ReactElement).key;
		const isHidden = idx < viewState._start || idx >= viewState._end;

		const isDeepFocus = THIS_WINDOW_FOCUS && idx === viewState._idx;
		const isShallowFocus = !isDeepFocus && idx === viewState._idx;

		return (
			<Unit
				key={key}
				type={type}
				node={node as React.ReactElement}
				listeners={listeners}
				isHidden={isHidden}
				maintainState={maintainState ?? true}
				// context
				isShallowFocus={isShallowFocus}
				isDeepFocus={isDeepFocus}
				index={idx}
				items={viewState._items}
				setItems={viewState._setItems}
				stretch={unitSize === 'stretch'}
			/>
		);
	}

	const dimensions = useResponsiveDimensions({
		shouldUpdate: viewState._fitWindow || scrollBar,
	});

	useEffect(() => {
		if (!viewState._fitWindow) return;
		if (typeof unitSize !== 'number') return;

		const nextWinSize =
			direction === 'column'
				? Math.floor((dimensions.height ?? 0) / unitSize)
				: Math.floor((dimensions.width ?? 0) / unitSize);

		viewState._control.modifyWinSize(nextWinSize);
	}, [dimensions.width, dimensions.height]);

	const getScrollBar = (shouldBuild: boolean) => {
		if (!shouldBuild) return null;
		return (
			<ScrollBar
				viewState={viewState}
				height={dimensions.height ?? 0}
				width={dimensions.width ?? 0}
				color={scrollColor}
				direction={direction}
				style={scrollBarStyle}
			/>
		);
	};
	const scrollBarStart = getScrollBar(scrollBar && scrollBarAlign === 'start');
	const scrollBarEnd = getScrollBar(scrollBar && scrollBarAlign === 'end');

	// Wordlist placeholder
	wordList && viewState._winSize > 0;

	const verticalList = direction === 'column' && (
		<Box flexDirection="column" height="100" width="100" flexGrow={1}>
			<Box
				flexShrink={0}
				flexDirection="row"
				justifyContent="space-between"
				width="100"
				height="100"
				ref={dimensions.ref}
			>
				{scrollBarStart}
				<Box display="flex" flexDirection="column" height="100" flexShrink={0}>
					<Box flexDirection="column" width="100" height="100" flexShrink={0}>
						{generatedItems}
					</Box>
				</Box>
				{scrollBarEnd}
			</Box>
		</Box>
	);

	const horizontalList = direction === 'row' && (
		<Box flexDirection="row" height="100" width="100">
			<Box
				flexShrink={0}
				flexDirection="column"
				justifyContent="space-between"
				height="100"
				width="100"
				ref={dimensions.ref as any}
			>
				{scrollBarStart}
				<Box display="flex" flexDirection="row" width="100" flexShrink={0}>
					<Box flexDirection="row" width="100" height="100" flexShrink={0}>
						{generatedItems}
					</Box>
				</Box>
				{scrollBarEnd}
			</Box>
		</Box>
	);

	return (
		<WindowContext.Provider value={{isFocus: THIS_WINDOW_FOCUS}}>
			{verticalList || horizontalList}
		</WindowContext.Provider>
	);
}
