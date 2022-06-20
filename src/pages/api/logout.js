import {
	HTTP_METHOD,
	HTTP_STATUS,
} from '../../utils/constants'
import { CookieHelper } from '../../utils/CookieHelper'
import { ErrorHandler } from '../../utils/ErrorHandler'
import { ApiHelper } from '../../utils/ApiHelper'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.POST]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		const cookie_obj = {
			session_token: '',
		}
		CookieHelper.deleteCookie(res, cookie_obj)

		res.status(HTTP_STATUS.OK).end()
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}