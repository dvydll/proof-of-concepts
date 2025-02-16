export class MessagePayload {
	/**
	 * @param {string?} [message]
	 */
	constructor(message) {
		this.message = message ?? '';
		this.from = window.self.location.origin;
		this.timestamp = Date.now();
		this.traceId = crypto.randomUUID();
	}
}
