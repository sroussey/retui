import React from 'react';
import Box from '../components/Box.js';
import {BoxProps, Text} from '../index.js';
import TabbedBorders, {BorderConfiguration} from './TabbedBorders.js';
import {usePageFocus} from '../focus/FocusContext.js';

type TitleStyle =
	| 'strike-through'
	| 'tab-deep'
	| 'tab-shallow'
	| 'tab-deep-no-border'
	| 'tab-shallow-no-border';

type Justify = 'start' | 'center' | 'end';
type Align = 'start' | 'end';

export type Props = {
	title: string;
	color?: BoxProps['borderColor'];
	// tabBorderColor?: BoxProps['borderColor'];
	tabBorderStyle?: BoxProps['borderStyle'];
	style?: TitleStyle;
	justify?: Justify;
	align?: Align;
};

const FLEX_VALUES_MAP: {[P in Justify]: string} = {
	start: 'flex-start',
	center: 'center',
	end: 'flex-end',
} as const;

/*
 * @deprecated
 * */
export function Title({
	title,
	style = 'strike-through',
	color = undefined,
	tabBorderStyle = 'single',
	// tabBorderColor = undefined,
	justify = 'center',
	align = 'start',
}: Props): React.ReactNode {
	// Adjust Inline Axis
	let marginLeft: number | undefined;
	if (justify === 'start') marginLeft = 1;
	if (justify === 'end') marginLeft = -1;

	// Adjust Block Axis
	let marginTop = align === 'start' ? -1 : 1;

	// Adjust for tabbed title
	if (style !== 'strike-through') {
		const additionalTabMargin = marginTop;
		marginTop += additionalTabMargin;

		if (style.includes('deep')) {
			marginTop += additionalTabMargin;
		}
	}

	// Create border configuration objects
	const isShallow = style.includes('shallow');
	const isDeep = style.includes('deep');
	const hasBorder = !style.includes('no-border');
	// prettier-ignore
	let borderConfiguration: BorderConfiguration | undefined = undefined;

	if (isShallow && tabBorderStyle && hasBorder) {
		const config = TabbedBorders.shallow(tabBorderStyle as any);
		borderConfiguration = align === 'start' ? config.top : config.bottom;
	}
	if (isDeep && tabBorderStyle && hasBorder) {
		const config = TabbedBorders.deep(tabBorderStyle as any);
		borderConfiguration = align === 'start' ? config.top : config.bottom;
	}

	return (
		<Box
			wipeBackground={false}
			position="absolute"
			height="100"
			width="100"
			flexShrink={0}
			marginLeft={marginLeft}
			marginTop={marginTop}
			justifyContent={FLEX_VALUES_MAP[justify] as any}
			alignItems={FLEX_VALUES_MAP[align] as any}
			borderColor="inherit"
		>
			<TitleImplementation
				title={title}
				color={color}
				// borderColor={tabBorderColor}
				borderConfiguration={borderConfiguration}
			/>
		</Box>
	);
}

type TitleImplementationProps = {
	title: string;
	color: BoxProps['borderColor'];
	// borderColor: BoxProps['borderColor'] | undefined;
	borderConfiguration?: BorderConfiguration;
};

function TitleImplementation(props: TitleImplementationProps): React.ReactNode {
	const isPageFocus = usePageFocus();

	if (!isPageFocus) return null;

	if (props.borderConfiguration === undefined) {
		return <Text color={props.color}>{props.title}</Text>;
	}

	return (
		<Box
			borderStyle={props.borderConfiguration}
			borderColor="inherit"
			backgroundColor="inherit"
			flexShrink={0}
			zIndex={1}
		>
			<Text color={props.color}>{props.title}</Text>
		</Box>
	);
}
