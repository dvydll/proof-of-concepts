/**
 * @typedef {import('aws-lambda').APIGatewayTokenAuthorizerEvent} APIGatewayTokenAuthorizerEvent
 * @typedef {import('aws-lambda').Context} Context
 */

import { readFileSync } from 'node:fs';
import { Base64Parser, ValidationError } from './helpers.js';

/**
 *
 * @param {*} principalId
 * @param {*} effect
 * @param {*} resource
 * @returns
 */
export const generatePolicy = (principalId, effect, resource) => {
	if (!effect || !resource) return { principalId };

	const policyDocument = {
		Version: '2012-10-17', // default version
		Statement: [
			{
				Action: 'execute-api:Invoke', // default action
				Effect: effect,
				Resource: resource,
			},
		],
	};

	return { principalId, policyDocument };
};

/**
 * @param {string} principalId
 * @param {string} resource
 */
export const generateAllow = (principalId, resource) =>
	generatePolicy(principalId, 'Allow', resource);

/**
 * @param {string} principalId
 * @param {string} resource
 */
export const generateDeny = (principalId, resource) =>
	generatePolicy(principalId, 'Deny', resource);

/**
 * @param {Object} param
 * @param {string} param.token
 */
export const validSessionIdentity = async ({ token }) => {
	try {
		/**
		 * @type {import('./index.d.ts').JWKS}
		 */
		const jwks = await Promise.resolve(readFileSync('./test-jwks.json')).then(
			(jwks) => JSON.parse(jwks.toString('utf-8'))
		);
		const [headerB64, payloadB64, signatureB64] = token.split('.');

		if (!headerB64 || !payloadB64 || !signatureB64) {
			throw new ValidationError('JWT inválido', {
				cause: { headerB64, payloadB64, signatureB64 },
			});
		}

		const headerStr = Base64Parser.decodeBase64Url(headerB64).toString('utf-8');
		const { kid } = JSON.parse(headerStr);
		const jwk = jwks.keys.find((jwk) => jwk.kid === kid);

		if (!jwk)
			throw new ValidationError('Clave de JWT inválida', { cause: { kid } });

		const publicKey = await crypto.subtle.importKey(
			'jwk', // Formato de entrada
			jwk, // Clave en formato JWK
			{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, // Algoritmo
			false, // No se puede exportar
			['verify'] // Solo para verificación
		);
		const signature = Base64Parser.decodeBase64Url(signatureB64);
		const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

		console.time('[validSessionIdentity] Tiempo validar Identity');
		const isVerified = await crypto.subtle.verify(
			{ name: 'RSASSA-PKCS1-v1_5' },
			publicKey,
			signature,
			data
		);
		return isVerified;
	} catch (error) {
		console.error('[validSessionIdentity]', error);
		return false;
	} finally {
		console.timeEnd('[validSessionIdentity] Tiempo validar Identity');
	}
};

/**
 * @param {APIGatewayTokenAuthorizerEvent} event
 * @param {Context} context
 */
export const identityAuthorizer = async (
	{ authorizationToken, methodArn },
	{ awsRequestId }
) => {
	try {
		const token = Buffer.from(authorizationToken, 'base64').toString('utf-8');
		const parsedToken = JSON.parse(token);
		const { id } = parsedToken;

		console.info('[identityAuthorizer]', {
			methodArn,
			authorizationToken,
			parsedToken,
			awsRequestId,
		});

		if (id) {
			console.info('[identityAuthorizer] Verificando por Identity', id);
			return (await validSessionIdentity({ token: id }))
				? generateAllow('me', methodArn)
				: generateDeny('me', methodArn);
		}

		return generateDeny('me', methodArn);
	} catch (error) {
		console.error('[identityAuthorizer] Not allowed', error);
		return generateDeny('me', methodArn);
	}
};
