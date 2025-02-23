export type JWKS = {
	keys: JsonWebKey[];
};

export type JsonWebKey = {
	kid: string;
	kty: 'RSA' | 'EC' | 'OKP' | 'oct';
	alg:
		| 'RS256'
		| 'RS384'
		| 'RS512'
		| 'PS256'
		| 'PS384'
		| 'PS512'
		| 'ES256'
		| 'ES384'
		| 'ES512'
		| 'EdDSA'
		| 'RSA1_5'
		| 'RSA-OAEP'
		| 'RSA-OAEP-256'
		| 'RSA-OAEP-384'
		| 'RSA-OAEP-512'
		| 'A128KW'
		| 'A192KW'
		| 'A256KW'
		| 'dir'
		| 'A128GCMKW'
		| 'A192GCMKW'
		| 'A256GCMKW'
		| 'PBES2-HS256+A128KW'
		| 'PBES2-HS384+A192KW'
		| 'PBES2-HS512+A256KW';
	use: 'sig' | 'enc';
	n: string;
	e: string;
	x5c?: string[];
	x5t?: string;
	'x5t#S256'?: string;
};
