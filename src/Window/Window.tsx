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
	scrollBarStyle?: 'single' | 'bold';
	wordList?: string[];
	direction?: 'column' | 'row';
	maintainState?: boolean;
	unitSize?: number;
};

export function Window({
	items,
	type,
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
	// const {height, width, ref} = useResponsiveDimensions({shouldUpdate});
	const scrollDimensions = useResponsiveDimensions({shouldUpdate});

	const getScrollBar = (shouldBuild: boolean) => {
		if (!shouldBuild) return null;
		return (
			<ScrollBar
				viewState={viewState}
				height={scrollDimensions.height ?? 0}
				width={scrollDimensions.width ?? 0}
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

	const dimensions = useResponsiveDimensions({
		shouldUpdate: viewState._fitWindow,
	});

	useEffect(() => {
		if (!viewState._fitWindow) return;

		const nextWinSize =
			direction === 'column'
				? Math.floor((dimensions.height ?? 0) / unitSize)
				: Math.floor((dimensions.width ?? 0) / unitSize);

		viewState._util.modifyWinSize(nextWinSize);
	}, [dimensions.width, dimensions.height]);

	// Original percents with %
	const verticalList = direction === 'column' && (
		<Box flexDirection="column" height="100%" width="100%" ref={dimensions.ref}>
			<Box
				flexDirection="row"
				justifyContent="space-between"
				width="100%"
				height="100"
			>
				{scrollBarStart}
				<Box display="flex" flexGrow={1} flexDirection="column">
					<Box
						flexDirection="column"
						justifyContent="space-between"
						ref={scrollDimensions.ref as any}
					>
						{generatedItems}
					</Box>
				</Box>
				{scrollBarEnd}
			</Box>
		</Box>
	);

	const horizontalList = direction === 'row' && (
		// <Box flexDirection="row" height="100%" width="100%" ref={dimensions.ref}>
		<Box flexDirection="row" width="100" ref={dimensions.ref}>
			<Box
				flexDirection="column"
				justifyContent="space-between"
				height="100%"
				width="100"
			>
				{scrollBarStart}
				<Box display="flex" flexDirection="row" width="100">
					<Box
						flexShrink={1}
						flexDirection="row"
						ref={scrollDimensions.ref as any}
					>
						{generatedItems}
					</Box>
				</Box>
				{scrollBarEnd}
			</Box>
		</Box>
	);

	return verticalList || horizontalList;
}
