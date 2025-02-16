export const dateTimeFormatter = new Intl.DateTimeFormat(['es-ES'], {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	weekday: 'long',
});

/**
 * Alias de `document.querySelector`
 * @param {Parameters<ParentNode['querySelector']>[0]} selectors
 * @param {ParentNode} [parentNode]
 * @returns {ReturnType<ParentNode['querySelector']>}
 */
export const $ = (selectors, parentNode = document) =>
	parentNode.querySelector(selectors);

/**
 *
 * @param {HTMLTemplateElement} $dlTemplate
 * @param {HTMLDListElement} $dl
 * @param {import('../models/dto/MessagePayload.js').MessagePayload} MessagePayload
 */
export const pushMessage = (
	$dlTemplate,
	$dl,
	{ message, metadata: { timestamp, traceId, from } }
) => {
	const $dlEntry = /** @type {HTMLElement} */ (
		$dlTemplate.content.cloneNode(true)
	);
	const $dlEntryTerm = $('dt', $dlEntry);
	const $dlEntryDesc = $('dd', $dlEntry);
	const $article = document.createElement('article');
	$dlEntryTerm?.setAttribute('data-trace-id', traceId);
	$dlEntryTerm?.setAttribute('data-timestamp', timestamp.toString());
	$dlEntryDesc?.setAttribute('data-from', from);
	$dlEntryTerm?.insertAdjacentText('afterbegin', traceId);
	$('small', $dlEntryTerm ?? document)?.insertAdjacentText(
		'beforeend',
		dateTimeFormatter.format(new Date(timestamp))
	);
	$dlEntryDesc?.insertAdjacentText('beforeend', message);
	$article?.appendChild($dlEntry);
	$dl?.insertAdjacentElement('afterbegin', $article);
};

/**
 *
 * @param {string} targetOrigin
 * @param {Window |null} [targetWindow]
 * @returns
 */
export const publishEvent =
	(targetOrigin, targetWindow) =>
	/**
	 * @param {CustomEvent} event
	 */
	({ type, detail }) => {
		targetWindow?.postMessage(
			{
				eventName: type,
				payload: detail,
			},
			targetOrigin
		);
	};
