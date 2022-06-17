import { HttpMethodNotAllowedError } from './ErrorHandler'

export class ApiHelper {
	static checkHttpMethod(req, allowed_methods) {
		if (!allowed_methods.includes(req.method)) {
			throw new HttpMethodNotAllowedError(allowed_methods)
		}
	}
}