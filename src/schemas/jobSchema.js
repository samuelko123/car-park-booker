export const jobSchema = {
	type: 'object',
	required: ['date', 'from_time', 'to_time', 'lic_plate'],
	additionalProperties: false,
	properties: {
		date: {
			type: 'string',
			pattern: '^[0-9]{4}[-][0-9]{2}[-][0-9]{2}$', // match yyyy-mm-dd
		},
		from_time: {
			type: 'string',
			pattern: '^([0-1]?[0-9]|2[0-3]):[03][0]$', // match 00:00, 00:30 ... 23:30
		},
		to_time: {
			type: 'string',
			pattern: '^([0-1]?[0-9]|2[0-3]):[03][0]$',
		},
		lic_plate: {
			type: 'string',
			pattern: '^[0-9A-Z]{1,6}$',
		},
	},
}