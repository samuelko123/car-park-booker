import {
	ErrorHandler,
	HttpUnauthorizedError,
} from '../../utils/ErrorHandler'
import { ApiHelper } from '../../utils/ApiHelper'
import {
	HTTP_METHOD,
	HTTP_STATUS,
} from '../../utils/constants'
import { CookieHelper } from '../../utils/CookieHelper'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.GET]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		if (req.method === HTTP_METHOD.GET) {
			try {
				const user = await ApiHelper.checkSessionToken(req)
				res.status(HTTP_STATUS.OK).json({
					username: user.username,
				})
			} catch (err) {
				if (err instanceof HttpUnauthorizedError) {
					// the session cannot be used,
					// so erase it from browser
					const cookie_obj = {
						session_token: '',
					}
					CookieHelper.deleteCookie(res, cookie_obj)

					res.status(HTTP_STATUS.NO_CONTENT).end()
				} else {
					throw err
				}
			}
		}
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}
