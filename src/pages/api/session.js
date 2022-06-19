import { ErrorHandler } from '../../utils/ErrorHandler'
import { ApiHelper } from '../../utils/ApiHelper'
import {
	HTTP_METHOD,
	HTTP_STATUS,
} from '../../utils/constants'
import { CryptoHelper } from '../../utils/CryptoHelper'
import { UserDAO } from '../../dao/UserDAO'
import { CookieHelper } from '../../utils/CookieHelper'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.GET]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		if (req.method === HTTP_METHOD.GET) {
			// check credentials
			const { session_token } = req.cookies
			if (!session_token) {
				res.status(HTTP_STATUS.NO_CONTENT).end()
				return
			}

			const decrypted = JSON.parse(CryptoHelper.decrypt(session_token))
			const { username } = decrypted
			if (!username) {
				res.status(HTTP_STATUS.NO_CONTENT).end()
				return
			}

			const filter = { username: username }
			const user = await UserDAO.get(filter, ['username'])
			if(!user) {
				res.status(HTTP_STATUS.NO_CONTENT).end()
				return
			}

			// update user record
			await UserDAO.upsert(filter, {
				last_active_at: new Date(),
			})

			// done
			res.status(HTTP_STATUS.OK).send({
				username: username,
			})
		}
	} catch (err) {
		// the session cannot be used,
		// so erase it from browser
		const cookie_obj = {
			session_token: '',
		}
		CookieHelper.deleteCookie(res, cookie_obj)

		// handle error
		ErrorHandler.handleApiError(err, req, res)
	}
}
