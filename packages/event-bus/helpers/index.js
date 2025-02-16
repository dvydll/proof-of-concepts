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
