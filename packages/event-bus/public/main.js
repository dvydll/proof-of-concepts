import { $, publishEvent, pushMessage } from '../helpers/index.js';
import EventBus from '../index.js';
import { MessagePayload } from '../models/dto/MessagePayload.js';

// ------------------------------
// Variables globales
// ------------------------------
const ACCEPTED_IFRAME_ORIGIN = 'http://localhost:5500';

// DOM
const $form = /** @type {HTMLFormElement} */ ($('form'));
const $messageInput = /** @type {HTMLInputElement} */ (
	$('[name="message"]', $form)
);
const $iframe = /** @type {HTMLIFrameElement} */ ($('iframe'));
const $dl = /** @type {HTMLDListElement} */ ($('dl'));
const $dlTemplate = /** @type {HTMLTemplateElement} */ ($('#dlEntryTemplate'));

// EventBus
/**
 * @type {Map<string, (event: CustomEvent) => void>}
 */
const eventHandlers = new Map();
eventHandlers.set('toTop/message', ({ detail }) =>
	pushMessage($dlTemplate, $dl, detail)
);
eventHandlers.set(
	'toIframe/message',
	publishEvent(ACCEPTED_IFRAME_ORIGIN, $iframe.contentWindow)
);
const eventBus = new EventBus(ACCEPTED_IFRAME_ORIGIN, eventHandlers);

// Ejemplo: enviar mensaje al iframe
$form?.addEventListener('submit', (event) => {
	event.preventDefault();
	eventBus.emit('toIframe/message', new MessagePayload($messageInput?.value));
});
