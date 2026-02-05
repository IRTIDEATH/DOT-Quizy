import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
	baseURL: import.meta.env.API_URL,
	fetchOptions: {
		credentials: 'include',
	},
	plugins: [
		inferAdditionalFields({
			user: {
				role: {
					type: 'string',
					input: false,
				},
				premium: {
					type: 'boolean',
					input: false,
				},
			},
		}),
	],
});
