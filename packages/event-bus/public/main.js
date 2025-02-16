import { $, dateTimeFormatter } from '../helpers/index.js';
import EventBus from '../index.js';
import { MessagePayload } from '../models/dto/MessagePayload.js';

const ACCEPTED_IFRAME_ORIGIN = 'http://localhost:5500';
const ACCEPTED_EVENT_NAMES = ['messageToIframe', 'messageToTop'];

const eventBus = new EventBus();

const $form = /** @type {HTMLFormElement} */ ($('form'));
const $messageInput = /** @type {HTMLInputElement} */ (
	$('[name="message"]', $form)
);
const $iframe = /** @type {HTMLIFrameElement} */ ($('iframe'));
const $dl = $('dl');
const $dlTemplate = /** @type {HTMLTemplateElement} */ ($('#dlEntryTemplate'));

/**
 *
 * @param {*} EventPayload
 */
function pushMessage({ message, timestamp, traceId, from }) {
	const $dlEntry = /** @type {HTMLElement} */ (
		$dlTemplate.content.cloneNode(true)
	);
	const $dlEntryTerm = $('dt', $dlEntry);
	const $dlEntryDesc = $('dd', $dlEntry);
	const $article = document.createElement('article');
	$dlEntryTerm?.setAttribute('data-trace-id', traceId);
	$dlEntryTerm?.setAttribute('data-timestamp', timestamp);
	$dlEntryDesc?.setAttribute('data-from', from);
	$dlEntryTerm?.insertAdjacentText('afterbegin', traceId);
	$('small', $dlEntryTerm ?? document)?.insertAdjacentText(
		'beforeend',
		dateTimeFormatter.format(new Date(timestamp))
	);
	$dlEntryDesc?.insertAdjacentText('beforeend', message);
	$article?.appendChild($dlEntry);
	$dl?.insertAdjacentElement('afterbegin', $article);
}

// Escuchar eventos del iframe
window.self.addEventListener('message', (event) => {
	// Asegura que venga del iframe
	if (event.origin !== ACCEPTED_IFRAME_ORIGIN) return;

	const { eventName, payload } = event.data;
	if (!ACCEPTED_EVENT_NAMES.includes(eventName)) return;

	console.debug('[top-frame]', { eventName, payload });
	eventBus.emit(eventName, payload);
});

ACCEPTED_EVENT_NAMES.forEach((eventName) => {
	// Enviar eventos al iframe
	eventBus.on(eventName, (event) => {
		if (event.type === 'messageToTop') return pushMessage(event.detail);
		$iframe?.contentWindow?.postMessage(
			{
				eventName: event.type,
				payload: event.detail,
			},
			ACCEPTED_IFRAME_ORIGIN
		);
	});
});

// Ejemplo: enviar mensaje al iframe
$form?.addEventListener('submit', (event) => {
	event.preventDefault();
	eventBus.emit('messageToIframe', new MessagePayload($messageInput?.value));
});
