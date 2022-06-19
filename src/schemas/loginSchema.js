export const loginSchema = {
	type: 'object',
	minProperties: 2,
	additionalProperties: false,
	properties: {
		username: {
			type: 'string',
		},
		password: {
			type: 'string',
		},
	},
}