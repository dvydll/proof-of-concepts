/**
 * @typedef {import('crypto').webcrypto.CryptoKey} CryptoKey
 */

import { subtle } from 'node:crypto';

export class ValidationError extends Error {}

/**
 * ### 🔑 Generar clave HMAC (para HS256)
 *
 * Para generar una clave `HMAC`, se utiliza la función `subtle.generateKey` de la API de `SubtleCrypto`.
 * - Usa el algoritmo `HMAC` y el hash `SHA-256`
 * - Usada para firmar y verificar mensajes digitales.
 * - Exportable en formato `PEM`. Por defecto `exportable = true`
 *
 * Ver mas en: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey
 */
export async function generateHMACKey(exportable = true) {
	return await subtle.generateKey(
		{ name: 'HMAC', hash: 'SHA-256' },
		exportable,
		['sign', 'verify']
	);
}

/**
 * ### 🔐 Generar clave RSA (RS256)
 *
 * Para generar una clave `RSA`, se utiliza la función `subtle.generateKey` de la API de `SubtleCrypto`.
 * - Usa el algoritmo `RSASSA-PKCS1-v1_5` y el hash `SHA-256`
 * - Longitud del módulo: 2048 bits
 * - Exponente público estándar : 65537
 * - Usada para firmar y verificar mensajes digitales.
 * - Exportable en formato `PEM`. Por defecto `exportable = true`
 *
 * Ver mas en: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey
 *
 */
export async function generateRSAKey(exportable = true) {
	const { publicKey, privateKey } = await subtle.generateKey(
		{
			name: 'RSASSA-PKCS1-v1_5',
			modulusLength: 2048,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: 'SHA-256',
		},
		exportable,
		['sign', 'verify']
	);

	return { publicKey, privateKey, kid: crypto.randomUUID() };
}

/**
 * ### 🔐 Generar clave ECDSA (ES256)
 *
 * Para generar una clave `ECDSA`, se utiliza la función `subtle.generateKey` de la API de `SubtleCrypto`.
 * - Usa el algoritmo `ECDSA` y el curve `P-256`
 * - Usada para firmar y verificar mensajes digitales.
 * - Exportable en formato `PEM`. Por defecto `exportable = true`
 *
 * Ver mas en: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey
 *
 */
export async function generateECKey(exportable = true) {
	return subtle.generateKey(
		{
			name: 'ECDSA',
			namedCurve: 'P-256',
		},
		exportable,
		['sign', 'verify']
	);
}

export class Base64Parser {
	static #textEncoder = new TextEncoder();
	// static #textDecoder = new TextDecoder();

	static b64Tob64UrlSafe(b64 = '') {
		return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
	}

	static b64UrlToB64(b64url = '') {
		return b64url
			.replace(/-/g, '+')
			.replace(/_/g, '/')
			.padEnd(Math.ceil(b64url.length / 4) * 4, '=');
	}

	/**
	 * @param {string | ArrayBuffer} input
	 */
	static encodeBase64Url(input) {
		let buffer;

		if (input instanceof ArrayBuffer) {
			buffer = Buffer.from(input);
		} else if (typeof input === 'string') {
			buffer = Buffer.from(this.#textEncoder.encode(input));
		} else {
			throw new TypeError('El argumento debe ser un ArrayBuffer o un string');
		}

		return buffer
			.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');
	}

	static decodeBase64Url(b64url = '') {
		return Buffer.from(this.b64UrlToB64(b64url), 'base64');
	}
}

/**
 * @param {Object} param
 * @param {*} param.payload
 * @param {CryptoKey} param.privateKey
 * @param {'RS256' | 'ES256'} param.algorithm
 * @param {string} param.kid
 * @returns
 */
export async function createJWT({
	payload,
	privateKey,
	kid,
	algorithm = 'RS256',
}) {
	const header =
		algorithm === 'RS256'
			? { alg: 'RS256', typ: 'JWT', kid }
			: { alg: 'ES256', typ: 'JWT', kid };

	// Codificar en Base64URL
	const encodedHeader = Base64Parser.encodeBase64Url(JSON.stringify(header));
	const encodedPayload = Base64Parser.encodeBase64Url(JSON.stringify(payload));

	const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);

	// Firmar usando RSA o ECDSA
	const signature = await subtle.sign(
		algorithm === 'RS256'
			? { name: 'RSASSA-PKCS1-v1_5' }
			: { name: 'ECDSA', hash: 'SHA-256' },
		privateKey,
		data
	);

	const encodedSignature = Base64Parser.encodeBase64Url(signature);

	return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * @param {Object} param
 * @param {string} param.token
 * @param {CryptoKey} param.publicKey
 * @param {'RS256' | 'ECDSA'} param.algorithm
 */
export async function verifyJWT({ token, publicKey, algorithm = 'RS256' }) {
	const [headerB64, payloadB64, signatureB64] = token.split('.');

	const signature = Base64Parser.decodeBase64Url(signatureB64);
	const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

	// Verificar firma con RSA o ECDSA
	const valid = await subtle.verify(
		algorithm === 'RS256'
			? { name: 'RSASSA-PKCS1-v1_5' }
			: { name: 'ECDSA', hash: 'SHA-256' },
		publicKey,
		signature,
		data
	);

	if (!valid) throw new Error('Firma inválida');

	// Decodificar payload
	const payload = Base64Parser.decodeBase64Url(payloadB64).toString('utf-8');
	return JSON.parse(payload);
}
