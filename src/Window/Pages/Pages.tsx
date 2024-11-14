import React from 'react';
import {Window, WindowProps} from '../Window.js';

type PageSpecificProps = {
	pageView: WindowProps['viewState'];
};

export type Props = Omit<
	WindowProps,
	| 'type'
	| 'viewState'
	| 'wordList'
	| 'scrollBar'
	| 'scrollBarAlign'
	| 'scrollColor'
> &
	PageSpecificProps;

export function Pages(props: Props): React.ReactNode {
	const windowProps = {
		...props,
		type: 'PAGES',
		scrollBar: false,
		viewState: props.pageView,
	} satisfies WindowProps;

	return <Window {...windowProps}>{props.children}</Window>;
}

// import {UsePages} from './usePages.js';
//
// export type Props = Omit<
// 	WindowProps,
// 	'type' | 'viewState' | 'items' | 'wordList'
// > & {
// 	pagesState: UsePages.Return['pagesState'];
// } & React.PropsWithChildren;
//
// export function Pages(props: Props): any {
// 	const windowProps: WindowProps = {
// 		type: 'PAGES',
// 		generators: props.generators,
// 		viewState: props.pagesState,
// 		scrollBar: props.scrollBar ?? false,
// 		scrollColor: props.scrollColor ?? 'white',
// 		scrollBarAlign: props.scrollBarAlign ?? 'end',
// 		direction: props.direction ?? 'column',
// 		wordList: undefined,
// 	};
//
// 	return <Window {...windowProps}>{props.children}</Window>;
// }
