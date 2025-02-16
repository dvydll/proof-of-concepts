export class EventBus extends EventTarget {
	/**
	 * @type {import('./index.d.ts').EventBus['emit']}
	 */
	emit(eventName, detail) {
		return this.dispatchEvent(new CustomEvent(eventName, { detail }));
	}

	/**
	 * @type {import('./index.d.ts').EventBus['on']}
	 */
	on(eventName, callback) {
		this.addEventListener(eventName, (event) => {
			if (event instanceof CustomEvent) callback(event);
		});
	}
}

export default EventBus;
