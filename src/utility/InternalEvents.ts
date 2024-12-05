export default class InternalEvents {
	public static Prefix = '$$INTERNAL_EVENT';

	public static getInternalEvent(event: string, ID: string = ''): string {
		if (ID === '') return event;
		return `${InternalEvents.Prefix}_${event}_${ID}`;
	}

	public static toID(scopedEvent: string): string {
		const ID = scopedEvent.split('_')[2];
		if (!ID) {
			throw new Error('Cannot extract ID from non-scoped event');
		}
		return ID;
	}

	public static toEvent(scopedEvent: string): string {
		const event = scopedEvent.split('_')[1];
		if (!event) {
			throw new Error('Cannot extract event name from non-scoped event');
		}
		return event;
	}
}
