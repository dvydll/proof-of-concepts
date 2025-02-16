import { $, dateTimeFormatter } from '../../helpers/index.js';
import EventBus from '../../index.js';
import { MessagePayload } from '../../models/dto/MessagePayload.js';

const ACCEPTED_EVENT_NAMES = ['messageToIframe', 'messageToTop'];

const eventBus = new EventBus();

const $form = $('#iframeForm');
const $messageInput = /** @type {HTMLInputElement} */ (
	$('[name="message"]', $form ?? document)
);
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

// Escuchar eventos del top-frame
window.self.addEventListener('message', (event) => {
	// Asegurar que venga del top-frame. TODO: limitar top-frame a un dominio
	if (event.origin !== window.parent.location.origin) return;

	const { eventName, payload } = event.data;
	if (!ACCEPTED_EVENT_NAMES.includes(eventName)) return;

	console.debug('[iframe]', { eventName, payload });
	eventBus.emit(eventName, payload);
});

// Enviar eventos al top-frame
ACCEPTED_EVENT_NAMES.forEach((eventName) => {
	eventBus.on(eventName, (event) => {
		if (event.type === 'messageToIframe') return pushMessage(event.detail);
		window.parent.postMessage(
			{
				eventName: event.type,
				payload: event.detail,
			},
			window.parent.location.origin
		);
	});
});

// Ejemplo: enviar mensaje al top-frame
$form?.addEventListener('submit', (event) => {
	event.preventDefault();

	eventBus.emit('messageToTop', new MessagePayload($messageInput?.value));
});
