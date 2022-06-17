import Ajv from 'ajv'
import { ValidationError } from './ErrorHandler'

export class Validator {
	static _ajv = new Ajv({
		removeAdditional: false,
		useDefaults: true,
		coerceTypes: true,
		allErrors: true,
		logger: false,
	})

	static validate(schema, obj) {
		this._ajv.compile(schema)
		const is_valid = this._ajv.validate(schema, obj)
		if (!is_valid) {
			const errors = this._ajv.errors
			throw new ValidationError(errors)
		}

		return obj
	}
}