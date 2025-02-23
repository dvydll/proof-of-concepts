import { styleText } from 'node:util';

/**
 * @param {Parameters<typeof styleText>[0]} format
 * @returns {(text: string) => string}
 */
export const colorizeText = (format) => (text) => styleText(format, text);
export const boldMagenta = colorizeText(['bold', 'magenta']);
export const boldGreen = colorizeText(['bold', 'green']);
export const boldYellow = colorizeText(['bold', 'yellow']);
