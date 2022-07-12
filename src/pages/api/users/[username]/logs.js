import {
	ErrorHandler,
	HttpBadRequestError,
	HttpForbiddenError,
} from '../../../../utils/ErrorHandler'
import { ApiHelper } from '../../../../utils/ApiHelper'
import {
	HTTP_METHOD,
	HTTP_STATUS,
} from '../../../../utils/constants'
import { UserDAO } from '../../../../dao/UserDAO'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.GET]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		if (req.method === HTTP_METHOD.GET) {
			const user = await ApiHelper.checkSessionToken(req)
			if (user?.username !== process.env.ADMIN_EMAIL) {
				throw new HttpForbiddenError()
			}

			const { username } = req.query
			if (!username) {
				throw new HttpBadRequestError()
			}

			const arr = await UserDAO.getLogs(username)
			const result = JSON.stringify(arr, null, 2)

			res.status(HTTP_STATUS.OK).send(result)
		}
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}
