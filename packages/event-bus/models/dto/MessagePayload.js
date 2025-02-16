import { EventMetadata } from '../EventMetadata.js';

export class MessagePayload {
	/**
	 * @param {string?} [message]
	 */
	constructor(message) {
		this.message = message ?? '';
		this.metadata = new EventMetadata();
	}
}
