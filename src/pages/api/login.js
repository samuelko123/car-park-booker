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
			const {
				username,
				password,
			} = data
			const booker = new CarParkBooker()
			await booker.login(username, password)

			// update user record
			const hash = CryptoHelper.encrypt(password)
			const filter = { username: username }
			await UserDAO.upsert(filter, {
				username: username,
				hash: hash,
				last_active_at: new Date(),
			})

			// set session
			const session_token = CryptoHelper.encrypt(JSON.stringify({
				username: username,
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