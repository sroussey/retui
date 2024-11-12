import {createContext, useContext} from 'react';

export type ItemContext<T extends any[] = any> = {
	items: T;
	isFocus: boolean;
	index: number;
};

export const ItemContext = createContext<ItemContext | null>(null);

export function useItem<T extends any[] = any>(): ItemContext<T> & {
	item: T[number];
} {
	const context = useContext(ItemContext);

	if (context === null) {
		throw new Error(
			'Attempting to use useItem hook outside the context of a List component',
		);
	}

	const items = context.items;
	const index = context.index;
	const isFocus = context.isFocus;
	const item = items[index];

	return {items, index, isFocus, item};
}

/*
 * When creating event listeners, we can safely assume that if there is no itemContext,
 * then the Node exists outside of an Item component and there is no need to block the
 * execution of its callback based on its focus status
 * */
export function useItemFocus(): boolean {
	const itemContext = useContext(ItemContext);
	if (itemContext === null) return true;
	return itemContext.isFocus;
}

export type PageContext = {
	isFocus: boolean;
	index: number;
};

export const PageContext = createContext<PageContext | null>(null);

export function usePage(): PageContext {
	const context = useContext(PageContext);

	if (context === null) {
		throw new Error(
			'Attemping to use usePage hook outside the context of a Pages component',
		);
	}

	return context;
}

export function usePageFocus(): boolean {
	const pageContext = useContext(PageContext);
	if (pageContext === null) return true;
	return pageContext.isFocus;
}

export function useIsFocus(): boolean {
	const itemFocus = useItemFocus();
	const pageFocus = usePageFocus();
	return itemFocus && pageFocus;
}
