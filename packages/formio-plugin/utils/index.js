export * from './async-function.extension.js';
export * from './idx.db.js';
export const on = (element) => Element.prototype.addEventListener.bind(element);
export const $ = (selector = '', parentNode = document) => {
  const el = parentNode.querySelector(selector);
  el && (el.on = on(el));
  return el;
};
export const $$ = (selector = '', parentNode = document) => {
  const els = parentNode.querySelectorAll(selector);
  Array.from(els).forEach((e) => (e.on = on(e)));
  return els;
};