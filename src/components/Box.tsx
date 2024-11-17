import React, {forwardRef, type PropsWithChildren} from 'react';
import {type Except} from 'type-fest';
import {type Styles} from '../styles.js';
import {type DOMElement} from '../dom.js';

export type Props = Except<Styles, 'textWrap'>;

/**
 * `<Box>` is an essential Ink component to build your layout. It's like `<div style="display: flex">` in the browser.
 */
const Box = forwardRef<DOMElement, PropsWithChildren<Props>>(
	({children, ...style}, ref) => {
		const {styles, ...props} = style;

		// Apply styles from styles prop if style not already set
		if (styles) {
			for (const key of Object.keys(styles)) {
				if (key === 'styles') continue;
				if (
					(props as any)[key] === undefined &&
					(styles as any)[key] !== undefined
				) {
					(props as any)[key] = (styles as any)[key];
				}
			}
		}

		// Default styles
		props.flexWrap = props.flexWrap ?? 'nowrap';
		props.flexDirection = props.flexDirection ?? 'row';
		props.flexGrow = props.flexGrow ?? 0;
		props.flexShrink = props.flexShrink ?? 1;

		return (
			<ink-box
				ref={ref}
				style={{
					...props,
					wipeBackground: props.wipeBackground ?? false,
					overflowX: props.overflowX ?? props.overflow ?? 'visible',
					overflowY: props.overflowY ?? props.overflow ?? 'visible',
				}}
			>
				{children}
			</ink-box>
		);
	},
);

Box.displayName = 'Box';

// Box.defaultProps = {
// 	flexWrap: 'nowrap',
// 	flexDirection: 'row',
// 	flexGrow: 0,
// 	flexShrink: 1,
// };

export default Box;
