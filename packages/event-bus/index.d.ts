export class EventBus extends EventTarget {
	acceptedOrigin: string;
	eventHandlers: Map<string, (event: CustomEvent) => void>;
	constructor(
		acceptedOrigin: string,
		eventHandlers: Map<string, (event: CustomEvent) => void>
	);
	emit(eventName: string, detail: any): boolean;
	on(eventName: string, callback: (event: CustomEvent) => void): void;
}
export default EventBus;
