import React from 'react';
import {NodesView} from './useNodeMap.js';
import {NodeContext, useIsFocus} from '../FocusContext/FocusContext.js';
import Box from '../components/Box.js';
import {BoxProps} from '../index.js';

export type Props<T extends string = string> = {
	name: T;
	nodesView: NodesView<T>;
} & React.PropsWithChildren;

export function Node<T extends string = string>(
	props: Props<T>,
): React.ReactNode {
	const parentIsFocused = useIsFocus();
	const nodeIsFocused = props.name === props.nodesView._node;
	const isDeepFocus = parentIsFocused && nodeIsFocused;
	const isShallowFocus = !parentIsFocused && nodeIsFocused;

	return (
		<NodeContext.Provider
			value={{
				name: props.name,
				isFocus: isDeepFocus,
				isShallowFocus: isShallowFocus,
				control: props.nodesView._control,
			}}
		>
			{props.children}
		</NodeContext.Provider>
	);
}

// To allow for cleaner JSX, optionally combine Node with Box so you don't end up
// with an extra layer of nesting.
export type NodeBoxProps<T extends string = string> = BoxProps & Props<T>;
Node.Box = function <T extends string = string>(
	props: NodeBoxProps<T>,
): React.ReactNode {
	const {children, name, nodesView, ...boxProps} = props;

	return (
		<Box {...boxProps}>
			<Node name={name} nodesView={nodesView}>
				{children}
			</Node>
		</Box>
	);
};
