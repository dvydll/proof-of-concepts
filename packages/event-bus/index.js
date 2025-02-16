export class EventBus extends EventTarget {
	/**
	 * @param {string} acceptedOrigin
	 * @param {Map<string, (event: CustomEvent) => void>} eventHandlers
	 */
	constructor(acceptedOrigin, eventHandlers) {
		super();
		this.acceptedOrigin = acceptedOrigin;
		this.eventHandlers = eventHandlers;

		// Escuchar eventos del iframe
		window.self.addEventListener('message', (event) => {
			// Asegura que venga del origen aceptado
			if (event.origin !== acceptedOrigin) return;

			const { eventName, payload } = event.data;

			// Asegurar que el evento sea de un eventHandler registrado
			if (!Array.from(this.eventHandlers.keys()).includes(eventName)) return;

			console.debug(`[Recived from ${acceptedOrigin}]`, { eventName, payload });
			this.emit(eventName, payload);
		});

		// Añadir eventHandlers al eventBus
		this.eventHandlers.forEach((handler, eventName) => {
			this.on(eventName, handler);
		});
	}

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
