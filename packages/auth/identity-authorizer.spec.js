import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { validSessionIdentity } from './identity-authorizer.js';

describe('Identity Authorizer', () => {
	vi.mock('#aws/aws.js', () => ({
		awsGetParameter: vi.fn().mockResolvedValue({
			Parameter: {
				Value: JSON.stringify(
					JSON.parse(readFileSync(resolve('src/auth/test-jwks.json'), 'utf-8'))
				),
			},
		}),
	}));

	it('should return true when the token is valid', async () => {
		const validToken =
			'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjUxYjQyYTZlLTRjMGYtNGQ2NC1hYTc3LTkxMTFmYjJlNWZkOSJ9.eyJpZCI6IjEyMzQ1Njc4In0.wDthdEAWkgb5cu1HGcnLS8GVdpWnm8NE4EwX5exr13Yg02kzeT5qQsY_Zrb59qddYU_7cXp6W6KVJgoRqbR2qWl4xpwjP3ZCIFSNq59gtt0L2hlQvl6lqv50WyxyP1AwoFHsMgMG-mwCdJxKBi2auJsEG5EW45AvKt70PhgGADOdMUgkkWfmEk8XSVd66ljkv9Uk1wVUnkDp2a7H27W4X6ynpWyaNGfyAn5izvM5RAPTiorb3b_Mc5T90Fvm95VQ3tgEbF09W47UdFZ76Dr9jIrECa7_n5Pn6n7f1qxchvNER0T9x2y6pIqKU8-P1c_s1f7suWdHn8NbToGkraw5Ng';
		const result = await validSessionIdentity({ token: validToken });
		expect(result).toBe(true);
	});

	it('should return false when the token is invalid', async () => {
		const invalidToken =
			'eyJhbGciOiJSUzI1NiIsImtpZCI6InRlc3Qta2V5LTEifQ.eyJ1c2VySWQiOiI3ODkwMTIiLCJyb2xlIjoidXNlciIsImlhdCI6MTcwMDg1NTIwMH0.WRONGSIGNATURE';
		const result = await validSessionIdentity({ token: invalidToken });
		expect(result).toBe(false);
	});
});
