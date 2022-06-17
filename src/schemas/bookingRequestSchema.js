export const bookingRequestSchema = {
	type: 'object',
	minProperties: 3,
	additionalProperties: false,
	properties: {
		username: {
			type: 'string',
		},
		password: {
			type: 'string',
		},
		date: {
			type: 'string',
			pattern: '^[0-9]{4}[.][0-9]{2}[.][0-9]{2}$',
		},
	},
}