import React from 'react';
import {Window, WindowProps} from '../Window.js';
import {PageView} from './usePages.js';

type PageSpecificProps = {
	pageView: PageView;
};

export type Props = Omit<
	WindowProps,
	| 'type'
	| 'viewState'
	| 'wordList'
	| 'scrollBar'
	| 'scrollBarAlign'
	| 'scrollColor'
	| 'generators'
> &
	PageSpecificProps;

export function Pages(props: Props): React.ReactNode {
	const windowProps = {
		...props,
		type: 'PAGES',
		scrollbar: {hide: true},
		viewState: props.pageView,
	} satisfies WindowProps;

	if (props.pageView._numPages !== React.Children.count(props.children)) {
		console.warn(
			'usePages/Pages warning: Mismatch between number of pages in usePages hook and children in Pages component.',
		);
	}

	return <Window {...windowProps}>{props.children}</Window>;
}
