export class EventMetadata {
	constructor() {
		this.from = window.self.location.origin;
		this.timestamp = Date.now();
		this.traceId = crypto.randomUUID();
	}
}
