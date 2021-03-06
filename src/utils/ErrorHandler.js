import {
	ERROR,
	HTTP_STATUS,
} from './constants'
import { Logger } from './Logger'

export class ErrorHandler {
	static handleApiError(err, req, res) {
		const status = err.status || HTTP_STATUS.SERVER_ERROR
		if (err instanceof HttpMethodNotAllowedError) {
			res.setHeader('Allow', err.allowed_methods.join(', '))
		}

		Logger.error({
			url: req.url,
			method: req.method,
			status: status,
			message: err?.response?.error?.message || err.message || '',
		})

		res.status(status).send(err.message || ERROR.SERVER_ERROR)
	}
}

export class HttpBadRequestError extends Error {
	constructor(message) {
		super(message)
		this.status = HTTP_STATUS.BAD_REQUEST
	}
}

export class HttpUnauthorizedError extends Error {
	constructor(message) {
		super(message || ERROR.UNAUTHORIZED)
		this.status = HTTP_STATUS.UNAUTHORIZED
	}
}

export class HttpForbiddenError extends Error {
	constructor(message) {
		super(message || ERROR.FORBIDDEN)
		this.status = HTTP_STATUS.FORBIDDEN
	}
}

export class HttpNotFoundError extends Error {
	constructor(message) {
		super(message || ERROR.NOT_FOUND)
		this.status = HTTP_STATUS.NOT_FOUND
	}
}

export class HttpMethodNotAllowedError extends Error {
	constructor(allowed_methods) {
		super(ERROR.METHOD_NOT_ALLOWED)
		this.status = HTTP_STATUS.METHOD_NOT_ALLOWED
		this.allowed_methods = allowed_methods
	}
}

export class ValidationError extends Error {
	constructor(message) {
		super(typeof message === 'string' ? message : 'Something went wrong\n' + JSON.stringify(message, null, 2))
		this.status = HTTP_STATUS.BAD_REQUEST
	}
}