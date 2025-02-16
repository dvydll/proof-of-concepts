export class EventBus extends EventTarget {
	emit(eventName: string, detail: any): boolean;
	on(eventName: string, callback: (event: CustomEvent) => void): void;
}
export default EventBus;
