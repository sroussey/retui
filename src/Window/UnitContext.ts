import {createContext, useContext} from 'react';

export type ListItemContext<T extends any[] = any> = {
	items: T;
	setItems: (items: T) => void;
	// Focus extends up the focus tree to the root node
	isFocus: boolean;
	// Focus based only on whatever focus given by the List component containing this list item
	isShallowFocus: boolean;
	index: number;
};

export type PageContext = {
	// Focus extends up the focus tree to the root node
	isFocus: boolean;
	// Focus based only on whatever focus given by the Pages component containing this page
	isShallowFocus: boolean;
	index: number;
};

export type WindowContext = {
	isFocus: boolean;
};

export const ListItemContext = createContext<ListItemContext | null>(null);
export const PageContext = createContext<PageContext | null>(null);
export const WindowContext = createContext<WindowContext | null>(null);

// If no Context exists, this is the root node and therefore focus is true.
// Otherwise, focus is dependent on the Context value.
export function useWindowFocus(): boolean {
	const windowContext = useContext(WindowContext);
	if (windowContext === null) return true;
	return windowContext.isFocus;
}
export function usePageFocus(): boolean {
	const pageContext = useContext(PageContext);
	if (pageContext === null) return true;
	return pageContext.isFocus;
}
export function useItemFocus(): boolean {
	const listItemContext = useContext(ListItemContext);
	if (listItemContext === null) return true;
	return listItemContext.isFocus;
}
// Combine focus of all the above
export function useIsFocus(): boolean {
	const itemFocus = useItemFocus();
	const pageFocus = usePageFocus();
	const windowFocus = useWindowFocus();
	return itemFocus && pageFocus && windowFocus;
}

export function useListItem<T extends any[] = any>(): ListItemContext<T> & {
	item: T[number];
} {
	const context = useContext(ListItemContext);

	if (context === null) {
		throw new Error(
			'Attempting to use useItem hook outside the context of a List component',
		);
	}

	const items = context.items;
	const setItems = context.setItems;
	const index = context.index;
	const isFocus = context.isFocus;
	const isShallowFocus = context.isShallowFocus;
	const item = items[index];

	return {items, setItems, index, isFocus, isShallowFocus, item};
}

export function usePage(): PageContext {
	const context = useContext(PageContext);

	if (context === null) {
		throw new Error(
			'Attemping to use usePage hook outside the context of a Pages component',
		);
	}

	return context;
}
