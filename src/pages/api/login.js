import { ErrorHandler } from '../../utils/ErrorHandler'
import { ApiHelper } from '../../utils/ApiHelper'
import {
	HTTP_METHOD,
	HTTP_STATUS,
} from '../../utils/constants'
import { Validator } from '../../utils/Validator'
import { CarParkBooker } from '../../utils/CarParkBooker'
import { loginSchema } from '../../schemas/loginSchema'
import { CryptoHelper } from '../../utils/CryptoHelper'
import { UserDAO } from '../../dao/UserDAO'
import { CookieHelper } from '../../utils/CookieHelper'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.POST]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		if (req.method === HTTP_METHOD.POST) {
			// validate data format
			const data = req.body
			Validator.validate(loginSchema, data)

			// check credentials
			const username = (data.username || '').toLowerCase()
			const password = data.password

			const booker = new CarParkBooker(username, password)
			const cookie = await booker.login()

			// update user record
			const hash = CryptoHelper.encrypt(password)
			const filter = { username: username }
			UserDAO.upsert(filter, {
				username: username,
				hash: hash,
				cookie: cookie,
				last_active_at: new Date(Date.now()),
			})

			// set session
			const session_token = CryptoHelper.encrypt(JSON.stringify({
				username: username,
				hash: hash,
				timestamp: new Date(),
			}))
			const cookie_obj = {
				session_token: session_token,
			}
			CookieHelper.setCookie(res, cookie_obj, '/', 24 * 60 * 60 * 1000) // 24 hours

			// done
			res.status(HTTP_STATUS.OK).end()
		}
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}
