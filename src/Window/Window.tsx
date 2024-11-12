import React, {useEffect} from 'react';
import {UseEventTypes} from '../Stdin/KeyboardInputHooks/useEvent.js';
import {useResponsiveDimensions} from '../useResponsiveDimensions/useResponsiveDimensions.js';
import {BoxProps, KeyMap} from '../index.js';
import {isRenderable} from './isRenderable.js';
import {Listener, ViewState} from './types.js';
import {usePageFocus} from './UnitContext.js';
import {Unit} from './Unit.js';
import ScrollBar from './ScrollBar.js';
import Box from '../components/Box.js';

export interface ItemGenerator<T extends KeyMap = any> {
	(isFocus: boolean, onUnit: UseEventTypes.UseEvent<T>): React.ReactNode;
}

export type WindowProps = {
	type: 'PAGES' | 'ITEMS';
	viewState: ViewState;
	items: (ItemGenerator | React.ReactNode)[];
	scrollBar?: boolean;
	scrollColor?: BoxProps['backgroundColor'];
	scrollBarAlign?: 'start' | 'end';
	wordList?: string[];
	direction?: 'column' | 'row';
	maintainState?: boolean;
};

export function Window({
	items,
	type,
	viewState,
	wordList,
	scrollBar = true,
	scrollColor = 'white',
	scrollBarAlign = 'end',
	direction = 'column',
	maintainState = true,
}: WindowProps): React.ReactNode {
	const isPageFocus = usePageFocus();

	const generatedItems = items.map(
		(item: ItemGenerator | React.ReactNode, idx: number) => {
			const listeners: Listener[] = [];

			const isFocus = idx === viewState._idx;
			const onUnit = (event: string, handler: any) => {
				if (!isFocus || !isPageFocus) return;
				listeners.push({event, handler});
			};

			const node = isRenderable(item)
				? item
				: (item as ItemGenerator)(isFocus, onUnit as any);

			const key = (node as React.ReactElement).key;
			const isHidden = idx < viewState._start || idx >= viewState._end;

			return (
				<Unit
					key={key}
					type={type}
					listeners={listeners}
					isHidden={isHidden}
					maintainState={maintainState ?? true}
					// context
					isFocus={idx === viewState._idx}
					index={idx}
					items={viewState._items}
					node={node as React.ReactElement}
				/>
			);
		},
	);

	const shouldUpdate = scrollBar ? true : false;
	const {height, width, ref} = useResponsiveDimensions({shouldUpdate});

	const getScrollBar = (shouldBuild: boolean) => {
		if (!shouldBuild) return null;
		return (
			<ScrollBar
				viewState={viewState}
				height={height ?? 0}
				width={width ?? 0}
				color={scrollColor}
			/>
		);
	};
	const scrollBarStart = getScrollBar(scrollBar && scrollBarAlign === 'start');
	const scrollBarEnd = getScrollBar(scrollBar && scrollBarAlign === 'end');

	// Wordlist placeholder
	wordList && viewState._winSize > 0;

	const dimensions = useResponsiveDimensions({
		shouldUpdate: viewState._fitWindow,
	});

	useEffect(() => {
		if (!viewState._fitWindow) return;
		viewState._util.modifyWinSize(dimensions.height ?? 0);
	}, [dimensions.width, dimensions.height]);

	const verticalList = direction === 'column' && (
		<Box flexDirection="column" height="100%" width="100%" ref={dimensions.ref}>
			<Box flexDirection="row" justifyContent="space-between" width="100%">
				{scrollBarStart}
				<Box display="flex" flexGrow={1} flexDirection="column">
					<Box flexDirection="column" ref={ref as any}>
						{generatedItems}
					</Box>
				</Box>
				{scrollBarEnd}
			</Box>
		</Box>
	);

	const horizontalList = direction === 'row' && (
		<Box flexDirection="row" height="100%" width="100%" ref={dimensions.ref}>
			<Box flexDirection="column" justifyContent="space-between" height="100%">
				{scrollBarStart}
				<Box display="flex" flexDirection="row">
					<Box flexShrink={1} flexDirection="row" ref={ref as any}>
						{generatedItems}
					</Box>
					<Box flexGrow={1}></Box>
				</Box>
				{scrollBarEnd}
			</Box>
		</Box>
	);

	return verticalList || horizontalList;
}
