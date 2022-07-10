import {
	ErrorHandler,
	HttpForbiddenError,
} from '../../../utils/ErrorHandler'
import { ApiHelper } from '../../../utils/ApiHelper'
import {
	HTTP_METHOD,
	HTTP_STATUS,
} from '../../../utils/constants'
import { JobDAO } from '../../../dao/JobDAO'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.GET]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		if (req.method === HTTP_METHOD.GET) {
			const user = await ApiHelper.checkSessionToken(req)
			if (user !== process.env.ADMIN_EMAIL) {
				throw HttpForbiddenError()
			}

			const arr = await JobDAO.getStat()
			const result = JSON.stringify(arr, null, 2)
			res.status(HTTP_STATUS.OK).send(result)
		}
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}
