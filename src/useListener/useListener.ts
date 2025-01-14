import EventEmitter from 'events';
import {useEffect} from 'react';

/*
 * Subscribes and unsubscribes to a listener on every render, or every dependency change
 * if provided.  Prevents re-renders from accumulating excess listeners and/or stale state.
 * */
export function useListener(
	emitter: EventEmitter,
	event: string,
	cb: (...args: any[]) => void,
	dependencies: any[] = [{}],
) {
	useEffect(() => {
		setImmediate(() => {
			emitter.on(event, cb);
		});
		return () => {
			setImmediate(() => {
				emitter.off(event, cb);
			});
		};
	}, dependencies);
}
