import React, {createContext, useContext} from 'react';
import {FocusMap} from './useNavigator.js';
import {Box, BoxProps, useIsFocus} from '../index.js';

export type Props<T extends string = string> = {
	navigationState: {
		node: T;
		focusMap: FocusMap<T>;
	};
} & React.PropsWithChildren;

export type NavigatorContext<T extends string = string> = {
	node: T;
	focusMap: FocusMap<T>;
	parentFocus: boolean;
};

const NavigatorContext = createContext<NavigatorContext | null>(null);

export function Navigator<T extends string = string>(
	props: Props<T>,
): React.ReactNode {
	const parentFocus = useIsFocus();

	return (
		<NavigatorContext.Provider
			value={{
				node: props.navigationState.node,
				focusMap: props.navigationState.focusMap,
				parentFocus,
			}}
		>
			{props.children}
		</NavigatorContext.Provider>
	);
}

function useNavigatorContext(): NavigatorContext {
	const ctx = useContext(NavigatorContext);

	if (!ctx) {
		throw new Error(
			'Attempting to use Navigator context outside of a Navigator component',
		);
	}

	return ctx;
}

export type NavigatorNodeContext<T extends string = string> = {
	name: T;
	isFocus: boolean;
	isShallowFocus: boolean;
};

type NodeProps<T extends string = string> = BoxProps & {
	name: T;
} & React.PropsWithChildren;

const NavigatorNodeContext = createContext<NavigatorNodeContext | null>(null);

Navigator.Node = function <T extends string = string>(
	props: NodeProps<T>,
): React.ReactNode {
	const ctx = useNavigatorContext();

	const isShallowFocus = ctx.node === props.name;
	const isDeepFocus = ctx.parentFocus && isShallowFocus;

	const boxProps = {
		...props,
		name: undefined,
	} as BoxProps;

	// return (
	// 	<NavigatorNodeContext.Provider
	// 		value={{
	// 			name: ctx.node,
	// 			isFocus: isDeepFocus,
	// 			isShallowFocus: isShallowFocus,
	// 		}}
	// 	>
	// 		<Box {...boxProps}>{props.children}</Box>
	// 	</NavigatorNodeContext.Provider>
	// );

	return (
		<NavigatorNodeContext.Provider
			value={{
				name: ctx.node,
				isFocus: isDeepFocus,
				isShallowFocus: isShallowFocus,
			}}
		>
			{props.children}
		</NavigatorNodeContext.Provider>
	);
};

export function useNavigatorNode(): NavigatorNodeContext {
	const ctx = useContext(NavigatorNodeContext);
	if (!ctx) {
		throw new Error(
			'Attempting to use Navigator Node context outside of a Navigator.Node component',
		);
	}
	return ctx;
}
