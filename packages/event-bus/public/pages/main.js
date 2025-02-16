import { $, publishEvent, pushMessage } from '../../helpers/index.js';
import EventBus from '../../index.js';
import { MessagePayload } from '../../models/dto/MessagePayload.js';

// ------------------------------
// Variables globales
// ------------------------------
const ACCEPTED_PARENT_ORIGIN = 'http://localhost:5500';

// DOM
const $form = $('#iframeForm');
const $messageInput = /** @type {HTMLInputElement} */ (
	$('[name="message"]', $form ?? document)
);
const $dl = /** @type {HTMLDListElement} */ ($('dl'));
const $dlTemplate = /** @type {HTMLTemplateElement} */ ($('#dlEntryTemplate'));

// EventBus
/**
 * @type {Map<string, (event: CustomEvent) => void>}
 */
const eventHandlers = new Map();
eventHandlers.set('toIframe/message', ({ detail }) =>
	pushMessage($dlTemplate, $dl, detail)
);
eventHandlers.set(
	'toTop/message',
	publishEvent(ACCEPTED_PARENT_ORIGIN, window.parent)
);
const eventBus = new EventBus(ACCEPTED_PARENT_ORIGIN, eventHandlers);

// Ejemplo: enviar mensaje al top-frame
$form?.addEventListener('submit', (event) => {
	event.preventDefault();
	eventBus.emit('toTop/message', new MessagePayload($messageInput?.value));
});
