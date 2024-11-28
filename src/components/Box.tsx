import React, {
	forwardRef,
	useEffect,
	useRef,
	useState,
	type PropsWithChildren,
} from 'react';
import {type Except} from 'type-fest';
import {type Styles} from '../styles.js';
import {type DOMElement} from '../dom.js';
import {usePageFocus} from '../FocusContext/FocusContext.js';
import {T as MouseTypes} from '../Stdin/Mouse.js';
import ElementPosition from '../Stdin/ElementPosition.js';
import {STDIN} from '../Stdin/Stdin.js';
import {randomUUID} from 'crypto';
import {logger} from '../index.js';

export type ClickEvent = MouseTypes.Event;

export type Props = Except<Styles, 'textWrap'>;

/**
 * `<Box>` is an essential Ink component to build your layout. It's like `<div style="display: flex">` in the browser.
 */
const Box = forwardRef<DOMElement, PropsWithChildren<Props>>(
	({children, ...style}, ref) => {
		const {styles, ...props} = style;

		const [leftActive, setLeftActive] = useState(false);
		const [rightActive, setRightActive] = useState(false);

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

		// Overwrite props if left active
		if (leftActive && (styles?.leftActive || props.leftActive)) {
			if (styles?.leftActive) {
				for (const key in styles.leftActive) {
					(props as any)[key] = (styles.leftActive as any)[key];
				}
			}

			if (props.leftActive) {
				for (const key in props.leftActive) {
					(props as any)[key] = (props.leftActive as any)[key];
				}
			}
		}

		// Overwrite props if leftActive
		if (rightActive && (styles?.rightActive || props.rightActive)) {
			if (styles?.rightActive) {
				for (const key in styles.rightActive) {
					(props as any)[key] = (styles.rightActive as any)[key];
				}
			}

			if (props.rightActive) {
				for (const key in props.rightActive) {
					(props as any)[key] = (props.rightActive as any)[key];
				}
			}
		}

		const [ID] = useState(randomUUID());
		const isPageFocus = usePageFocus();

		useEffect(() => {
			return () => {
				STDIN.Mouse.unsubscribeComponent(ID);
			};
		}, []);

		// Default styles
		props.flexWrap = props.flexWrap ?? 'nowrap';
		props.flexDirection = props.flexDirection ?? 'row';
		props.flexGrow = props.flexGrow ?? 0;
		props.flexShrink = props.flexShrink ?? 1;
		props.zIndex = props.zIndex ?? 'auto';

		return (
			<ink-box
				ref={ref}
				style={{
					...props,
					overflowX: props.overflowX ?? props.overflow ?? 'visible',
					overflowY: props.overflowY ?? props.overflow ?? 'visible',
				}}
				ID={ID}
				isPageFocus={isPageFocus}
				setLeftActive={setLeftActive}
				setRightActive={setRightActive}
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
